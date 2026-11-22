import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // 2026-11-22 audit fix: any path carrying a file extension is a static asset and must
    // bypass the next-intl locale rewrite. Without `.*\\..*`, /logo-mark.svg (header) and
    // /logo-mark-light.svg (footer) were rewritten to /en/logo-mark.svg and returned 404 —
    // every page shipped a broken brand logo.
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|offline|manifest\\.json|manifest\\.webmanifest|apple-touch-icon\\.png|icon-.*\\.svg|icon-.*\\.png|sw\\.js|.*/favorite|images|uploads|.*\\..*).*)"
  ],
};
