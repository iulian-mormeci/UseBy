import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";
import {
  createPendingProductSubmissionSchema,
  pendingProductSubmissionStatusSchema,
} from "@/lib/validation/pending-product-submission";
import { sendPendingProductSubmissionEmail } from "@/lib/mailer";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const statusResult = statusParam
    ? pendingProductSubmissionStatusSchema.safeParse(statusParam)
    : null;

  const submissions = await prisma.pendingProductSubmission.findMany({
    where: statusResult?.success ? { status: statusResult.data } : undefined,
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });
  return NextResponse.json(submissions);
}

export async function POST(request: NextRequest) {
  try {
    const data = createPendingProductSubmissionSchema.parse(await request.json());
    const { barcode, ...productFields } = data;

    const product = await prisma.product.create({
      data: { ...productFields, barcode },
    });

    const submission = await prisma.pendingProductSubmission.create({
      data: { barcode, productId: product.id },
    });

    try {
      await sendPendingProductSubmissionEmail({
        id: submission.id,
        barcode,
        product: {
          name: product.name,
          brand: product.brand,
          imageUrl: product.imageUrl,
          storageHint: product.storageHint,
        },
      });
      const updated = await prisma.pendingProductSubmission.update({
        where: { id: submission.id },
        data: { emailedAt: new Date(), status: "EMAILED" },
      });
      return NextResponse.json({ product, submission: updated }, { status: 201 });
    } catch (emailError) {
      console.error("Failed to send pending product submission email:", emailError);
      return NextResponse.json({ product, submission }, { status: 201 });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
