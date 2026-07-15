import { z } from "zod";
import { ExpiryType } from "@/generated/prisma/enums";

export const expiryTypeSchema = z.enum([ExpiryType.USE_BY, ExpiryType.BEST_BEFORE]);

export const createStockItemSchema = z.object({
  productId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  zoneId: z.number().int().positive().nullable().optional(),
  quantity: z.coerce.number().positive().default(1),
  initialQuantity: z.coerce.number().positive().nullable().optional(),
  currentQuantity: z.coerce.number().min(0).nullable().optional(),
  expiryDate: z.coerce.date().nullable().optional(),
  expiryType: expiryTypeSchema.default(ExpiryType.USE_BY),
  leadDays: z.number().int().min(0).nullable().optional(),
  purchasedAt: z.coerce.date().nullable().optional(),
  openedAt: z.coerce.date().nullable().optional(),
  notes: z.string().trim().min(1).max(500).nullable().optional(),
});

export const updateStockItemSchema = createStockItemSchema.partial();
