import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|offline|manifest\\.json|manifest\\.webmanifest|apple-touch-icon\\.png|icon-.*\\.svg|icon-.*\\.png|sw\\.js|.*/favorite|images|uploads).*)",
  ],
};
