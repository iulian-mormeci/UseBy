import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

type OpenFoodFactsResponse = {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    image_url?: string;
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode")?.trim();
  if (!barcode) return jsonError("Parametro barcode mancante", 400);

  const localProduct = await prisma.product.findUnique({
    where: { barcode },
    include: { category: true },
  });
  if (localProduct) {
    return NextResponse.json({ source: "local", product: localProduct });
  }

  try {
    const offRes = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      { headers: { "User-Agent": "UseBy self-hosted pantry app - https://github.com" } },
    );

    if (offRes.ok) {
      const data: OpenFoodFactsResponse = await offRes.json();
      if (data.status === 1 && data.product?.product_name) {
        return NextResponse.json({
          source: "openfoodfacts",
          product: {
            barcode,
            name: data.product.product_name,
            brand: data.product.brands ? data.product.brands.split(",")[0].trim() : null,
            imageUrl: data.product.image_url ?? null,
          },
        });
      }
    }
  } catch (error) {
    console.error("Open Food Facts lookup failed:", error);
  }

  return NextResponse.json({ source: "not_found", barcode });
}
