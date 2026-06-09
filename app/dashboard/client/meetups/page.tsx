import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { CalendarCheck, XCircle } from "lucide-react";

export default async function ClientMeetups() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const { data: meetups } = await supabase
    .from("meetup_bookings")
    .select("*")
    .eq("client_id", user.uid)
    .order("meetup_date", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Meetup Bookings</h1>
        <p className="mt-1 text-gray-400">Schedule a meetup with the organizer.</p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <CalendarCheck className="size-4 text-yellow-400" />
          Schedule a Meetup
        </h2>
        <form action={async (formData: FormData) => {
          "use server";
          const user = await requireUser();
          const supabase = await createClient();
          const { error } = await supabase.from("meetup_bookings").insert({
            client_id: user.uid,
            meetup_date: formData.get("meetup_date") as string,
            purpose: formData.get("purpose") as string || null,
          });
          if (error) { redirect("/dashboard/client/meetups?error=Booking failed"); }
          redirect("/dashboard/client/meetups?success=Meetup booked");
        }} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="meetup_date" className="mb-1 block text-xs text-gray-500">Preferred Date & Time</label>
            <input id="meetup_date" name="meetup_date" type="datetime-local" required className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="purpose" className="mb-1 block text-xs text-gray-500">Purpose</label>
            <input id="purpose" name="purpose" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none" placeholder="Reason for meetup" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-all">Book Meetup</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-300">My Meetups</h2>
        <div className="space-y-3">
          {(!meetups || meetups.length === 0) && (
            <p className="text-sm text-gray-500">No meetup bookings yet.</p>
          )}
          {meetups?.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-200">
                  {new Date(m.meetup_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                {m.purpose && <p className="text-xs text-gray-500">{m.purpose as string}</p>}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                m.status === "approved" ? "bg-green-900/50 text-green-400" :
                m.status === "cancelled" ? "bg-red-900/50 text-red-400" :
                "bg-yellow-900/50 text-yellow-400"
              }`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
