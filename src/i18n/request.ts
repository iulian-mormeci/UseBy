import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const LOCALE_COOKIE_NAME = "useby_locale";
export const SUPPORTED_LOCALES = ["en", "it"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export default getRequestConfig(async () => {
  const cookieValue = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(cookieValue ?? "")
    ? (cookieValue as Locale)
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
