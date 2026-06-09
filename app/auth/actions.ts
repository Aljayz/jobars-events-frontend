"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        birthdate,
        role: "external-client",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect("/dashboard/client");
  }

  return { message: "Check your email to confirm your account." };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const role = data.user?.user_metadata?.role ?? "client";
  redirect(`/dashboard/${role}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
