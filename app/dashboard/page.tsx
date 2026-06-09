import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import Link from "next/link";
import {
  CalendarCheck, Bell, MessageSquare, ListChecks, LayoutGrid,
  TrendingUp, Clock, Users, ClipboardList, ArrowRight,
  Calendar, Sparkles, Zap, ChevronRight,
} from "lucide-react";

const ADMIN_ROLES = ["super-admin", "admin", "manager"];

const roleColors: Record<string, string> = {
  "super-admin": "from-rose-500 to-pink-600",
  admin: "from-yellow-400 to-amber-500",
  manager: "from-yellow-400 to-amber-500",
  "human-resource": "from-sky-400 to-blue-500",
  staff: "from-violet-400 to-purple-500",
  employee: "from-emerald-400 to-green-500",
  "external-client": "from-cyan-400 to-teal-500",
  client: "from-cyan-400 to-teal-500",
};

const roleBadgeColors: Record<string, string> = {
  "super-admin": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  admin: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  manager: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  "human-resource": "bg-sky-400/10 text-sky-400 border-sky-400/20",
  staff: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  employee: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  "external-client": "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  client: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
};

const roleIcons: Record<string, string> = {
  "super-admin": "👑",
  admin: "⚙️",
  manager: "📋",
  "human-resource": "👥",
  staff: "⭐",
  employee: "💼",
  "external-client": "🎉",
  client: "🎉",
};

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getCurrentDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

