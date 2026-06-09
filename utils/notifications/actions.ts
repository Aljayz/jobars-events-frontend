import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/user";

interface CreateNotificationInput {
  profileId: string;
  title: string;
  message?: string;
  type?: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const supabase = await createClient();
  await supabase.from("notifications").insert({
    profile_id: input.profileId,
    title: input.title,
    message: input.message ?? null,
    type: input.type ?? "general",
    link: input.link ?? null,
  });
}

export async function markNotificationRead(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const user = await requireUser();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("profile_id", user.uid)
    .eq("is_read", false);
  revalidatePath("/dashboard/notifications");
}
