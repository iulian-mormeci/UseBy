import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { parseId } from "@/lib/parse-id";
import { updatePendingProductSubmissionSchema } from "@/lib/validation/pending-product-submission";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  const submission = await prisma.pendingProductSubmission.findUnique({
    where: { id },
    include: { product: true },
  });
  if (!submission) return jsonError("Segnalazione non trovata", 404);

  return NextResponse.json(submission);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    const data = updatePendingProductSubmissionSchema.parse(await request.json());
    const submission = await prisma.pendingProductSubmission.update({
      where: { id },
      data,
      include: { product: true },
    });
    return NextResponse.json(submission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    await prisma.pendingProductSubmission.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
