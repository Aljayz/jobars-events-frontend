"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleClientMode() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const role = user.user_metadata?.role as string;
  if (role === "external-client" || role === "client") return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("client_mode")
    .eq("id", user.id)
    .single();

  const newMode = !(profile?.client_mode ?? false);

  await supabase
    .from("profiles")
    .update({ client_mode: newMode })
    .eq("id", user.id);

  await supabase.auth.updateUser({
    data: { ...user.user_metadata, client_mode: newMode },
  });

  revalidatePath("/dashboard");
}
