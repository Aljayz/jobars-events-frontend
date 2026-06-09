import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BookingStatusCell from "@/components/admin/booking-status";
import { CalendarCheck, Users, TrendingUp, Clock, CalendarSync, CheckCircle, XCircle } from "lucide-react";

export default async function EventsPipeline() {
  const supabase = await createClient();

  const [bookingsRes, rescheduleRes] = await Promise.all([
    supabase.from("events_bookings").select("*, profiles!events_bookings_client_id_fkey(full_name, email)").order("event_date", { ascending: false }),
    supabase.from("reschedule_requests").select("*, events_bookings!reschedule_requests_booking_id_fkey(event_type, event_date, status), profiles!reschedule_requests_client_id_fkey(full_name)").eq("status", "pending").order("created_at", { ascending: false }),
  ]);

  const bookings = bookingsRes.data ?? [];
  const reschedules = rescheduleRes.data ?? [];

  const total = bookings.length;
  const upcoming = bookings.filter((b) => b.status !== "cancelled" && b.status !== "completed").length;
  const totalBudget = bookings.reduce((s, b) => s + Number(b.budget ?? 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Events Pipeline</h1>
        <p className="mt-1 text-gray-400">Manage all event bookings, track statuses, and oversee operations.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Events</p>
            <CalendarCheck className="size-4 text-yellow-400" />
          </div>
          <p className="mt-2 text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Upcoming</p>
            <TrendingUp className="size-4 text-green-400" />
          </div>
          <p className="mt-2 text-2xl font-bold">{upcoming}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Budget</p>
            <Users className="size-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-bold">₱{totalBudget.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Reschedule Requests</p>
            <CalendarSync className="size-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold">{reschedules.length}</p>
        </div>
      </div>

      {reschedules.length > 0 && (
        <div className="mb-8 rounded-xl border border-amber-800/50 bg-amber-900/20 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-300">
            <CalendarSync className="size-4" />
            Pending Reschedule Requests ({reschedules.length})
          </h2>
          <div className="space-y-3">
            {reschedules.map((req) => {
              const booking = req.events_bookings as Record<string, unknown> | null;
              const profile = req.profiles as Record<string, unknown> | null;
              return (
                <div key={req.id} className="flex items-start justify-between rounded-lg border border-amber-800/30 bg-gray-900/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{profile?.full_name as string ?? "Unknown"}</p>
                    <p className="text-xs text-gray-400 capitalize">{booking?.event_type as string ?? "Event"}</p>
                    <p className="text-xs text-gray-500" suppressHydrationWarning>
                      {new Date(req.original_date).toLocaleDateString()} → {new Date(req.requested_date).toLocaleDateString()}
                    </p>
                    {req.reason && <p className="mt-1 text-xs text-gray-500">Reason: {req.reason as string}</p>}
                  </div>
                  <div className="flex gap-2">
                    <form suppressHydrationWarning action={async () => {
                      "use server";
                      const supabase = await createClient();
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;
                      const { error } = await supabase.from("reschedule_requests").update({ status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", req.id);
                      if (error) { redirect("/dashboard/admin?error=Failed to approve"); }
                      const { error: bookingError } = await supabase.from("events_bookings").update({ event_date: req.requested_date }).eq("id", req.booking_id);
                      if (bookingError) { redirect("/dashboard/admin?error=Failed to approve"); }
                      redirect("/dashboard/admin");
                    }}>
                      <button type="submit" className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-all">
                        <CheckCircle className="size-3.5" /> Approve
                      </button>
                    </form>
                    <form suppressHydrationWarning action={async () => {
                      "use server";
                      const supabase = await createClient();
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;
                      const { error } = await supabase.from("reschedule_requests").update({ status: "denied", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", req.id);
                      if (error) { redirect("/dashboard/admin?error=Failed to deny"); }
                      redirect("/dashboard/admin");
                    }}>
                      <button type="submit" className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-all">
                        <XCircle className="size-3.5" /> Deny
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="-mx-3 overflow-x-auto rounded-xl border border-gray-800 sm:-mx-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-400">Client</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-400">Event</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-400">Date</th>
              <th className="hidden whitespace-nowrap px-4 py-3 font-medium text-gray-400 sm:table-cell">Venue</th>
              <th className="hidden whitespace-nowrap px-4 py-3 font-medium text-gray-400 md:table-cell">Budget</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-400">Status</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                  <td className="max-w-[120px] px-4 py-3">
                    <div className="truncate font-medium">{booking.profiles?.full_name}</div>
                    <div className="truncate text-xs text-gray-500">{booking.profiles?.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 capitalize">{booking.event_type}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(booking.event_date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-gray-400 sm:table-cell">{booking.venue ?? "—"}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
                    {booking.budget ? `₱${Number(booking.budget).toLocaleString()}` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <BookingStatusCell bookingId={booking.id} currentStatus={booking.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/dashboard/admin/assign?booking=${booking.id}`}
                      className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      Assign Resources
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
