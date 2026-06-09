import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard"];
const authPaths = ["/auth"];
const sharedPaths = ["/dashboard/chat", "/dashboard/notifications", "/dashboard/settings"];

const rolePrefixes: Record<string, string[]> = {
  "super-admin": ["/dashboard/admin"],
  admin: ["/dashboard/admin"],
  "human-resource": ["/dashboard/hr"],
  manager: ["/dashboard/admin"],
  staff: ["/dashboard/staff"],
  employee: ["/dashboard/employee"],
  "external-client": ["/dashboard/client"],
  client: ["/dashboard/client"],
};

function getRedirectUrl(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (user && authPaths.some((p) => pathname.startsWith(p))) {
    const role = (user.user_metadata?.role as string) ?? "external-client";
    const clientMode = user.user_metadata?.client_mode === true;
    const baseRoute = clientMode ? "client" : getRoleDashboard(role);
    return getRedirectUrl(request, `/dashboard/${baseRoute}`);
  }

  if (!user && protectedPaths.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const role = (user.user_metadata?.role as string) ?? "external-client";
    const clientMode = user.user_metadata?.client_mode === true;
    const baseRoute = clientMode ? "client" : getRoleDashboard(role);

    // Client-mode users see only client routes
    if (clientMode) {
      if (pathname === "/dashboard" || pathname === "/dashboard/") {
        return getRedirectUrl(request, "/dashboard/client");
      }
      const isClientRoute = pathname.startsWith("/dashboard/client");
      const isShared = sharedPaths.some((p) => pathname.startsWith(p));
      if (!isClientRoute && !isShared && pathname.startsWith("/dashboard")) {
        return getRedirectUrl(request, "/dashboard/client");
      }
      return supabaseResponse;
    }

    // Non-client-mode routing
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return getRedirectUrl(request, `/dashboard/${baseRoute}`);
    }

    const allowedPrefixes = rolePrefixes[role] ?? ["/dashboard/client"];

    const isAllowed = allowedPrefixes.some((prefix) =>
      pathname.startsWith(prefix),
    );

    const isShared = sharedPaths.some((prefix) =>
      pathname.startsWith(prefix),
    );

    if (!isAllowed && !isShared && pathname.startsWith("/dashboard")) {
      return getRedirectUrl(request, `/dashboard/${baseRoute}`);
    }
  }

  return supabaseResponse;
}

function getRoleDashboard(role: string): string {
  switch (role) {
    case "super-admin":
    case "admin":
    case "manager":
      return "admin";
    case "human-resource":
      return "hr";
    case "staff":
      return "staff";
    case "employee":
      return "employee";
    case "client":
    case "external-client":
      return "client";
    default:
      return "client";
  }
}
