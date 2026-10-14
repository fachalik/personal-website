import { routing } from "@/i18n/routing";
import { buildFeed, feedResponse } from "@/lib/feed";

// Posts only change on deploy, so render the feed once at build time.
export const dynamic = "force-static";

/** English feed at the conventional unprefixed `/feed.xml`. */
export async function GET() {
  return feedResponse(await buildFeed(routing.defaultLocale));
}
