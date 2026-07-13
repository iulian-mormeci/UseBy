import { z } from "zod";

export const updateNotificationSettingSchema = z.object({
  defaultLeadDays: z.number().int().min(0),
});
