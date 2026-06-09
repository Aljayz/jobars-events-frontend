import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ChatRoomClient from "@/components/chat/chat-room-client";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ room_id: string }>;
}) {
  const [paramsResult, supabase] = await Promise.all([
    params,
    createClient(),
  ]);
  const { room_id } = paramsResult;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: membership } = await supabase
    .from("chat_participants")
    .select("id")
    .eq("chat_room_id", room_id)
    .eq("profile_id", user.id)
    .single();

  if (!membership) redirect("/dashboard/chat");

  const [roomResult, messagesResult] = await Promise.all([
    supabase
      .from("chat_rooms")
      .select("id, name, events_bookings(event_type, profiles(full_name))")
      .eq("id", room_id)
      .single(),
    supabase
      .from("messages")
      .select("id, content, created_at, sender_id, profiles!sender_id(full_name)")
      .eq("chat_room_id", room_id)
      .order("created_at", { ascending: true }),
  ]);

  const room = roomResult.data;
  const initialMessages = messagesResult.data;

  const roomData = room as Record<string, unknown> | null;
  const booking = roomData?.events_bookings as Record<string, unknown> | null;

  return (
    <ChatRoomClient
      roomId={room_id}
      userId={user.id}
      roomName={roomData?.name as string ?? "Chat"}
      eventType={booking?.event_type as string ?? ""}
      initialMessages={(initialMessages ?? []) as Array<Record<string, unknown>>}
    />
  );
}
