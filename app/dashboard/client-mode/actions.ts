"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/user";

export async function toggleClientMode() {
  const user = await requireUser();
  const supabase = await createClient();

  const role = user.role as string;
  if (role === "external-client" || role === "client") return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("client_mode")
    .eq("id", user.uid)
    .single();

  const newMode = !(profile?.client_mode ?? false);

  await supabase
    .from("profiles")
    .update({ client_mode: newMode })
    .eq("id", user.uid);

  revalidatePath("/dashboard");
}
