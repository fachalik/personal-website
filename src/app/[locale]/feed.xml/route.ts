import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { buildFeed, feedResponse } from "@/lib/feed";

export const dynamic = "force-static";
export const dynamicParams = false;

/** `/id/feed.xml`; English is served from the unprefixed `/feed.xml`. */
export function generateStaticParams() {
  return routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return new Response("Not found", { status: 404 });
  }
  return feedResponse(await buildFeed(locale));
}
