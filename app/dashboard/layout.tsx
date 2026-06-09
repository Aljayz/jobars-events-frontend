import { requireUser } from "@/lib/user";
import Link from "next/link";
import SignOutButton from "@/components/auth/sign-out-button";
import NotificationBell from "@/components/notifications/bell";
import SidebarNav from "@/components/layout/sidebar-nav";
import ClientModeToggle from "@/components/client-mode/toggle-button";
import FlashBanner from "@/components/ui/flash-banner";
import { Home } from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  matchSubPaths?: boolean;
}

const dashboardItem: NavItem = { href: "/dashboard", label: "Dashboard", icon: "LayoutGrid" };

const adminNav: NavItem[] = [
  dashboardItem,
  { href: "/dashboard/admin", label: "Events Pipeline", icon: "LayoutGrid" },
  { href: "/dashboard/admin/milestones", label: "Milestones", icon: "ListChecks" },
  { href: "/dashboard/admin/uploads", label: "Proof Uploads", icon: "Upload" },
  { href: "/dashboard/admin/assign", label: "Assign Resources", icon: "Repeat" },
  { href: "/dashboard/admin/create", label: "Create Event", icon: "CalendarPlus" },
  { href: "/dashboard/admin/staff", label: "Staff", icon: "UserCog" },
  { href: "/dashboard/admin/location", label: "Locations", icon: "Map" },
  { href: "/dashboard/admin/promotions", label: "Promotions", icon: "TrendingUp" },
  { href: "/dashboard/admin/clients", label: "Clients", icon: "Users" },
  { href: "/chat", label: "Event Chat", icon: "MessageSquare", matchSubPaths: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];

const hrNav: NavItem[] = [
  dashboardItem,
  { href: "/dashboard/hr", label: "HR Overview", icon: "ClipboardList" },
  { href: "/dashboard/hr/employees", label: "Employees", icon: "Users" },
  { href: "/dashboard/hr/attendance", label: "Attendance", icon: "Clock" },
  { href: "/dashboard/hr/salary", label: "Salary", icon: "DollarSign" },
  { href: "/dashboard/hr/cash-advance", label: "Cash Advances", icon: "DollarSign" },
  { href: "/dashboard/hr/promotions", label: "Promotions", icon: "TrendingUp" },
  { href: "/chat", label: "Event Chat", icon: "MessageSquare", matchSubPaths: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];

const staffNav: NavItem[] = [
  dashboardItem,
  { href: "/dashboard/staff", label: "My Tasks", icon: "ListTodo" },
  { href: "/chat", label: "Event Chat", icon: "MessageSquare", matchSubPaths: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];

const employeeNav: NavItem[] = [
  dashboardItem,
  { href: "/dashboard/employee", label: "Overview", icon: "LayoutGrid" },
  { href: "/dashboard/employee/attendance", label: "Attendance", icon: "Clock" },
  { href: "/dashboard/employee/salary", label: "Salary", icon: "DollarSign" },
  { href: "/dashboard/employee/cash-advance", label: "Cash Advance", icon: "DollarSign" },
  { href: "/chat", label: "Event Chat", icon: "MessageSquare", matchSubPaths: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];

const clientNav: NavItem[] = [
  dashboardItem,
  { href: "/dashboard/client", label: "Timeline", icon: "ListChecks" },
  { href: "/dashboard/client/approvals", label: "Approvals", icon: "CheckSquare" },
  { href: "/dashboard/client/book", label: "Book Event", icon: "CalendarPlus" },
  { href: "/dashboard/client/meetups", label: "Meetups", icon: "CalendarCheck" },
  { href: "/dashboard/client/reschedule", label: "Reschedule", icon: "CalendarSync" },
  { href: "/chat", label: "Event Chat", icon: "MessageSquare", matchSubPaths: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];

const ADMIN_ROLES = ["super-admin", "admin", "manager"];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  const role = user.role;
  const clientMode = user.client_mode === true;
  const isInternalInClientMode = clientMode && !["external-client", "client"].includes(role);

  let nav: NavItem[];
  let brand: string;
  let brandHref: string;

  if (clientMode || role === "external-client") {
    nav = clientNav;
    brand = "My Events";
    brandHref = "/dashboard/client";
  } else if (ADMIN_ROLES.includes(role)) {
    nav = adminNav;
    brand = "Jobars Admin";
    brandHref = "/dashboard/admin";
  } else if (role === "human-resource") {
    nav = hrNav;
    brand = "HR Hub";
    brandHref = "/dashboard/hr";
  } else if (role === "staff") {
    nav = staffNav;
    brand = "Staff Hub";
    brandHref = "/dashboard/staff";
  } else if (role === "employee") {
    nav = employeeNav;
    brand = "Employee Hub";
    brandHref = "/dashboard/employee";
  } else {
    nav = adminNav;
    brand = "Jobars Admin";
    brandHref = "/dashboard/admin";
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center px-3 sm:px-4">
          <div className="hidden md:flex w-56 shrink-0 items-center">
            <Link href={brandHref} className="pl-2 text-lg font-bold text-yellow-400 tracking-tight whitespace-nowrap">
              {brand}
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between py-3">
            <Link href={brandHref} className="pl-0 md:hidden text-lg font-bold text-yellow-400 tracking-tight">
              {brand}
            </Link>
            <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
              <NotificationBell />
              <span className="hidden text-sm text-gray-500 sm:inline">{user.full_name}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-0">
        <aside className="flex w-14 shrink-0 flex-col border-r border-gray-800 px-2 py-4 md:w-56">
          <Link
            href="/"
            className="flex items-center justify-center gap-3 rounded-xl px-0 py-2.5 text-gray-500 hover:text-yellow-400 transition-all md:justify-start md:px-4"
          >
            <Home className="h-5 w-5 md:h-4 md:w-4" />
            <span className="hidden md:inline text-sm">Home</span>
          </Link>
          <div className="mt-3 mb-2 border-t border-gray-800" />
          <SidebarNav items={nav} />
          {isInternalInClientMode && (
            <div className="mt-4 border-t border-gray-800 pt-4 hidden md:block">
              <ClientModeToggle active={true} />
            </div>
          )}
        </aside>
        <main className="min-w-0 flex-1 px-3 py-6 sm:px-4">
          <FlashBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
