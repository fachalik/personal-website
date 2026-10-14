import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string,
  locale = "en",
  month: "short" | "long" = "long",
) {
  // Date-only strings parse as UTC; pin the zone so the day never shifts.
  return new Date(`${date.slice(0, 10)}T00:00:00Z`).toLocaleDateString(locale, {
    timeZone: "UTC",
    month,
    day: "numeric",
    year: "numeric",
  });
}

/** Formats "2021", "2025-06" or "2021-11-11" at the precision it was written in. */
export function formatPartialDate(date: string, locale = "en") {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(
    Date.UTC(year, (month || 1) - 1, day || 1),
  ).toLocaleDateString(locale, {
    timeZone: "UTC",
    year: "numeric",
    month: month ? (day ? "long" : "short") : undefined,
    day: day ? "numeric" : undefined,
  });
}

/** "Jun 2025 - Present"; pass `present` for an open-ended range, omit both for a single date. */
export function formatPeriod(
  start: string,
  end: string | undefined,
  locale: string,
  present?: string,
) {
  const from = formatPartialDate(start, locale);
  const to = end ? formatPartialDate(end, locale) : present;
  return to ? `${from} - ${to}` : from;
}
