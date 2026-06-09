import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";

export default async function EmployeeList() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("profiles")
    .select("*, employee_records(*)")
    .in("role", ["employee", "staff"])
    .order("full_name");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="mt-1 text-gray-400">Manage employee records and information.</p>
        </div>
        <form action={async (formData: FormData) => {
          "use server";
          const user = await requireUser();
          const supabase = await createClient();
          const { error } = await supabase.from("employee_records").insert({
            profile_id: formData.get("profile_id") as string,
            employee_id: formData.get("employee_id") as string,
            date_hired: formData.get("date_hired") as string || null,
            department: formData.get("department") as string || null,
            position: formData.get("position") as string || null,
            emergency_contact: formData.get("emergency_contact") as string || null,
            emergency_phone: formData.get("emergency_phone") as string || null,
          });
          if (error) { redirect("/dashboard/hr/employees?error=Failed to create record"); }
          redirect("/dashboard/hr/employees?success=Record created");
        }}>
          <button type="submit" className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-all">
            <Plus className="size-4" /> Add Record
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="px-4 py-3 text-left font-medium text-gray-400">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-400">Role</th>
              <th className="px-4 py-3 text-left font-medium text-gray-400">Employee ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-400">Department</th>
              <th className="px-4 py-3 text-left font-medium text-gray-400">Position</th>
            </tr>
          </thead>
          <tbody>
            {(!employees || employees.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No employees found.</td>
              </tr>
            )}
            {employees?.map((emp) => {
              const record = emp.employee_records as Record<string, unknown> | null;
              return (
                <tr key={emp.id} className="border-b border-gray-800 hover:bg-gray-900/30">
                  <td className="px-4 py-3 font-medium text-gray-200">{emp.full_name}</td>
                  <td className="px-4 py-3 text-gray-400">{emp.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs capitalize text-gray-300">{emp.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{record?.employee_id as string ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{record?.department as string ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{record?.position as string ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Add Employee Record</h2>
        <form action={async (formData: FormData) => {
          "use server";
          const { error } = await supabase.from("employee_records").insert({
            profile_id: formData.get("profile_id") as string,
            employee_id: formData.get("employee_id") as string,
            date_hired: formData.get("date_hired") as string || null,
            department: formData.get("department") as string || null,
            position: formData.get("position") as string || null,
            emergency_contact: formData.get("emergency_contact") as string || null,
            emergency_phone: formData.get("emergency_phone") as string || null,
          });
          if (error) { redirect("/dashboard/hr/employees?error=Failed to create record"); }
          redirect("/dashboard/hr/employees?success=Record created");
        }} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile_id" className="mb-1 block text-xs text-gray-500">Profile ID</label>
            <input id="profile_id" name="profile_id" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="User UUID" />
          </div>
          <div>
            <label htmlFor="employee_id" className="mb-1 block text-xs text-gray-500">Employee ID</label>
            <input id="employee_id" name="employee_id" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="e.g., JBE-001" />
          </div>
          <div>
            <label htmlFor="date_hired" className="mb-1 block text-xs text-gray-500">Date Hired</label>
            <input id="date_hired" name="date_hired" type="date" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="department" className="mb-1 block text-xs text-gray-500">Department</label>
            <input id="department" name="department" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="e.g., Operations" />
          </div>
          <div>
            <label htmlFor="position" className="mb-1 block text-xs text-gray-500">Position</label>
            <input id="position" name="position" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="e.g., Event Coordinator" />
          </div>
          <div>
            <label htmlFor="emergency_contact" className="mb-1 block text-xs text-gray-500">Emergency Contact</label>
            <input id="emergency_contact" name="emergency_contact" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Name" />
          </div>
          <div>
            <label htmlFor="emergency_phone" className="mb-1 block text-xs text-gray-500">Emergency Phone</label>
            <input id="emergency_phone" name="emergency_phone" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Phone" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-all">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}
