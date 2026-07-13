import { z } from "zod";
import { UnitOfMeasure } from "@/generated/prisma/enums";

export const unitOfMeasureSchema = z.enum([
  UnitOfMeasure.PIECE,
  UnitOfMeasure.GRAM,
  UnitOfMeasure.KILOGRAM,
  UnitOfMeasure.MILLILITER,
  UnitOfMeasure.LITER,
]);

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(200),
  brand: z.string().trim().min(1).max(200).nullable().optional(),
  barcode: z.string().trim().min(1).max(64).nullable().optional(),
  imageUrl: z.string().trim().min(1).max(500).nullable().optional(),
  storageHint: z.string().trim().min(1).max(500).nullable().optional(),
  unit: unitOfMeasureSchema.default(UnitOfMeasure.PIECE),
  defaultShelfLifeDays: z.number().int().positive().nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();
