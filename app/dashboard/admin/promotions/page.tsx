import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export default async function PromotionManagement() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const { data: promotions } = await supabase
    .from("promotion_recommendations")
    .select("*, profiles!promotion_recommendations_employee_id_fkey(full_name, email), profiles!promotion_recommendations_recommended_by_fkey(full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Promotion Recommendations</h1>
        <p className="mt-1 text-gray-400">Review and confirm/reject promotion recommendations from HR and managers.</p>
      </div>

      <div className="space-y-3">
        {(!promotions || promotions.length === 0) && (
          <p className="text-sm text-gray-500">No pending promotion recommendations.</p>
        )}
        {promotions?.map((rec: Record<string, unknown>) => {
          const employee = rec.profiles as Record<string, unknown> | null;
          const recommender = (rec as Record<string, unknown>).profiles as Record<string, unknown> | null;
          return (
            <div key={rec.id as string} className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {employee?.full_name as string ?? "Unknown"} → {rec.promotion_type as string}
                  </p>
                  <p className="text-xs text-gray-500">Recommended by: {recommender?.full_name as string ?? "Unknown"}</p>
                  {(rec.reason as string) && <p className="mt-1 text-xs text-gray-400">Reason: {rec.reason as string}</p>}
                </div>
                <div className="flex gap-2">
                  <form suppressHydrationWarning action={async () => {
                    "use server";
                    const supabase = await createClient();
                    const [{ error: err1 }, { error: err2 }] = await Promise.all([
                      supabase.from("promotion_recommendations").update({ status: "confirmed", reviewed_by: user.uid, reviewed_at: new Date().toISOString() }).eq("id", rec.id as string),
                      supabase.from("profiles").update({ role: "staff" }).eq("id", rec.employee_id as string),
                    ]);
                    if (err1 || err2) { redirect("/dashboard/admin/promotions"); }
                    redirect("/dashboard/admin/promotions");
                  }}>
                    <button type="submit" className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-all">
                      <CheckCircle className="size-3.5" /> Confirm
                    </button>
                  </form>
                  <form suppressHydrationWarning action={async () => {
                    "use server";
                    const supabase = await createClient();
                    const { error } = await supabase.from("promotion_recommendations").update({ status: "rejected", reviewed_by: user.uid, reviewed_at: new Date().toISOString() }).eq("id", rec.id as string);
                    if (error) { redirect("/dashboard/admin/promotions"); }
                    redirect("/dashboard/admin/promotions");
                  }}>
                    <button type="submit" className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-all">
                      <XCircle className="size-3.5" /> Reject
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
