import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/auth/sign-out-button";
import NotificationBell from "@/components/notifications/bell";
import SidebarNav from "@/components/layout/sidebar-nav";
import ClientModeToggle from "@/components/client-mode/toggle-button";
import FlashBanner from "@/components/ui/flash-banner";
import type { ReactNode } from "react";

const nav = [
  { href: "/dashboard/employee", label: "Overview", icon: "LayoutGrid" },
  { href: "/dashboard/employee/attendance", label: "Attendance", icon: "Clock" },
  { href: "/dashboard/employee/salary", label: "Salary", icon: "DollarSign" },
  { href: "/dashboard/employee/cash-advance", label: "Cash Advance", icon: "DollarSign" },
  { href: "/dashboard/chat", label: "Event Chat", icon: "MessageSquare", matchSubPaths: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (user.role !== "employee") redirect(`/dashboard/${user.role}`);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/dashboard/employee" className="text-lg font-bold text-yellow-400 tracking-tight">
            Employee Hub
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <NotificationBell />
            <span className="hidden text-sm text-gray-500 sm:inline">{user.full_name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl">
        <aside className="w-14 shrink-0 border-r border-gray-800 px-2 py-4 md:w-56 md:px-3">
          <SidebarNav items={nav} />
          <div className="mt-4 border-t border-gray-800 pt-4">
            <ClientModeToggle active={false} />
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-3 py-6 sm:px-4">
          <FlashBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
