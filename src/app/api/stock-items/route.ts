import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";
import { createStockItemSchema } from "@/lib/validation/stock-item";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");
  const productId = searchParams.get("productId");
  const expiringWithinDays = searchParams.get("expiringWithinDays");

  const stockItems = await prisma.stockItem.findMany({
    where: {
      ...(locationId ? { locationId: Number(locationId) } : {}),
      ...(productId ? { productId: Number(productId) } : {}),
      ...(expiringWithinDays
        ? {
            expiryDate: {
              lte: new Date(Date.now() + Number(expiringWithinDays) * 24 * 3600 * 1000),
            },
          }
        : {}),
    },
    orderBy: [{ expiryDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    include: { product: { include: { category: true } }, location: true },
  });
  return NextResponse.json(stockItems);
}

export async function POST(request: NextRequest) {
  try {
    const data = createStockItemSchema.parse(await request.json());
    const stockItem = await prisma.stockItem.create({
      data,
      include: { product: true, location: true },
    });
    return NextResponse.json(stockItem, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
