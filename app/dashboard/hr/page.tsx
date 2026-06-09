import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Clock, DollarSign, TrendingUp } from "lucide-react";

export default async function HROverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [employeesRes, attendanceRes, cashAdvanceRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "employee"),
    supabase.from("attendance_logs").select("*", { count: "exact", head: true }).eq("event", "login"),
    supabase.from("cash_advance_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">HR Overview</h1>
        <p className="mt-1 text-gray-400">Manage employees, attendance, and payroll.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Employees" value={employeesRes.count ?? 0} color="text-blue-400" href="/dashboard/hr/employees" />
        <StatCard icon={Clock} label="Today&apos;s Attendance" value={attendanceRes.count ?? 0} color="text-green-400" href="/dashboard/hr/attendance" />
        <StatCard icon={DollarSign} label="Pending Advances" value={cashAdvanceRes.count ?? 0} color="text-yellow-400" href="/dashboard/hr/cash-advance" />
        <StatCard icon={TrendingUp} label="Promotions" value="Manage" color="text-purple-400" href="/dashboard/hr/promotions" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-300">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/dashboard/hr/employees" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Manage employee records</Link>
            <Link href="/dashboard/hr/attendance" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Confirm attendance logs</Link>
            <Link href="/dashboard/hr/salary" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Process payroll</Link>
            <Link href="/dashboard/hr/promotions" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Recommend promotions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; color: string; href: string }) {
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
