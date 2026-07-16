import { z } from "zod";
import { SUPPORTED_LOCALES } from "@/i18n/request";

export const setLocaleSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
});
