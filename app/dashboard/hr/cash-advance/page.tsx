import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export default async function CashAdvanceManagement() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("cash_advance_requests")
    .select("*, profiles!cash_advance_requests_employee_id_fkey(full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cash Advance Requests</h1>
        <p className="mt-1 text-gray-400">Review and approve/reject employee cash advance requests.</p>
      </div>

      <div className="space-y-3">
        {(!requests || requests.length === 0) && (
          <p className="text-sm text-gray-500">No pending cash advance requests.</p>
        )}
        {requests?.map((req) => {
          const profile = req.profiles as Record<string, unknown> | null;
          return (
            <div key={req.id} className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">{profile?.full_name as string ?? "Unknown"}</p>
                  <p className="text-xs text-gray-500">Amount: PHP {req.amount}</p>
                  {req.reason && <p className="mt-1 text-xs text-gray-400">Reason: {req.reason as string}</p>}
                </div>
                <div className="flex gap-2">
                  <form suppressHydrationWarning action={async () => {
                    "use server";
                    const supabase = await createClient();
                    const { error } = await supabase.from("cash_advance_requests").update({ status: "approved", reviewed_by: user.uid, reviewed_at: new Date().toISOString() }).eq("id", req.id);
                    if (error) { redirect("/dashboard/hr/cash-advance?error=Failed to approve"); }
                    redirect("/dashboard/hr/cash-advance?success=Approved");
                  }}>
                    <button type="submit" className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-all">
                      <CheckCircle className="size-3.5" /> Approve
                    </button>
                  </form>
                  <form suppressHydrationWarning action={async () => {
                    "use server";
                    const supabase = await createClient();
                    const { error } = await supabase.from("cash_advance_requests").update({ status: "denied", reviewed_by: user.uid, reviewed_at: new Date().toISOString() }).eq("id", req.id);
                    if (error) { redirect("/dashboard/hr/cash-advance?error=Failed to deny"); }
                    redirect("/dashboard/hr/cash-advance?success=Denied");
                  }}>
                    <button type="submit" className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-all">
                      <XCircle className="size-3.5" /> Deny
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
