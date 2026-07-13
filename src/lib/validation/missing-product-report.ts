import { z } from "zod";
import { MissingProductReportStatus } from "@/generated/prisma/enums";

export const missingProductReportStatusSchema = z.enum([
  MissingProductReportStatus.PENDING,
  MissingProductReportStatus.RESOLVED,
  MissingProductReportStatus.REJECTED,
]);

export const createMissingProductReportSchema = z.object({
  requestedName: z.string().trim().min(1, "Il nome è obbligatorio").max(200),
  note: z.string().trim().min(1).max(1000).nullable().optional(),
});

export const updateMissingProductReportSchema = z.object({
  status: missingProductReportStatusSchema.optional(),
  resolvedProductId: z.number().int().positive().nullable().optional(),
});
