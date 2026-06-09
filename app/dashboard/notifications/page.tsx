import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { markNotificationRead, markAllNotificationsRead } from "@/utils/notifications/actions";
import { Bell, Check, CheckCheck } from "lucide-react";

const typeIcons: Record<string, string> = {
  milestone: "📋",
  approval: "✅",
  booking: "📅",
};

export default async function NotificationsPage() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", user.uid)
    .order("created_at", { ascending: false })
    .limit(50);

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-gray-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-yellow-400 hover:border-yellow-400/30 transition-all"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          </form>
        )}
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-1">
          {notifications.map((n) => (
            <form key={n.id} action={markNotificationRead} className="group">
              <input type="hidden" name="id" value={n.id} />
              <button
                type="submit"
                disabled={n.is_read}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                  n.is_read
                    ? "border-gray-800/50 bg-gray-900/20"
                    : "border-yellow-400/20 bg-yellow-400/5 hover:bg-yellow-400/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                    n.is_read ? "bg-gray-800" : "bg-yellow-400/20"
                  }`}>
                    <span className="text-sm">{typeIcons[n.type] ?? "🔔"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${n.is_read ? "text-gray-400" : "text-gray-200"}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.is_read && <span className="size-2 rounded-full bg-yellow-400" />}
                        <span className="text-[11px] text-gray-600">
                          {new Date(n.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    {n.message && (
                      <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>
                    )}
                    {n.link && !n.is_read && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-yellow-400">
                        View details
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </form>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 p-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-800">
            <Bell className="size-8 text-gray-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-300">No notifications yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            You&apos;ll be notified when milestones are updated or approvals are requested.
          </p>
        </div>
      )}
    </div>
  );
}
