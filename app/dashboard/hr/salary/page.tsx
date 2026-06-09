import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";

export default async function SalaryManagement() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const [{ data: salaries }, { data: employees }] = await Promise.all([
    supabase
      .from("salary_records")
      .select("*, profiles!salary_records_employee_id_fkey(full_name, email)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "employee"),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Salary Records</h1>
        <p className="mt-1 text-gray-400">Manage employee payroll and salary processing.</p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Create Salary Record</h2>
        <form action={async (formData: FormData) => {
          "use server";
          const supabase = await createClient();
          const { error } = await supabase.from("salary_records").insert({
            employee_id: formData.get("employee_id") as string,
            base_salary: parseFloat(formData.get("base_salary") as string),
            pay_period: `[${formData.get("period_start")},${formData.get("period_end")}]`,
            total_hours: parseFloat(formData.get("total_hours") as string) || null,
            adjustments: parseFloat(formData.get("adjustments") as string) || 0,
          });
          if (error) { redirect("/dashboard/hr/salary?error=Failed to create salary record"); }
          redirect("/dashboard/hr/salary?success=Salary record created");
        }} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="employee_id" className="mb-1 block text-xs text-gray-500">Employee</label>
            <select id="employee_id" name="employee_id" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none">
              <option value="">Select employee</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="base_salary" className="mb-1 block text-xs text-gray-500">Base Salary</label>
            <input id="base_salary" name="base_salary" type="number" step="0.01" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="period_start" className="mb-1 block text-xs text-gray-500">Period Start</label>
            <input id="period_start" name="period_start" type="date" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="period_end" className="mb-1 block text-xs text-gray-500">Period End</label>
            <input id="period_end" name="period_end" type="date" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="total_hours" className="mb-1 block text-xs text-gray-500">Total Hours</label>
            <input id="total_hours" name="total_hours" type="number" step="0.25" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="adjustments" className="mb-1 block text-xs text-gray-500">Adjustments</label>
            <input id="adjustments" name="adjustments" type="number" step="0.01" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-all">Create Record</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Pending Salary Records</h2>
        <div className="space-y-3">
          {(!salaries || salaries.length === 0) && (
            <p className="text-sm text-gray-500">No pending salary records.</p>
          )}
          {salaries?.map((sal) => {
            const profile = sal.profiles as Record<string, unknown> | null;
            return (
              <div key={sal.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-200">{profile?.full_name as string ?? "Unknown"}</p>
                  <p className="text-xs text-gray-500">PHP {sal.base_salary} – {sal.pay_period as string}</p>
                </div>
                <form suppressHydrationWarning action={async () => {
                  "use server";
                  const supabase = await createClient();
                  const { error } = await supabase.from("salary_records").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", sal.id);
                  if (error) { redirect("/dashboard/hr/salary?error=Failed to mark as paid"); }
                  redirect("/dashboard/hr/salary?success=Marked as paid");
                }}>
                  <button type="submit" className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-all">Mark Paid</button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
