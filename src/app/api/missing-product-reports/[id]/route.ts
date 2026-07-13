import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { parseId } from "@/lib/parse-id";
import { updateMissingProductReportSchema } from "@/lib/validation/missing-product-report";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  const report = await prisma.missingProductReport.findUnique({
    where: { id },
    include: { resolvedProduct: true },
  });
  if (!report) return jsonError("Segnalazione non trovata", 404);

  return NextResponse.json(report);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    const data = updateMissingProductReportSchema.parse(await request.json());
    const report = await prisma.missingProductReport.update({
      where: { id },
      data,
      include: { resolvedProduct: true },
    });
    return NextResponse.json(report);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    await prisma.missingProductReport.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
