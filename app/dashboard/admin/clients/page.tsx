import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { adminAuth } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";

export default async function ClientConversion() {
  const user = await requireUser();
  const supabase = await createClient();

  const [clientsRes, conversionsRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, created_at").eq("role", "external-client").order("full_name"),
    supabase.from("client_conversion_requests").select("*, profiles!client_conversion_requests_client_id_fkey(full_name)").order("created_at", { ascending: false }).limit(50),
  ]);

  const clients = clientsRes.data ?? [];
  const conversions = conversionsRes.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Client Conversion</h1>
        <p className="mt-1 text-gray-400">Convert external clients to internal employees.</p>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">External Clients</h2>
        <div className="space-y-3">
          {clients.length === 0 && <p className="text-sm text-gray-500">No external clients found.</p>}
          {clients.map((client) => (
            <div key={client.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-200">{client.full_name}</p>
                <p className="text-xs text-gray-500">{client.email}</p>
              </div>
              <form action={async () => {
                "use server";
                const user = await requireUser();
                const supabase = await createClient();
                const [{ error: err1 }, { error: err2 }] = await Promise.all([
                  supabase.from("client_conversion_requests").insert({
                    client_id: client.id,
                    new_role: "employee",
                    created_by: user.uid,
                  }),
                  supabase.from("profiles").update({ role: "employee" }).eq("id", client.id),
                ]);
                await adminAuth.setCustomUserClaims(client.id, {
                  role: "employee", client_mode: true, full_name: "",
                });
                if (err1 || err2) { redirect("/dashboard/admin/clients?error=Conversion failed"); }
                redirect("/dashboard/admin/clients?success=Converted successfully");
              }}>
                <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-medium text-black hover:bg-yellow-500 transition-all">
                  <UserPlus className="size-3.5" /> Convert to Employee
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Conversion History</h2>
        <div className="space-y-2">
          {conversions.length === 0 && <p className="text-sm text-gray-500">No conversions yet.</p>}
          {conversions.map((c) => {
            const profile = c.profiles as Record<string, unknown> | null;
            return (
              <div key={c.id} className="rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-2.5">
                <p className="text-sm text-gray-300">{profile?.full_name as string ?? "Unknown"} → {c.new_role}</p>
                <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
