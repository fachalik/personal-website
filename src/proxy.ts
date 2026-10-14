import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, the OG/icon routes and any file with an extension.
  matcher: [
    "/((?!api|_next|_vercel|og|icon|apple-icon|icon-maskable|manifest|robots|sitemap|.*\\..*).*)",
  ],
};
