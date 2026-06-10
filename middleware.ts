import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard"];
const authPaths = ["/auth"];
const publicPaths = ["/", "/about", "/services", "/contact"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("__session");

  if (hasSession && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasSession && protectedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (publicPaths.includes(pathname)) {
    const res = NextResponse.next();
    res.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
    );
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/about", "/services", "/contact", "/dashboard/:path*", "/auth/:path*"],
};
