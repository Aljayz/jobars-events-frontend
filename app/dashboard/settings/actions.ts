"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/user";

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
    })
    .eq("id", user.uid);

  revalidatePath("/dashboard/settings");
}
