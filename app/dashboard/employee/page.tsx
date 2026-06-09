import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, DollarSign, ListTodo } from "lucide-react";

export default async function EmployeeOverview() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const [attendanceRes, salaryRes, cashAdvanceRes] = await Promise.all([
    supabase.from("attendance_logs").select("*", { count: "exact", head: true }).eq("employee_id", user.uid),
    supabase.from("salary_records").select("*", { count: "exact", head: true }).eq("employee_id", user.uid).eq("status", "pending"),
    supabase.from("cash_advance_requests").select("*", { count: "exact", head: true }).eq("employee_id", user.uid).eq("status", "approved"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.full_name as string ?? "Employee"}</h1>
        <p className="mt-1 text-gray-400">Your work overview at a glance.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="My Attendance Logs" value={attendanceRes.count ?? 0} color="text-blue-400" href="/dashboard/employee/attendance" />
        <StatCard icon={DollarSign} label="Pending Salary" value={salaryRes.count ?? 0} color="text-green-400" href="/dashboard/employee/salary" />
        <StatCard icon={DollarSign} label="Approved Advances" value={cashAdvanceRes.count ?? 0} color="text-yellow-400" href="/dashboard/employee/cash-advance" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
            <ListTodo className="size-4 text-yellow-400" />
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link href="/dashboard/employee/attendance" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Clock in / Clock out</Link>
            <Link href="/dashboard/employee/salary" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">View expected salary</Link>
            <Link href="/dashboard/employee/cash-advance" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Request cash advance</Link>
            <Link href="/chat" className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all">Open event chat</Link>
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
