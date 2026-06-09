"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const chatRoomId = formData.get("chatRoomId") as string;
  const content = formData.get("content") as string;

  if (!content?.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("messages").insert({
    chat_room_id: chatRoomId,
    sender_id: user.id,
    content: content.trim(),
  });

  revalidatePath(`/dashboard/chat/${chatRoomId}`);
}
