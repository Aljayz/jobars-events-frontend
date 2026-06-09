import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";

export default async function EmployeeAttendance() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("attendance_logs")
    .select("*")
    .eq("employee_id", user.uid)
    .order("timestamp", { ascending: false })
    .limit(20);

  const events = ["clock_in", "clock_out", "login", "logout"] as const;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Attendance</h1>
        <p className="mt-1 text-gray-400">Clock in/out and view your attendance history.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {events.map((event) => (
          <form key={event} action={async () => {
            "use server";
            const user = await requireUser();
            const supabase = await createClient();
            const { error } = await supabase.from("attendance_logs").insert({
              employee_id: user.uid,
              event,
            });
            if (error) { redirect("/dashboard/employee/attendance?error=Failed to log"); }
            redirect("/dashboard/employee/attendance?success=Logged");
          }}>
            <button type="submit" className="w-full rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3 text-left hover:bg-gray-900/80 transition-all">
              <Clock className="mb-2 size-5 text-yellow-400" />
              <p className="text-sm font-medium text-gray-200 capitalize">{event.replace("_", " ")}</p>
            </button>
          </form>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Recent Logs</h2>
        <div className="space-y-2">
          {(!logs || logs.length === 0) && (
            <p className="text-sm text-gray-500">No attendance logs yet.</p>
          )}
          {logs?.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-200 capitalize">{log.event.replace("_", " ")}</p>
                <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
              {log.confirmed_by && (
                <span className="text-xs text-green-400">Confirmed</span>
              )}
              {!log.confirmed_by && (
                <span className="text-xs text-yellow-400">Pending</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
