import { DATA } from "@/data/resume";
import { LOCALE_TAGS, type Locale, routing } from "@/i18n/routing";

/**
 * Canonical origin with no trailing slash, so joining paths never yields `//`.
 */
export const SITE_URL = DATA.url.replace(/\/+$/, "");

/** Turn a site-relative path into a fully-qualified URL. */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** URL of the dynamically rendered Open Graph card for a given headline. */
export function ogImageUrl(title: string = DATA.name) {
  return absoluteUrl(`/og?title=${encodeURIComponent(title)}`);
}

/** Profiles we actually own, used for schema.org `sameAs`. */
export const SOCIAL_PROFILES = Object.values(DATA.contact.social)
  .filter((social) => social.navbar)
  .map((social) => social.url);

export const SITE_KEYWORDS = [
  DATA.name,
  "Fachalik",
  "Frontend Developer",
  "Fullstack Developer",
  "Web Developer Indonesia",
  "React Developer",
  "Next.js Developer",
  "Software Engineer Jakarta",
  ...DATA.skills,
];

/** `/blog` → `/id/blog` for Indonesian; English keeps the unprefixed URL. */
export function localizedPath(path: string, locale: Locale) {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

/** hreflang map for `alternates.languages`, including x-default. */
export function languageAlternates(
  path: string,
  locales: readonly Locale[] = routing.locales,
) {
  return {
    ...Object.fromEntries(
      locales.map((l) => [LOCALE_TAGS[l].lang, localizedPath(path, l)]),
    ),
    "x-default": localizedPath(path, routing.defaultLocale),
  };
}

/** `alternates.types` entry so feed readers can discover the blog's RSS feed. */
export function feedAlternate(locale: Locale) {
  return { "application/rss+xml": localizedPath("/feed.xml", locale) };
}
