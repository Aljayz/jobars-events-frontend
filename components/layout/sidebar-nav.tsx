"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Repeat,
  MessageSquare,
  ListChecks,
  CheckSquare,
  ListTodo,
  CalendarPlus,
  Upload,
  Bell,
  Settings,
  UserCog,
  Map,
  TrendingUp,
  CalendarCheck,
  CalendarSync,
  Clock,
  DollarSign,
  ClipboardList,
  Users,
  Home,
} from "lucide-react";
import type { ComponentType } from "react";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  LayoutGrid,
  Repeat,
  MessageSquare,
  ListChecks,
  CheckSquare,
  ListTodo,
  CalendarPlus,
  Upload,
  Bell,
  Settings,
  UserCog,
  Map,
  TrendingUp,
  CalendarCheck,
  CalendarSync,
  Clock,
  DollarSign,
  ClipboardList,
  Users,
  Home,
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
  matchSubPaths?: boolean;
}

export default function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 text-sm">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = item.matchSubPaths
          ? pathname.startsWith(item.href + "/") || pathname === item.href
          : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-center gap-3 rounded-xl px-0 ml-[1px] py-2.5 transition-all md:justify-start md:px-4 md:ml-0 ${
              isActive
                ? "bg-yellow-400/10 text-yellow-400"
                : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/5"
            }`}
          >
            {Icon && <Icon className="h-5 w-5 md:h-4 md:w-4" />}
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
