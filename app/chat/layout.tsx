import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/auth/sign-out-button";
import { MessageSquare } from "lucide-react";
import type { ReactNode } from "react";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  const supabase = await createClient();
  const { data: participantRows } = await supabase
    .from("chat_participants")
    .select("chat_room_id, chat_rooms(id, name, events_bookings(event_type, profiles(full_name)))")
    .eq("profile_id", user.uid);

  const rooms = ((participantRows ?? []) as Array<Record<string, unknown>>).map((p) => {
    const roomsArr = (p.chat_rooms ?? []) as Array<Record<string, unknown>>;
    const room = roomsArr[0] ?? {};
    const bookingsArr = (room.events_bookings ?? []) as Array<Record<string, unknown>>;
    const booking = bookingsArr[0] ?? {};
    const profilesArr = (booking.profiles ?? []) as Array<Record<string, unknown>>;
    const profile = profilesArr[0] ?? {};
    return {
      id: (room.id as string) ?? "",
      name: (room.name as string) ?? "Chat",
      full_name: (profile.full_name as string) ?? "Client",
      event_type: (booking.event_type as string) ?? "",
    };
  });

  return (
    <div className="flex h-screen bg-gray-950">
      <aside className="flex w-72 flex-col border-r border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <Link href="/chat" className="flex items-center gap-2 text-sm font-bold text-yellow-400">
            <MessageSquare className="size-4" />
            Messages
          </Link>
          <SignOutButton />
        </div>

        <div className="px-5 py-3 border-b border-gray-800/50">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
            Conversations
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {rooms.length > 0 ? (
            rooms.map((room, i) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800/80 transition-colors group"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-gray-400 group-hover:bg-gray-700 transition-colors">
                  {getInitials(room.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{room.full_name}</span>
                    <span className="shrink-0 text-[10px] text-gray-600">{/* time */}</span>
                  </div>
                  <p className="text-xs text-gray-500 capitalize truncate mt-0.5">
                    {room.event_type}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center pt-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-800">
                <MessageSquare className="size-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">No active chats</p>
              <p className="text-xs text-gray-600 mt-1">Chat rooms appear once a booking is approved</p>
            </div>
          )}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
