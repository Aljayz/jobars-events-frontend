import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";

export default async function EmployeeSalary() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: records } = await supabase
    .from("salary_records")
    .select("*")
    .eq("employee_id", user.uid)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Salary</h1>
        <p className="mt-1 text-gray-400">View your salary records and payment history.</p>
      </div>

      <div className="space-y-3">
        {(!records || records.length === 0) && (
          <p className="text-sm text-gray-500">No salary records yet.</p>
        )}
        {records?.map((rec) => (
          <div key={rec.id} className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">PHP {rec.base_salary}</p>
                <p className="text-xs text-gray-500">{rec.pay_period as string}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                rec.status === "paid" ? "bg-green-900/50 text-green-400" :
                rec.status === "cancelled" ? "bg-red-900/50 text-red-400" :
                "bg-yellow-900/50 text-yellow-400"
              }`}>
                {rec.status}
              </span>
            </div>
            {rec.total_hours && (
              <p className="mt-1 text-xs text-gray-500">Total hours: {rec.total_hours}</p>
            )}
            {rec.net_pay && (
              <p className="text-xs text-gray-400">Net pay: PHP {rec.net_pay}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
