import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, Bell, MessageSquare, ListChecks, LayoutGrid, TrendingUp, Clock, Users, ClipboardList } from "lucide-react";

const ADMIN_ROLES = ["super-admin", "admin", "manager"];

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = (user.user_metadata?.role as string) ?? "external-client";
  const clientMode = user.user_metadata?.client_mode === true;

  const [notifRes, bookingsRes, msgRes] = await Promise.all([
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("is_read", false),
    supabase
      .from("events_bookings")
      .select("*")
      .eq("client_id", user.id)
      .order("event_date", { ascending: true })
      .limit(5),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true }),
  ]);

  const unreadNotifications = notifRes.count;
  const bookings = bookingsRes.data;
  const unreadMessages = msgRes.count;

  const isAdmin = ADMIN_ROLES.includes(role);
  const isHR = role === "human-resource";
  const isStaff = role === "staff";
  const isEmployee = role === "employee";
  const isClient = role === "external-client" || clientMode;

  const dashboardHref = isClient ? "/dashboard/client" :
    isHR ? "/dashboard/hr" :
    isStaff ? "/dashboard/staff" :
    isEmployee ? "/dashboard/employee" :
    "/dashboard/admin";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {user.user_metadata?.full_name as string ?? "User"}
        </h1>
        <p className="mt-1 text-gray-400 capitalize">Here&apos;s your {clientMode ? "client" : role} dashboard overview.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStat
          icon={CalendarCheck}
          label="Upcoming Events"
          value={bookings?.filter((b) => b.status !== "cancelled" && b.status !== "completed").length ?? 0}
          color="text-yellow-400"
          href={isClient ? "/dashboard/client" : "/dashboard/admin"}
        />
        <QuickStat
          icon={Bell}
          label="Notifications"
          value={unreadNotifications ?? 0}
          color="text-red-400"
          href="/dashboard/notifications"
        />
        <QuickStat
          icon={MessageSquare}
          label="Chat Rooms"
          value="—"
          color="text-blue-400"
          href="/dashboard/chat"
        />
        <QuickStat
          icon={isStaff ? ListChecks : isHR ? ClipboardList : isEmployee ? Users : LayoutGrid}
          label={isStaff ? "My Tasks" : isClient ? "Timeline" : isHR ? "HR Panel" : isEmployee ? "My Work" : "Pipeline"}
          value="View"
          color="text-green-400"
          href={dashboardHref}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
            <TrendingUp className="size-4 text-yellow-400" />
            Quick Actions
          </h2>
          <div className="space-y-2">
            {isClient && (
              <>
                <Link href="/dashboard/client" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">View event timeline</Link>
                <Link href="/dashboard/client/approvals" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Review pending approvals</Link>
                <Link href="/dashboard/client/book" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Book a new event</Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link href="/dashboard/admin/create" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Create a new event booking</Link>
                <Link href="/dashboard/admin/uploads" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Upload proof files for review</Link>
                <Link href="/dashboard/admin/milestones" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Manage event milestones</Link>
              </>
            )}
            {isHR && (
              <>
                <Link href="/dashboard/hr/employees" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Manage employees</Link>
                <Link href="/dashboard/hr/attendance" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Review attendance</Link>
                <Link href="/dashboard/hr/promotions" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Recommend promotions</Link>
              </>
            )}
            {isStaff && (
              <Link href="/dashboard/staff" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">View my assigned tasks</Link>
            )}
            {isEmployee && (
              <>
                <Link href="/dashboard/employee/attendance" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Clock in / Clock out</Link>
                <Link href="/dashboard/employee/cash-advance" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Request cash advance</Link>
              </>
            )}
            <Link href="/dashboard/chat" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Open event chat</Link>
            <Link href="/dashboard/settings" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Update profile settings</Link>
          </div>
        </div>

        {bookings && bookings.length > 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Clock className="size-4 text-yellow-400" />
              Upcoming Events
            </h2>
            <div className="space-y-2">
              {bookings.map((b) => {
                const eventDate = new Date(b.event_date);
                const diffDays = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={b.id} className="flex items-center justify-between rounded-lg px-4 py-2.5 bg-gray-800/30">
                    <div>
                      <p className="text-sm font-medium text-gray-200 capitalize">{b.event_type}</p>
                      <p className="text-xs text-gray-500">
                        {eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <span suppressHydrationWarning className={`text-xs font-medium ${diffDays < 0 ? "text-gray-600" : diffDays === 0 ? "text-green-400" : "text-yellow-400"}`}>
                      {diffDays < 0 ? "Past" : diffDays === 0 ? "Today!" : `${diffDays}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 hover:bg-gray-900/80 transition-all">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon className={`size-4 ${color}`} />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Link>
  );
}
