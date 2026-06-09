import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";

export default async function LocationPermissions() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const [managersRes, permissionsRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").eq("role", "manager"),
    supabase.from("permanent_location_permissions").select("*, profiles!permanent_location_permissions_manager_id_fkey(full_name, email)").eq("is_active", true),
  ]);

  const managers = managersRes.data ?? [];
  const permissions = permissionsRes.data ?? [];
  const permittedIds = new Set(permissions.map((p) => p.manager_id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Location Permissions</h1>
        <p className="mt-1 text-gray-400">Grant or revoke permanent location update permissions to managers.</p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <Shield className="size-4 text-yellow-400" />
          Managers
        </h2>
        <div className="space-y-3">
          {managers.length === 0 && <p className="text-sm text-gray-500">No managers found.</p>}
          {managers.map((mgr) => {
            const hasPermission = permittedIds.has(mgr.id);
            return (
              <div key={mgr.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-200">{mgr.full_name}</p>
                  <p className="text-xs text-gray-500">{mgr.email}</p>
                </div>
                {hasPermission ? (
                  <form action={async () => {
                    "use server";
                    const supabase = await createClient();
                    const { error } = await supabase.from("permanent_location_permissions").update({ is_active: false }).eq("manager_id", mgr.id);
                    if (error) { redirect("/dashboard/admin/location/permissions"); }
                    redirect("/dashboard/admin/location/permissions");
                  }}>
                    <button type="submit" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-all">Revoke</button>
                  </form>
                ) : (
                  <form action={async () => {
                    "use server";
                    const [user, supabase] = await Promise.all([requireUser(), createClient()]);
                    const { error } = await supabase.from("permanent_location_permissions").insert({ manager_id: mgr.id, granted_by: user.uid });
                    if (error) { redirect("/dashboard/admin/location/permissions"); }
                    redirect("/dashboard/admin/location/permissions");
                  }}>
                    <button type="submit" className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-all">Grant Permission</button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
