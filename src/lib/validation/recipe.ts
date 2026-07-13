import { z } from "zod";

export const recipeIngredientSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.coerce.number().positive().nullable().optional(),
  optional: z.boolean().default(false),
});

export const createRecipeSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200),
  instructions: z.string().trim().min(1, "Le istruzioni sono obbligatorie"),
  servings: z.number().int().positive().nullable().optional(),
  prepMinutes: z.number().int().positive().nullable().optional(),
  cookMinutes: z.number().int().positive().nullable().optional(),
  notes: z.string().trim().min(1).max(1000).nullable().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, "Aggiungi almeno un ingrediente"),
});

export const updateRecipeSchema = createRecipeSchema.partial();
