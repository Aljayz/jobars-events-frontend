import { Bell } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";

export default async function NotificationBell() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.uid)
    .eq("is_read", false);

  return (
    <Link
      href="/dashboard/notifications"
      className="relative flex items-center justify-center rounded-lg p-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all"
    >
      <Bell className="size-4" />
      {(count ?? 0) > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count && count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
