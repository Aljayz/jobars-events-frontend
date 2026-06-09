import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";

export default async function HRPromotions() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: employees }, { data: recommendations }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "employee"),
    supabase
      .from("promotion_recommendations")
      .select("*, profiles!promotion_recommendations_employee_id_fkey(full_name)")
      .eq("recommended_by", user.uid)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Promotion Recommendations</h1>
        <p className="mt-1 text-gray-400">Recommend employees for promotion to staff.</p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <TrendingUp className="size-4 text-yellow-400" />
          Recommend Promotion
        </h2>
        <form action={async (formData: FormData) => {
          "use server";
          const user = await requireUser();
          const supabase = await createClient();
          const { error } = await supabase.from("promotion_recommendations").insert({
            employee_id: formData.get("employee_id") as string,
            recommended_by: user.uid,
            promotion_type: "employee_to_staff",
            reason: formData.get("reason") as string || null,
          });
          if (error) { redirect("/dashboard/hr/promotions?error=Failed to submit"); }
          redirect("/dashboard/hr/promotions?success=Recommendation submitted");
        }} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="employee_id" className="mb-1 block text-xs text-gray-500">Employee</label>
            <select id="employee_id" name="employee_id" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none">
              <option value="">Select employee</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="reason" className="mb-1 block text-xs text-gray-500">Reason</label>
            <input id="reason" name="reason" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Why does this employee deserve promotion?" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-all">Submit Recommendation</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-300">My Recommendations</h2>
        <div className="space-y-3">
          {(!recommendations || recommendations.length === 0) && (
            <p className="text-sm text-gray-500">No recommendations made yet.</p>
          )}
          {recommendations?.map((rec) => {
            const employee = rec.profiles as Record<string, unknown> | null;
            return (
              <div key={rec.id} className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{employee?.full_name as string ?? "Unknown"}</p>
                    <p className="text-xs text-gray-500 capitalize">Status: {rec.status}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    rec.status === "confirmed" ? "bg-green-900/50 text-green-400" :
                    rec.status === "rejected" ? "bg-red-900/50 text-red-400" :
                    "bg-yellow-900/50 text-yellow-400"
                  }`}>
                    {rec.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
