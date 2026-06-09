import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import Link from "next/link";
import SignOutButton from "@/components/auth/sign-out-button";
import ChatShell from "@/components/chat/chat-shell";
import { MessageSquare, LayoutGrid, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);
  const role = user.role;
  const clientMode = user.client_mode === true;
  const isClient = role === "external-client" || clientMode;

  const { data: participantRows } = await supabase
    .from("chat_participants")
    .select("archived_at, chat_room_id, chat_rooms!inner(id, name, booking_id, events_bookings!inner(event_type, client_id, profiles!inner(full_name)))")
    .eq("profile_id", user.uid);

  const allRooms = ((participantRows ?? []) as Array<Record<string, unknown>>).map((p) => {
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
      client_id: (booking.client_id as string) ?? "",
      archived_at: (p.archived_at as string) ?? null,
    };
  });

  const filteredRooms = isClient
    ? allRooms.filter((r) => r.client_id === user.uid)
    : allRooms;

  const activeRooms = filteredRooms.filter((r) => !r.archived_at);
  const archivedRooms = filteredRooms.filter((r) => r.archived_at);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <ChatShell
        sidebar={
          <>
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-400 transition-colors shrink-0"
                >
                  <LayoutGrid className="size-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <span className="text-gray-700 hidden sm:inline">/</span>
                <Link href="/chat" className="flex items-center gap-2 text-sm font-bold text-yellow-400 truncate">
                  <MessageSquare className="size-4 shrink-0" />
                  <span className="truncate">Messages</span>
                </Link>
              </div>
              <SignOutButton />
            </div>

            <div className="px-4 py-2.5 border-b border-gray-800/50 sm:px-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                Conversations
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {activeRooms.length > 0 ? (
                activeRooms.map((room) => (
                  <RoomRow key={room.id} room={room} />
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

            {archivedRooms.length > 0 && (
              <details className="border-t border-gray-800/50">
                <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors sm:px-5">
                  <Archive className="size-3.5" />
                  Archived ({archivedRooms.length})
                </summary>
                <nav className="p-3 pt-1 space-y-1">
                  {archivedRooms.map((room) => (
                    <ArchivedRoomRow key={room.id} room={room} />
                  ))}
                </nav>
              </details>
            )}
          </>
        }
      >
        {children}
      </ChatShell>
    </div>
  );
}

function RoomRow({ room }: { room: { id: string; name: string; full_name: string; event_type: string } }) {
  return (
    <div className="group relative">
      <Link
        href={`/chat/${room.id}`}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800/80 transition-colors"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-gray-400 group-hover:bg-gray-700 transition-colors">
          {getInitials(room.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{room.full_name}</span>
          </div>
          <p className="text-xs text-gray-500 capitalize truncate mt-0.5">
            {room.event_type}
          </p>
        </div>
      </Link>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
        <form action={archiveChatAction}>
          <input type="hidden" name="chatRoomId" value={room.id} />
          <button
            type="submit"
            title="Archive"
            className="flex size-7 items-center justify-center rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-gray-800 transition-colors"
          >
            <Archive className="size-3.5" />
          </button>
        </form>
        <form action={leaveChatAction}>
          <input type="hidden" name="chatRoomId" value={room.id} />
          <button
            type="submit"
            title="Delete"
            className="flex size-7 items-center justify-center rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function ArchivedRoomRow({ room }: { room: { id: string; name: string; full_name: string; event_type: string } }) {
  return (
    <div className="group relative">
      <Link
        href={`/chat/${room.id}`}
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-500 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-800/60 text-[10px] font-bold text-gray-500">
          {getInitials(room.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <span className="truncate text-xs">{room.full_name}</span>
          <p className="text-[10px] text-gray-600 capitalize truncate">{room.event_type}</p>
        </div>
      </Link>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
        <form action={unarchiveChatAction}>
          <input type="hidden" name="chatRoomId" value={room.id} />
          <button
            type="submit"
            title="Unarchive"
            className="flex size-6 items-center justify-center rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-gray-800 transition-colors"
          >
            <ArchiveRestore className="size-3" />
          </button>
        </form>
        <form action={leaveChatAction}>
          <input type="hidden" name="chatRoomId" value={room.id} />
          <button
            type="submit"
            title="Delete"
            className="flex size-6 items-center justify-center rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors"
          >
            <Trash2 className="size-3" />
          </button>
        </form>
      </div>
    </div>
  );
}

async function archiveChatAction(formData: FormData) {
  "use server";
  const { archiveChat } = await import("./actions");
  await archiveChat(formData);
}

async function unarchiveChatAction(formData: FormData) {
  "use server";
  const { unarchiveChat } = await import("./actions");
  await unarchiveChat(formData);
}

async function leaveChatAction(formData: FormData) {
  "use server";
  const { leaveChat } = await import("./actions");
  await leaveChat(formData);
}
