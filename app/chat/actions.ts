"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/user";

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const chatRoomId = formData.get("chatRoomId") as string;
  const content = formData.get("content") as string;

  if (!content?.trim()) return;

  const user = await requireUser();

  const { data: participant } = await supabase
    .from("chat_participants")
    .select("id")
    .eq("chat_room_id", chatRoomId)
    .eq("profile_id", user.uid)
    .single();

  if (!participant) throw new Error("Not a participant");

  await supabase.from("messages").insert({
    chat_room_id: chatRoomId,
    sender_id: user.uid,
    content: content.trim(),
  });

  revalidatePath(`/chat/${chatRoomId}`);
}

export async function archiveChat(formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser();
  const chatRoomId = formData.get("chatRoomId") as string;

  await supabase
    .from("chat_participants")
    .update({ archived_at: new Date().toISOString() })
    .eq("chat_room_id", chatRoomId)
    .eq("profile_id", user.uid);

  revalidatePath("/chat");
}

export async function unarchiveChat(formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser();
  const chatRoomId = formData.get("chatRoomId") as string;

  await supabase
    .from("chat_participants")
    .update({ archived_at: null })
    .eq("chat_room_id", chatRoomId)
    .eq("profile_id", user.uid);

  revalidatePath("/chat");
}

export async function leaveChat(formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser();
  const chatRoomId = formData.get("chatRoomId") as string;

  await supabase
    .from("chat_participants")
    .delete()
    .eq("chat_room_id", chatRoomId)
    .eq("profile_id", user.uid);

  revalidatePath("/chat");
}
