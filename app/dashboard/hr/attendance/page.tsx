import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default async function AttendanceManagement() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("attendance_logs")
    .select("*, profiles!attendance_logs_employee_id_fkey(full_name, email)")
    .is("confirmed_by", null)
    .order("timestamp", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Attendance Logs</h1>
        <p className="mt-1 text-gray-400">Review and confirm employee attendance entries.</p>
      </div>

      <div className="space-y-3">
        {(!logs || logs.length === 0) && (
          <p className="text-sm text-gray-500">No unconfirmed attendance logs.</p>
        )}
        {logs?.map((log) => {
          const profile = log.profiles as Record<string, unknown> | null;
          return (
            <div key={log.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-200">{profile?.full_name as string ?? "Unknown"}</p>
                <p className="text-xs text-gray-500">
                  {log.event} – {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
              <form suppressHydrationWarning action={async () => {
                "use server";
                const supabase = await createClient();
                const { error } = await supabase.from("attendance_logs").update({
                  confirmed_by: user.uid,
                  confirmed_at: new Date().toISOString(),
                }).eq("id", log.id);
                if (error) { redirect("/dashboard/hr/attendance?error=Confirmation failed"); }
                redirect("/dashboard/hr/attendance?success=Attendance confirmed");
              }}>
                <button type="submit" className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-all">
                  <CheckCircle className="size-3.5" /> Confirm
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
