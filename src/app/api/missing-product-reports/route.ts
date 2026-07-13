import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";
import {
  createMissingProductReportSchema,
  missingProductReportStatusSchema,
} from "@/lib/validation/missing-product-report";
import { sendMissingProductEmail } from "@/lib/mailer";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const statusResult = statusParam ? missingProductReportStatusSchema.safeParse(statusParam) : null;

  const reports = await prisma.missingProductReport.findMany({
    where: statusResult?.success ? { status: statusResult.data } : undefined,
    orderBy: { createdAt: "desc" },
    include: { resolvedProduct: true },
  });
  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  try {
    const data = createMissingProductReportSchema.parse(await request.json());
    const report = await prisma.missingProductReport.create({ data });

    try {
      await sendMissingProductEmail(report);
      const updated = await prisma.missingProductReport.update({
        where: { id: report.id },
        data: { emailedAt: new Date() },
      });
      return NextResponse.json(updated, { status: 201 });
    } catch (emailError) {
      console.error("Failed to send missing product report email:", emailError);
      return NextResponse.json(report, { status: 201 });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
