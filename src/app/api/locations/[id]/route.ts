import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { parseId } from "@/lib/parse-id";
import { updateLocationSchema } from "@/lib/validation/location";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) return jsonError("Ubicazione non trovata", 404);

  return NextResponse.json(location);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    const data = updateLocationSchema.parse(await request.json());
    const location = await prisma.location.update({ where: { id }, data });
    return NextResponse.json(location);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    await prisma.location.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
