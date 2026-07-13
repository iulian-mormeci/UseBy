import { z } from "zod";
import { PendingProductSubmissionStatus } from "@/generated/prisma/enums";
import { unitOfMeasureSchema } from "@/lib/validation/product";

export const pendingProductSubmissionStatusSchema = z.enum([
  PendingProductSubmissionStatus.PENDING,
  PendingProductSubmissionStatus.EMAILED,
  PendingProductSubmissionStatus.INCLUDED,
  PendingProductSubmissionStatus.REJECTED,
]);

export const createPendingProductSubmissionSchema = z.object({
  barcode: z.string().trim().min(1, "Il codice a barre è obbligatorio").max(64),
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(200),
  brand: z.string().trim().min(1).max(200).nullable().optional(),
  imageUrl: z.string().trim().min(1).max(500).nullable().optional(),
  storageHint: z.string().trim().min(1).max(500).nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  unit: unitOfMeasureSchema.optional(),
});

export const updatePendingProductSubmissionSchema = z.object({
  status: pendingProductSubmissionStatusSchema,
});
