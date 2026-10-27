import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { isVacacionesActiva } from "./lib/event/vacaciones";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Match the static/API exclusions even when invoked directly outside Next's matcher.
  if (pathname.startsWith("/api/") || pathname === "/api" || pathname.startsWith("/_next/") || pathname.includes(".")) return;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = i18n.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // Only the agreed public entry points take part; admin/legal/unknown routes stay intact.
  const normalizedPath = pathname.replace(/\/$/, "");
  const locale = i18n.locales.find((value) =>
    [ `/${value}`, `/${value}/menu`, `/${value}/reservas` ].includes(normalizedPath)
  );
  if (locale && isVacacionesActiva()) {
    const destination = new URL(request.url);
    destination.pathname = `/${locale}/vacaciones`;
    const response = NextResponse.rewrite(destination);
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    response.headers.set("CDN-Cache-Control", "no-store");
    response.headers.set("Vercel-CDN-Cache-Control", "no-store");
    return response;
  }
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
