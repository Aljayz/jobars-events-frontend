"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
    })
    .eq("id", user.id);

  await supabase.auth.updateUser({
    data: { full_name: fullName, phone },
  });

  revalidatePath("/dashboard/settings");
}
