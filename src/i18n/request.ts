import { getRequestConfig } from "next-intl/server";

import { defaultLocale, timeZone } from "./config";

/**
 * Single-locale setup without i18n routing: we never read `requestLocale`
 * (which would read request headers and break static prerendering).
 */
export default getRequestConfig(async () => ({
  locale: defaultLocale,
  timeZone,
  messages: (await import(`../../messages/${defaultLocale}.json`)).default,
}));
