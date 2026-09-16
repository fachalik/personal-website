import { DATA } from "@/data/resume";

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

/**
 * Search-snippet length (~155 chars). DATA.summary is far too long to survive
 * Google's truncation, so the page body and the meta tag say different things.
 */
export const SITE_DESCRIPTION = `${DATA.name} is a Frontend Developer in ${DATA.location}, building fast, user-friendly web apps with React, Next.js and TypeScript.`;

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
