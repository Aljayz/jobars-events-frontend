import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

export default async function EmployeeCashAdvance() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const { data: requests } = await supabase
    .from("cash_advance_requests")
    .select("*")
    .eq("employee_id", user.uid)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cash Advance</h1>
        <p className="mt-1 text-gray-400">Request and track cash advance requests.</p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <Plus className="size-4 text-yellow-400" />
          New Request
        </h2>
        <form action={async (formData: FormData) => {
          "use server";
          const user = await requireUser();
          const supabase = await createClient();
          const { error } = await supabase.from("cash_advance_requests").insert({
            employee_id: user.uid,
            amount: parseFloat(formData.get("amount") as string),
            reason: formData.get("reason") as string || null,
          });
          if (error) { redirect("/dashboard/employee/cash-advance?error=Failed to submit"); }
          redirect("/dashboard/employee/cash-advance?success=Request submitted");
        }} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="mb-1 block text-xs text-gray-500">Amount (PHP)</label>
            <input id="amount" name="amount" type="number" step="0.01" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="reason" className="mb-1 block text-xs text-gray-500">Reason</label>
            <input id="reason" name="reason" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Optional reason" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-all">Submit Request</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-300">My Requests</h2>
        <div className="space-y-3">
          {(!requests || requests.length === 0) && (
            <p className="text-sm text-gray-500">No cash advance requests yet.</p>
          )}
          {requests?.map((req) => (
            <div key={req.id} className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">PHP {req.amount}</p>
                  {req.reason && <p className="text-xs text-gray-500">{req.reason as string}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  req.status === "approved" ? "bg-green-900/50 text-green-400" :
                  req.status === "denied" ? "bg-red-900/50 text-red-400" :
                  req.status === "released" ? "bg-blue-900/50 text-blue-400" :
                  "bg-yellow-900/50 text-yellow-400"
                }`}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
