"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { sendMessage } from "@/app/dashboard/chat/actions";
import { Send, CheckCheck } from "lucide-react";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const bubbleColors = ["bg-blue-600","bg-emerald-600","bg-purple-600","bg-rose-600","bg-cyan-600","bg-amber-600"];

function nameColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return bubbleColors[Math.abs(hash) % bubbleColors.length];
}

export default function ChatRoomClient({
  roomId,
  userId,
  roomName,
  eventType,
  initialMessages,
}: {
  roomId: string;
  userId: string;
  roomName: string;
  eventType: string;
  initialMessages: Record<string, unknown>[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [presence, setPresence] = useState<Record<string, { user_id: string; full_name?: string }[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const supabase = useRef(createClient());

  const onlineUsers = Object.values(presence).flat().map((p) => p.user_id);
  const isOnline = (uid: string) => onlineUsers.includes(uid);

  useEffect(() => {
    const channel = supabase.current.channel(`room:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_room_id=eq.${roomId}`,
      }, (payload) => {
        const newMsg = payload.new as Record<string, unknown>;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .on("presence", { event: "sync" }, () => {
        setPresence({ ...channel.presenceState() as Record<string, { user_id: string; full_name?: string }[]> });
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const { user_id, full_name } = payload as { user_id: string; full_name: string };
        if (user_id === userId) return;
        setTypingUsers((prev) => ({ ...prev, [user_id]: full_name }));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[user_id];
            return next;
          });
        }, 2500);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [roomId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleTyping = useCallback(() => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    const channel = supabase.current.channel(`room:${roomId}`);
    channel.send({ type: "broadcast", event: "typing", payload: { user_id: userId, full_name: "" } });
    typingTimeout.current = setTimeout(() => {
      // typing stopped automatically
    }, 2000);
  }, [roomId, userId]);

  const grouped = messages.reduce<Record<string, Record<string, unknown>[]>>((acc, msg) => {
    const day = new Date(msg.created_at as string).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  const typingEntries = Object.entries(typingUsers);

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-3 bg-gray-900/50 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-yellow-400/20 text-xs font-bold text-yellow-400">
            {getInitials(roomName)}
          </div>
          <div>
            <h1 className="font-semibold text-gray-100">{roomName}</h1>
            <div className="flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full ${onlineUsers.length > 0 ? "bg-green-500" : "bg-gray-600"}`} />
              <p className="text-xs text-gray-500 capitalize">
                {onlineUsers.length > 0 ? `${onlineUsers.length} online` : eventType}
              </p>
            </div>
          </div>
        </div>
        <div className="flex -gap-x-2">
          {onlineUsers.slice(0, 5).map((uid) => (
            <div key={uid} className="size-7 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-[10px] font-medium text-gray-300">
              {uid.slice(0, 2).toUpperCase()}
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="size-7 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] text-gray-500">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-gray-800">
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Send the first message to start the conversation.</p>
          </div>
        )}

        {Object.entries(grouped).map(([day, msgs]) => (
          <div key={day}>
            <div className="relative mb-4 flex items-center justify-center">
              <span className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-800" />
              </span>
              <span className="relative bg-gray-950 px-3 text-xs text-gray-500">{day}</span>
            </div>
            <div className="space-y-4">
              {msgs.map((msg, idx) => {
                const isMe = msg.sender_id === userId;
                const profile = msg.profiles as { full_name: string } | null;
                const senderName = profile?.full_name ?? "Unknown";
                const prev = msgs[idx - 1];
                const showSender = !isMe && (!prev || prev.sender_id !== msg.sender_id);
                const time = new Date(msg.created_at as string);
                const timeStr = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

                return (
                  <div key={msg.id as string} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                    {showSender && (
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${nameColor(senderName)}`}>
                        {getInitials(senderName)}
                      </div>
                    )}
                    {!showSender && !isMe && <div className="w-8 shrink-0" />}
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {showSender && <p className="mb-1 text-xs font-medium text-gray-400">{senderName}</p>}
                      <div className={`max-w-md rounded-2xl px-4 py-2 ${
                        isMe ? "bg-yellow-400 text-black rounded-br-md" : "bg-gray-800 text-gray-200 rounded-bl-md"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content as string}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1 ${isMe ? "text-yellow-700" : "text-gray-500"}`}>
                          <span className="text-[11px]">{timeStr}</span>
                          {isMe && <CheckCheck className="size-3" />}
                        </div>
                      </div>
                    </div>
                    {isMe && <div className="w-8 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {typingEntries.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse">
            <div className="flex gap-0.5">
              <span className="size-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: "0ms" }} />
              <span className="size-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="size-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
            <span>
              {typingEntries.length === 1
                ? `${typingEntries[0][1] || "Someone"} is typing...`
                : `${typingEntries.length} people are typing...`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 px-6 py-4 bg-gray-900/50 backdrop-blur shrink-0">
        <form
          action={async () => {
            if (!input.trim()) return;
            const fd = new FormData();
            fd.set("chatRoomId", roomId);
            fd.set("content", input);
            setInput("");
            await sendMessage(fd);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            name="content"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value) handleTyping();
            }}
            placeholder="Type a message…"
            aria-label="Type a message"
            className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send className="size-4" />
            Send
          </button>
        </form>
      </div>
    </>
  );
}