export default async function DashboardHome() {
  const [user, supabase] = await Promise.all([
    requireUser(),
    createClient(),
  ]);

  const role = user.role;
  const clientMode = user.client_mode === true;
  const displayRole = clientMode ? "client" : role;

  const [notifRes, bookingsRes, msgRes] = await Promise.all([
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.uid)
      .eq("is_read", false),
    supabase
      .from("events_bookings")
      .select("*")
      .eq("client_id", user.uid)
      .order("event_date", { ascending: true })
      .limit(5),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true }),
  ]);

  const unreadNotifications = notifRes.count ?? 0;
  const bookings = bookingsRes.data;
  const unreadMessages = msgRes.count ?? 0;

  const isAdmin = ADMIN_ROLES.includes(role);
  const isHR = role === "human-resource";
  const isStaff = role === "staff";
  const isEmployee = role === "employee";
  const isClient = role === "external-client" || clientMode;

  const activeBookings = bookings?.filter(
    (b) => b.status !== "cancelled" && b.status !== "completed"
  ).length ?? 0;

  const dashboardHref = isClient ? "/dashboard/client" :
    isHR ? "/dashboard/hr" :
    isStaff ? "/dashboard/staff" :
    isEmployee ? "/dashboard/employee" :
    "/dashboard/admin";

  const quickActions = isClient ? [
    { href: "/dashboard/client", label: "Event Timeline", icon: ListChecks, desc: "View your event progress" },
    { href: "/dashboard/client/approvals", label: "Approvals", icon: ClipboardList, desc: "Review pending items" },
    { href: "/dashboard/client/book", label: "Book Event", icon: Calendar, desc: "Schedule a new event" },
  ] : isAdmin ? [
    { href: "/dashboard/admin/create", label: "Create Booking", icon: Calendar, desc: "New event booking" },
    { href: "/dashboard/admin/uploads", label: "Upload Files", icon: Sparkles, desc: "Proof files for review" },
    { href: "/dashboard/admin/milestones", label: "Milestones", icon: Zap, desc: "Manage event milestones" },
  ] : isHR ? [
    { href: "/dashboard/hr/employees", label: "Employees", icon: Users, desc: "Manage team members" },
    { href: "/dashboard/hr/attendance", label: "Attendance", icon: Clock, desc: "Review attendance" },
    { href: "/dashboard/hr/promotions", label: "Promotions", icon: TrendingUp, desc: "Recommend promotions" },
  ] : isStaff ? [
    { href: "/dashboard/staff", label: "My Tasks", icon: ListChecks, desc: "View assigned tasks" },
  ] : isEmployee ? [
    { href: "/dashboard/employee/attendance", label: "Clock In/Out", icon: Clock, desc: "Record attendance" },
    { href: "/dashboard/employee/cash-advance", label: "Cash Advance", icon: Zap, desc: "Request advance" },
  ] : [];

  const statCards = [
    {
      icon: CalendarCheck,
      label: "Upcoming Events",
      value: activeBookings,
      color: "text-yellow-400",
      bg: "from-yellow-400/10 to-amber-500/5",
      border: "border-yellow-400/20",
      href: isClient ? "/dashboard/client" : "/dashboard/admin",
    },
    {
      icon: Bell,
      label: "Notifications",
      value: unreadNotifications,
      color: "text-rose-400",
      bg: "from-rose-400/10 to-pink-500/5",
      border: "border-rose-400/20",
      href: "/dashboard/notifications",
    },
    {
      icon: MessageSquare,
      label: "Chat Rooms",
      value: unreadMessages,
      color: "text-sky-400",
      bg: "from-sky-400/10 to-blue-500/5",
      border: "border-sky-400/20",
      href: "/chat",
    },
    {
      icon: isStaff ? ListChecks : isHR ? ClipboardList : isEmployee ? Users : LayoutGrid,
      label: isStaff ? "My Tasks" : isClient ? "Timeline" : isHR ? "HR Panel" : isEmployee ? "My Work" : "Pipeline",
      value: "View",
      color: "text-emerald-400",
      bg: "from-emerald-400/10 to-green-500/5",
      border: "border-emerald-400/20",
      href: dashboardHref,
    },
  ];

  return (
    <div className="space-y-8 py-6">
      {/* Hero Greeting */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-950 p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-yellow-400/5 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-yellow-400/3 blur-[100px]" />
        <div className="relative flex items-start gap-5">
          <div className={`hidden sm:flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${roleColors[displayRole] ?? "from-gray-500 to-gray-600"} text-2xl font-bold text-white shadow-lg`}>
            {getInitials(user.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {getGreeting()}, {user.full_name?.split(" ")[0] ?? "there"}
              </h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${roleBadgeColors[displayRole] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                <span className="text-sm">{roleIcons[displayRole] ?? "•"}</span>
                {displayRole.replace("-", " ")}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-gray-500">
              {getCurrentDate()} &middot; {displayRole === "client" ? "Track your events and stay updated" : "Manage your workspace"}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group relative overflow-hidden rounded-xl border ${stat.border} bg-gradient-to-br ${stat.bg} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="absolute -right-6 -top-6 size-20 rounded-full bg-white/[0.02] blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <p className={`mt-3 text-3xl font-bold ${stat.color === "text-yellow-400" ? "text-yellow-400" : stat.color === "text-rose-400" ? "text-rose-400" : stat.color === "text-sky-400" ? "text-sky-400" : "text-emerald-400"}`}>
                {stat.value}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-gray-600 opacity-0 transition-opacity group-hover:opacity-100">
                <span>View details</span>
                <ArrowRight className="size-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Upcoming Events */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-yellow-400/10">
              <Zap className="size-4 text-yellow-400" />
            </div>
            <h2 className="text-sm font-semibold text-gray-200">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-4 rounded-xl border border-transparent px-4 py-3.5 transition-all hover:border-gray-700/50 hover:bg-gray-800/40"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-800/60 group-hover:bg-yellow-400/10 transition-colors">
                    <Icon className="size-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-600">{action.desc}</p>
                  </div>
                  <ChevronRight className="size-4 text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-yellow-400" />
                </Link>
              );
            })}
            {quickActions.length === 0 && (
              <p className="text-sm text-gray-600 py-8 text-center">No quick actions available</p>
            )}
            <div className="border-t border-gray-800/50 pt-2 mt-2">
              <Link
                href="/chat"
                className="group flex items-center gap-4 rounded-xl border border-transparent px-4 py-3.5 transition-all hover:border-gray-700/50 hover:bg-gray-800/40"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-800/60 group-hover:bg-yellow-400/10 transition-colors">
                  <MessageSquare className="size-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Event Chat</p>
                  <p className="text-xs text-gray-600">Open your event conversations</p>
                </div>
                <ChevronRight className="size-4 text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-yellow-400" />
              </Link>
              <Link
                href="/dashboard/settings"
                className="group flex items-center gap-4 rounded-xl border border-transparent px-4 py-3.5 transition-all hover:border-gray-700/50 hover:bg-gray-800/40"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-800/60 group-hover:bg-yellow-400/10 transition-colors">
                  <LayoutGrid className="size-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Profile Settings</p>
                  <p className="text-xs text-gray-600">Update your account details</p>
                </div>
                <ChevronRight className="size-4 text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-yellow-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-yellow-400/10">
              <CalendarCheck className="size-4 text-yellow-400" />
            </div>
            <h2 className="text-sm font-semibold text-gray-200">Upcoming Events</h2>
            {bookings && bookings.length > 0 && (
              <span className="ml-auto text-xs text-gray-600">{bookings.length} total</span>
            )}
          </div>
          {bookings && bookings.length > 0 ? (
            <div className="space-y-2">
              {bookings.map((b) => {
                const eventDate = new Date(b.event_date);
                const diffDays = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isPast = diffDays < 0;
                const isToday = diffDays === 0;
                return (
                  <div
                    key={b.id}
                    className={`group flex items-center justify-between rounded-xl border px-4 py-3.5 transition-all ${
                      isPast
                        ? "border-gray-800/50 bg-gray-900/20 opacity-60"
                        : isToday
                        ? "border-yellow-400/20 bg-yellow-400/5"
                        : "border-gray-800/50 bg-gray-900/30 hover:border-gray-700/50 hover:bg-gray-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                        isPast
                          ? "bg-gray-800/40"
                          : isToday
                          ? "bg-yellow-400/10"
                          : "bg-gray-800/60"
                      }`}>
                        <Calendar className={`size-4 ${
                          isPast ? "text-gray-600" : isToday ? "text-yellow-400" : "text-gray-400"
                        }`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium capitalize ${isPast ? "text-gray-600" : "text-gray-200"}`}>
                          {b.event_type}
                        </p>
                        <p className="text-xs text-gray-600">
                          {eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <span
                      suppressHydrationWarning
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        isPast
                          ? "bg-gray-800/30 text-gray-600"
                          : isToday
                          ? "bg-yellow-400/10 text-yellow-400"
                          : "bg-gray-800/30 text-gray-400"
                      }`}
                    >
                      {isPast ? "Past" : isToday ? "Today!" : `${diffDays}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-800/40">
                <Calendar className="size-6 text-gray-600" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">No upcoming events</p>
              <p className="mt-1 text-xs text-gray-600">
                {isClient
                  ? "Book your first event to get started"
                  : "No events scheduled yet"}
              </p>
              {isClient && (
                <Link
                  href="/dashboard/client/book"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-yellow-500"
                >
                  <Calendar className="size-4" />
                  Book Now
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
