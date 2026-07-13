import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { parseId } from "@/lib/parse-id";
import { updateProductSchema } from "@/lib/validation/product";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return jsonError("Prodotto non trovato", 404);

  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    const data = updateProductSchema.parse(await request.json());
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
