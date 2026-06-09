import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CalendarPlus } from "lucide-react";

export default async function ClientBookEvent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Book an Event</h1>
        <p className="mt-1 text-gray-400">Submit a new event booking request.</p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <form action={async (formData: FormData) => {
          "use server";
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data: booking, error } = await supabase.from("events_bookings").insert({
            client_id: user.id,
            event_type: formData.get("event_type") as string,
            event_date: formData.get("event_date") as string,
            venue: formData.get("venue") as string || null,
            package_name: formData.get("package_name") as string || null,
            budget: formData.get("budget") ? parseFloat(formData.get("budget") as string) : null,
            head_count: formData.get("head_count") ? parseInt(formData.get("head_count") as string) : null,
            notes: formData.get("notes") as string || null,
          }).select("id").single();
          if (error) { redirect("/dashboard/client/book?error=Booking failed"); }
          if (booking) {
            redirect("/dashboard/client?success=Booking submitted");
          }
        }} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="event_type" className="mb-1 block text-xs text-gray-500">Event Type</label>
            <input id="event_type" name="event_type" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="e.g., Wedding, Birthday, Corporate" />
          </div>
          <div>
            <label htmlFor="event_date" className="mb-1 block text-xs text-gray-500">Event Date</label>
            <input id="event_date" name="event_date" type="date" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="venue" className="mb-1 block text-xs text-gray-500">Venue</label>
            <input id="venue" name="venue" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Venue name or address" />
          </div>
          <div>
            <label htmlFor="package_name" className="mb-1 block text-xs text-gray-500">Package</label>
            <input id="package_name" name="package_name" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Package name" />
          </div>
          <div>
            <label htmlFor="budget" className="mb-1 block text-xs text-gray-500">Budget (PHP)</label>
            <input id="budget" name="budget" type="number" step="0.01" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="head_count" className="mb-1 block text-xs text-gray-500">Head Count</label>
            <input id="head_count" name="head_count" type="number" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="mb-1 block text-xs text-gray-500">Notes</label>
            <textarea id="notes" name="notes" rows={3} className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Any special requests or notes" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="flex items-center gap-2 rounded-lg bg-yellow-400 px-6 py-2.5 text-sm font-medium text-black hover:bg-yellow-500 transition-all">
              <CalendarPlus className="size-4" /> Submit Booking Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
