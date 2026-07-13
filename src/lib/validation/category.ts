import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(100),
});

export const updateCategorySchema = createCategorySchema.partial();
