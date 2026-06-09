import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { CalendarSync } from "lucide-react";

export default async function ClientReschedule() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const [bookingsRes, requestsRes] = await Promise.all([
    supabase.from("events_bookings").select("*").eq("client_id", user.uid).neq("status", "cancelled").order("event_date", { ascending: false }),
    supabase.from("reschedule_requests").select("*, events_bookings!reschedule_requests_booking_id_fkey(event_type, event_date)").eq("client_id", user.uid).order("created_at", { ascending: false }),
  ]);

  const bookings = bookingsRes.data ?? [];
  const requests = requestsRes.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reschedule Requests</h1>
        <p className="mt-1 text-gray-400">Request a date change for your event.</p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <CalendarSync className="size-4 text-yellow-400" />
          New Reschedule Request
        </h2>
        <form action={async (formData: FormData) => {
          "use server";
          const user = await requireUser();
          const supabase = await createClient();
          const { error } = await supabase.from("reschedule_requests").insert({
            booking_id: formData.get("booking_id") as string,
            client_id: user.uid,
            original_date: formData.get("original_date") as string,
            requested_date: formData.get("requested_date") as string,
            reason: formData.get("reason") as string || null,
          });
          if (error) { redirect("/dashboard/client/reschedule?error=Failed to submit"); }
          redirect("/dashboard/client/reschedule?success=Request submitted");
        }} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="booking_id" className="mb-1 block text-xs text-gray-500">Event</label>
            <select id="booking_id" name="booking_id" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none">
              <option value="">Select event</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.event_type} – {new Date(b.event_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="original_date" className="mb-1 block text-xs text-gray-500">Current Date</label>
            <input id="original_date" name="original_date" type="date" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="requested_date" className="mb-1 block text-xs text-gray-500">Requested New Date</label>
            <input id="requested_date" name="requested_date" type="date" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="reason" className="mb-1 block text-xs text-gray-500">Reason</label>
            <textarea id="reason" name="reason" rows={2} className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Why do you need to reschedule?" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-all">Submit Request</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-300">My Requests</h2>
        <div className="space-y-3">
          {requests.length === 0 && <p className="text-sm text-gray-500">No reschedule requests yet.</p>}
          {requests.map((req) => {
            const booking = req.events_bookings as Record<string, unknown> | null;
            return (
              <div key={req.id} className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-200 capitalize">{booking?.event_type as string ?? "Event"}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(req.original_date).toLocaleDateString()} → {new Date(req.requested_date).toLocaleDateString()}
                    </p>
                    {req.reason && <p className="mt-0.5 text-xs text-gray-400">{req.reason as string}</p>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    req.status === "approved" ? "bg-green-900/50 text-green-400" :
                    req.status === "denied" ? "bg-red-900/50 text-red-400" :
                    "bg-yellow-900/50 text-yellow-400"
                  }`}>{req.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
