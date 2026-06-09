import { createClient } from "@/utils/supabase/server";
import { createBooking } from "../actions";
import { CalendarPlus } from "lucide-react";

export default async function CreateEventPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "client")
    .order("full_name");

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Event Booking</h1>
        <p className="mt-1 text-gray-400">Add a new event for an existing client.</p>
      </div>

      <form action={createBooking} className="space-y-5 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div>
          <label htmlFor="clientEmail" className="mb-1.5 block text-sm font-medium text-gray-300">Client</label>
          <select
            name="clientEmail"
            id="clientEmail"
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
          >
            <option value="">Select a client\u2026</option>
            {clients?.map((c) => (
              <option key={c.id} value={c.email}>
                {c.full_name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="eventType" className="mb-1.5 block text-sm font-medium text-gray-300">Event Type *</label>
            <select
              name="eventType"
              id="eventType"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
            >
              <option value="">Select type\u2026</option>
              <option value="wedding">Wedding</option>
              <option value="debut">Debut</option>
              <option value="corporate_event">Corporate Event</option>
              <option value="birthday">Birthday</option>
              <option value="social_gathering">Social Gathering</option>
            </select>
          </div>
          <div>
            <label htmlFor="eventDate" className="mb-1.5 block text-sm font-medium text-gray-300">Event Date *</label>
            <input
              type="date"
              name="eventDate"
              id="eventDate"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="venue" className="mb-1.5 block text-sm font-medium text-gray-300">Venue</label>
          <input
            type="text"
            name="venue"
            id="venue"
            placeholder="Event venue / location"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="budget" className="mb-1.5 block text-sm font-medium text-gray-300">Budget</label>
            <input
              type="number"
              name="budget"
              id="budget"
              placeholder="0"
              min={0}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="headCount" className="mb-1.5 block text-sm font-medium text-gray-300">Head Count</label>
            <input
              type="number"
              name="headCount"
              id="headCount"
              placeholder="0"
              min={0}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="packageName" className="mb-1.5 block text-sm font-medium text-gray-300">Package</label>
            <input
              type="text"
              name="packageName"
              id="packageName"
              placeholder="Package name"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-300">Notes</label>
          <textarea
            name="notes"
            id="notes"
            rows={3}
            placeholder="Additional notes or special requests..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95"
        >
          <CalendarPlus className="size-4" />
          Create Booking
        </button>
      </form>
    </div>
  );
}
