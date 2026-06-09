"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/user";

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
    })
    .eq("id", user.uid);

  if (error) {
    return redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?success=Profile updated");
}
