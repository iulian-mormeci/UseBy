import { z } from "zod";
import { LocationType } from "@/generated/prisma/enums";

export const locationTypeSchema = z.enum([
  LocationType.PANTRY,
  LocationType.FRIDGE,
  LocationType.FREEZER,
]);

export const createLocationSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(100),
  type: locationTypeSchema,
});

export const updateLocationSchema = createLocationSchema.partial();
