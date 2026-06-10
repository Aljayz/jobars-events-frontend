import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import Link from "next/link";
import FlashBanner from "@/components/ui/flash-banner";
import { getCachedLocations } from "@/lib/locations";
import { resolveGoogleMapsUrl } from "@/lib/maps";
import { MapPin, CheckCircle, XCircle, Send, Plus } from "lucide-react";

export default async function LocationManagement() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const role = user.role as string;
  const isAdmin = ["admin", "super-admin"].includes(role);
  const isManager = role === "manager" || isAdmin;

  const [locations, requestsRes, permRes] = await Promise.all([
    getCachedLocations(),
    supabase.from("location_update_requests").select("*, profiles!location_update_requests_requested_by_fkey(full_name, email)").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("permanent_location_permissions").select("id").eq("manager_id", user.uid).eq("is_active", true).maybeSingle(),
  ]);

  const requests = requestsRes.data ?? [];
  const hasPermanentPerm = !!permRes.data;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Locations</h1>
          <p className="mt-1 text-gray-400">
            {isAdmin ? "Manage locations and approve manager updates." : "Request location updates."}
          </p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/admin/location/permissions" className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-all">
            Permissions
          </Link>
        )}
      </div>

      <FlashBanner />

      {/* Manager/Admin: Submit Location Update */}
      {isManager && (
        <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
            <Send className="size-4 text-yellow-400" />
            {hasPermanentPerm ? "Update Location" : "Request Location Update"}
          </h2>
          <form action={async (formData: FormData) => {
            "use server";
            const [user, supabase] = await Promise.all([requireUser(), createClient()]);
            let isDirectUpdate = false;
            let maps_url = "";
            let mapError: string | null = null;

            try {
              const resolved = await resolveGoogleMapsUrl(formData.get("maps_url") as string);
              maps_url = resolved.maps_url;
            } catch (e) {
              mapError = (e as Error).message;
            }

            if (mapError) {
              redirect(`/dashboard/admin/location?error=${encodeURIComponent(mapError)}`);
            }

            const payload = {
              name: formData.get("name") as string,
              address: formData.get("address") as string,
              maps_url,
            };

            const { data: perm } = await supabase.from("permanent_location_permissions").select("id").eq("manager_id", user.uid).eq("is_active", true).maybeSingle();
            isDirectUpdate = !!perm;

            if (perm) {
              const { error } = await supabase.from("business_locations").insert(payload);
              if (error) { redirect("/dashboard/admin/location?error=Failed to submit"); }
              updateTag("locations");
            } else {
              const { error } = await supabase.from("location_update_requests").insert({
                ...payload,
                requested_by: user.uid,
                reason: formData.get("reason") as string || null,
              });
              if (error) { redirect("/dashboard/admin/location?error=Failed to submit"); }
            }
            redirect(`/dashboard/admin/location?success=${isDirectUpdate ? "Location updated" : "Request submitted for review"}`);
          }} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="mb-1 block text-xs text-gray-500">Location Name</label>
              <input id="name" name="name" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="e.g., Jobars Events Main Office" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="mb-1 block text-xs text-gray-500">Address</label>
              <input id="address" name="address" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Full street address" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="maps_url" className="mb-1 block text-xs text-gray-500">Google Maps Link</label>
              <input id="maps_url" name="maps_url" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="<iframe src=&quot;https://www.google.com/maps/embed?pb=!1m18!...&quot; ...>" />
              <p className="mt-1 text-xs text-gray-500">Open Google Maps → Share → Embed a map → select <strong>Medium</strong> size → paste the entire embed code here.</p>
            </div>
            {!hasPermanentPerm && (
              <div className="sm:col-span-2">
                <label htmlFor="reason" className="mb-1 block text-xs text-gray-500">Reason for Update</label>
                <textarea id="reason" name="reason" rows={2} className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Why does this location need to be updated?" />
              </div>
            )}
            <div className="flex items-end">
              <button type="submit" className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-all">
                {hasPermanentPerm ? "Update Location" : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin: Direct Add */}
      {isAdmin && (
        <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
            <Plus className="size-4 text-yellow-400" />
            Add Location Directly
          </h2>
          <form action={async (formData: FormData) => {
            "use server";
            const [user, supabase] = await Promise.all([requireUser(), createClient()]);
            let maps_url = "";
            let mapError: string | null = null;

            try {
              const resolved = await resolveGoogleMapsUrl(formData.get("maps_url") as string);
              maps_url = resolved.maps_url;
            } catch (e) {
              mapError = (e as Error).message;
            }

            if (mapError) {
              redirect(`/dashboard/admin/location?error=${encodeURIComponent(mapError)}`);
            }

            const { error } = await supabase.from("business_locations").insert({
              name: formData.get("name") as string,
              address: formData.get("address") as string,
              maps_url,
              updated_by: user.uid,
            });
            if (error) { redirect("/dashboard/admin/location?error=Failed to add location"); }
            updateTag("locations");
            redirect("/dashboard/admin/location?success=Location added");
          }} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="mb-1 block text-xs text-gray-500">Location Name</label>
              <input id="name" name="name" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="mb-1 block text-xs text-gray-500">Address</label>
              <input id="address" name="address" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="maps_url" className="mb-1 block text-xs text-gray-500">Google Maps Link</label>
              <input id="maps_url" name="maps_url" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="<iframe src=&quot;https://www.google.com/maps/embed?pb=!1m18!...&quot; ...>" />
              <p className="mt-1 text-xs text-gray-500">Open Google Maps → Share → Embed a map → select <strong>Medium</strong> size → paste the entire embed code here.</p>
            </div>
            <div className="flex items-end">
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all">Add Location</button>
            </div>
          </form>
        </div>
      )}

      {/* Current Locations */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Current Locations</h2>
        <div className="space-y-3">
          {locations.length === 0 && <p className="text-sm text-gray-500">No locations set up yet.</p>}
          {locations.map((loc: Record<string, unknown>) => (
            <div key={loc.id as string} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-gray-200">{loc.name as string}</p>
                  <p className="text-xs text-gray-500">{loc.address as string}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(loc.is_primary as boolean) && (
                  <span className="text-xs font-medium text-yellow-400">Primary</span>
                )}
                {isAdmin && (
                  <form action={async () => {
                    "use server";
                    const supabase = await createClient();
                    const { error: unsetError } = await supabase.from("business_locations").update({ is_primary: false }).neq("is_primary", false);
                    if (unsetError) { redirect("/dashboard/admin/location?error=Failed to update"); }
                    const { error: setError } = await supabase.from("business_locations").update({ is_primary: true }).eq("id", loc.id as string);
                    if (setError) { redirect("/dashboard/admin/location?error=Failed to update"); }
                    updateTag("locations");
                    redirect("/dashboard/admin/location?success=Primary location updated");
                  }}>
                    <button type="submit" className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">Set as Primary</button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Requests (Admin only) */}
      {isAdmin && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-300">Pending Update Requests</h2>
          <div className="space-y-3">
            {requests.length === 0 && <p className="text-sm text-gray-500">No pending requests.</p>}
            {requests.map((req: Record<string, unknown>) => {
              const profile = req.profiles as Record<string, unknown> | null;
              return (
                <div key={req.id as string} className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{req.name as string}</p>
                      <p className="text-xs text-gray-500">{req.address as string}</p>
                      {(req.reason as string) && <p className="mt-1 text-xs text-gray-400">Reason: {req.reason as string}</p>}
                      {profile && <p className="mt-1 text-xs text-gray-500">Requested by: {profile.full_name as string}</p>}
                    </div>
                    <div className="flex gap-2">
                      <form suppressHydrationWarning action={async () => {
                        "use server";
                        const [user, supabase] = await Promise.all([requireUser(), createClient()]);
                        const { error: updateError } = await supabase.from("location_update_requests").update({ status: "approved", reviewed_by: user.uid, reviewed_at: new Date().toISOString() }).eq("id", req.id as string);
                        if (updateError) { redirect("/dashboard/admin/location?error=Failed to approve"); }
                        const { error: insertError } = await supabase.from("business_locations").insert({
                          name: req.name as string,
                          address: req.address as string,
                          maps_url: req.maps_url as string,
                        });
                        if (insertError) { redirect("/dashboard/admin/location?error=Failed to approve"); }
                        updateTag("locations");
                        redirect("/dashboard/admin/location?success=Request approved");
                      }}>
                        <button type="submit" className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-all">
                          <CheckCircle className="size-3.5" /> Approve
                        </button>
                      </form>
                      <form suppressHydrationWarning action={async () => {
                        "use server";
                        const [user, supabase] = await Promise.all([requireUser(), createClient()]);
                        const { error } = await supabase.from("location_update_requests").update({ status: "denied", reviewed_by: user.uid, reviewed_at: new Date().toISOString() }).eq("id", req.id as string);
                        if (error) { redirect("/dashboard/admin/location?error=Failed to deny"); }
                        redirect("/dashboard/admin/location?success=Request denied");
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
      )}
    </div>
  );
}
