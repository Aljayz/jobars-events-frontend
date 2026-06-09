import { createClient } from "@/utils/supabase/server";
import { promoteToStaff, demoteFromStaff } from "../actions";
import { UserPlus, UserMinus, Shield } from "lucide-react";

export default async function StaffManagement() {
  const supabase = await createClient();

  const [staffRes, clientsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "staff")
      .order("full_name"),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "client")
      .order("full_name"),
  ]);

  const staff = staffRes.data;
  const clients = clientsRes.data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <p className="mt-1 text-gray-400">Manage staff accounts and promote users.</p>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
          <Shield className="size-4 text-yellow-400" />
          Current Staff ({staff?.length ?? 0})
        </h2>
        <div className="space-y-1">
          {staff && staff.length > 0 ? (
            staff.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/30 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-200 truncate">{s.full_name}</p>
                  <p className="text-xs text-gray-500">{s.email}</p>
                </div>
                <form action={demoteFromStaff}>
                  <input type="hidden" name="profileId" value={s.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <UserMinus className="size-3" />
                    Remove
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No staff accounts yet.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
          <UserPlus className="size-4 text-green-400" />
          Clients ({clients?.length ?? 0})
        </h2>
        <div className="space-y-1">
          {clients && clients.length > 0 ? (
            clients.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/30 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-200 truncate">{c.full_name}</p>
                  <p className="text-xs text-gray-500">{c.email}</p>
                </div>
                <form action={promoteToStaff}>
                  <input type="hidden" name="profileId" value={c.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-400/10 transition-all"
                  >
                    <UserPlus className="size-3" />
                    Promote
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No clients found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
