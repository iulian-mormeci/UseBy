import { z } from "zod";

export const createZoneSchema = z.object({
  locationId: z.number().int().positive(),
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(100),
});
