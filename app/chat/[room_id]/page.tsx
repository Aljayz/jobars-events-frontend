import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ChatRoomClient from "@/components/chat/chat-room-client";

export const metadata: Metadata = {
  title: "Chat Room — Jobars Events",
  description: "Event chat room.",
};

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ room_id: string }>;
}) {
  const user = await requireUser();
  const [paramsResult, supabase] = await Promise.all([
    params,
    createClient(),
  ]);
  const { room_id } = paramsResult;

  const { data: membership } = await supabase
    .from("chat_participants")
    .select("id")
    .eq("chat_room_id", room_id)
    .eq("profile_id", user.uid)
    .single();

  if (!membership) redirect("/chat");

  const [roomResult, messagesResult, participantsResult] = await Promise.all([
    supabase
      .from("chat_rooms")
      .select("id, name, events_bookings(event_type, profiles(full_name, avatar_url))")
      .eq("id", room_id)
      .single(),
    supabase
      .from("messages")
      .select("id, content, created_at, sender_id, profiles!sender_id(full_name, role, avatar_url)")
      .eq("chat_room_id", room_id)
      .order("created_at", { ascending: true }),
    supabase
      .from("chat_participants")
      .select("profile_id, profiles!inner(full_name, role, avatar_url)")
      .eq("chat_room_id", room_id),
  ]);

  const room = roomResult.data;
  const initialMessages = messagesResult.data;

  const participants = ((participantsResult.data ?? []) as Array<Record<string, unknown>>).map((p) => {
    const profilesArr = (p.profiles ?? []) as Array<Record<string, unknown>>;
    const profile = profilesArr[0] ?? {};
    return {
      profile_id: (p.profile_id as string) ?? "",
      full_name: (profile.full_name as string) ?? "",
      role: (profile.role as string) ?? "",
      avatar_url: (profile.avatar_url as string) ?? null,
    };
  });

  const roomData = room as Record<string, unknown> | null;
  const booking = roomData?.events_bookings as Record<string, unknown> | null;
  const bookingProfiles = (booking?.profiles ?? []) as Array<Record<string, unknown>>;
  const bookingProfile = (bookingProfiles[0] ?? {}) as Record<string, unknown>;

  return (
    <ChatRoomClient
      roomId={room_id}
      userId={user.uid}
      userRole={user.role}
      roomName={roomData?.name as string ?? "Chat"}
      roomAvatarUrl={(bookingProfile.avatar_url as string) ?? null}
      eventType={booking?.event_type as string ?? ""}
      initialMessages={(initialMessages ?? []) as Array<Record<string, unknown>>}
      participants={participants}
    />
  );
}
