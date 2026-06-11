"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionCookie, verifyIdToken, adminCreateUser, adminSetCustomClaims, adminRevokeRefreshTokens, getAdminAuth } from "@/lib/firebase/admin";
import { createClient } from "@/utils/supabase/server";

const SESSION_COOKIE = "__session";

export async function generateVerificationLink(email: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return getAdminAuth().generateEmailVerificationLink(email, {
    url: `${origin}/auth/verify-email`,
    handleCodeInApp: true,
  });
}

async function syncProfile(idToken: string) {
  const user = await verifyIdToken(idToken);
  if (!user) return;

  const claims: Record<string, string | boolean | null> = {
    role: user.role,
    client_mode: user.client_mode,
    full_name: user.full_name,
  };
  try {
    await adminSetCustomClaims(user.uid, claims);
  } catch {
    // user may already have claims — ignore
  }

  try {
    const supabase = await createClient();
    await supabase.rpc("upsert_profile", {
      p_id: user.uid,
      p_full_name: user.full_name,
      p_email: user.email,
      p_avatar_url: user.avatar_url,
      p_role: user.role,
    });
  } catch {
    // non-critical — session cookie is still valid
  }
}

export async function createAuthSession(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 14; // 14 days
  const sessionCookie = await createSessionCookie(idToken);
  await syncProfile(idToken);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expiresIn,
    path: "/",
  });
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const birthMonth = formData.get("birthMonth") as string;
  const birthDay = formData.get("birthDay") as string;
  const birthYear = formData.get("birthYear") as string;

  const months: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
    july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
  };

  const monthNum = months[birthMonth.toLowerCase()] ?? "";
  const dayPadded = birthDay.padStart(2, "0");
  const birthdate = monthNum ? `${birthYear}-${monthNum}-${dayPadded}` : "";

  try {
    const uid = await adminCreateUser(email, password, fullName);

    const claims: Record<string, string | boolean> = {
      role: "external-client",
      client_mode: false,
      full_name: fullName,
    };
    await adminSetCustomClaims(uid, claims);

    const supabase = await createClient();
    await supabase.from("profiles").insert({
      id: uid,
      phone: phone || null,
      birthdate: birthdate || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sign up failed";
    return { error: message };
  }

  return { message: "Account created. Please sign in." };
}

export async function signOut() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (session) {
    try {
      const { verifySessionCookie } = await import("@/lib/firebase/admin");
      const user = await verifySessionCookie(session);
      if (user) {
        await adminRevokeRefreshTokens(user.uid);
      }
    } catch {
      // ignore
    }
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  redirect("/auth/login");
}
