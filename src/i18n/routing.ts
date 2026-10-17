import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "id"],
  defaultLocale: "en",
  // English keeps today's URLs (/blog); Indonesian lives under /id.
  localePrefix: "as-needed",
  // The URL is the only source of truth. With detection on, an Indonesian
  // browser (or a stale NEXT_LOCALE cookie) bounced every unprefixed English
  // URL back to /id, so switching to English appeared to do nothing.
  localeDetection: false,
  // hreflang is emitted in <head> via metadata (absolute, canonical host).
  // The middleware's Link header used the request host instead, which gave
  // crawlers two conflicting sets of alternates.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

/** BCP 47 tags for dates, OpenGraph and schema.org. */
export const LOCALE_TAGS: Record<Locale, { lang: string; og: string }> = {
  en: { lang: "en-US", og: "en_US" },
  id: { lang: "id-ID", og: "id_ID" },
};
