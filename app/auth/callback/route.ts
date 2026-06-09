import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role ?? "client";
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const host = isLocalEnv ? origin : `https://${forwardedHost}`;
      return NextResponse.redirect(`${host}/dashboard/${role}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
