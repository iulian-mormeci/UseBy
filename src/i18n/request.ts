import { getRequestConfig } from "next-intl/server";

// Fixed to English for now; phase 3 makes this dynamic (cookie-based
// preference + a language switcher in the admin panel).
export default getRequestConfig(async () => {
  const locale = "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
