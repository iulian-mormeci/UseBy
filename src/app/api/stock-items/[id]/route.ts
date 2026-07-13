import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { parseId } from "@/lib/parse-id";
import { updateStockItemSchema } from "@/lib/validation/stock-item";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  const stockItem = await prisma.stockItem.findUnique({
    where: { id },
    include: { product: true, location: true },
  });
  if (!stockItem) return jsonError("Prodotto in dispensa non trovato", 404);

  return NextResponse.json(stockItem);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    const data = updateStockItemSchema.parse(await request.json());
    const stockItem = await prisma.stockItem.update({
      where: { id },
      data,
      include: { product: true, location: true },
    });
    return NextResponse.json(stockItem);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    await prisma.stockItem.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
