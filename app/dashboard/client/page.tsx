import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import MilestoneCheckbox from "@/components/client/milestone-checkbox";
import EventRatingForm from "@/components/ratings/event-rating-form";
import { CalendarDays, MapPin, Users, Wallet, ListChecks, Star } from "lucide-react";

export default async function ClientTimeline() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("events_bookings")
    .select("*")
    .eq("client_id", user.uid)
    .order("event_date", { ascending: true });

  const booking = bookings?.[0];

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 p-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-800">
          <CalendarDays className="size-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-300">No Events Yet</h2>
        <p className="mt-2 text-sm text-gray-500">You don&apos;t have any upcoming events. Contact our team to get started!</p>
      </div>
    );
  }

  const eventDate = new Date(booking.event_date);
  const today = new Date();
  const diffMs = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isPast = diffDays < 0;
  const isCompleted = booking.status === "completed";

  const [milestonesRes, ratingsRes] = await Promise.all([
    supabase.from("event_milestones").select("*").eq("booking_id", booking.id).order("sort_order", { ascending: true }),
    supabase.from("event_ratings").select("*").eq("booking_id", booking.id).eq("client_id", user.uid).maybeSingle(),
  ]);

  const milestones = milestonesRes.data;
  const existingRating = ratingsRes.data;

  const total = milestones?.length ?? 0;
  const done = milestones?.filter((m) => m.is_completed).length ?? 0;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
          <div className="relative mx-auto mb-3 flex size-32 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgb(31,41,55)" strokeWidth="8" />
              {total > 0 && (
                <circle
                  cx="60" cy="60" r="54"
                  fill="none" stroke="currentColor" strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progressPct / 100) * circumference}
                  strokeLinecap="round"
                  className="text-yellow-400 transition-all duration-700"
                />
              )}
            </svg>
            <div className="text-center">
              <p className={`text-3xl font-bold ${isPast ? "text-gray-500" : "text-yellow-400"}`}>
                {isPast ? 0 : diffDays}
              </p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                {isPast ? "Event was" : "days to go"}
              </p>
            </div>
          </div>
          <p className="text-sm font-medium capitalize text-gray-200">{booking.event_type}</p>
          <p className="mt-1 text-xs text-gray-500">
            {eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Event Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="size-4 text-yellow-400/70 shrink-0" />
              <span className="text-gray-400">Date:</span>
              <span className="ml-auto text-gray-200">
                {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Wallet className="size-4 text-yellow-400/70 shrink-0" />
              <span className="text-gray-400">Budget:</span>
              <span className="ml-auto text-gray-200">
                {booking.budget ? `₱${Number(booking.budget).toLocaleString()}` : "—"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users className="size-4 text-yellow-400/70 shrink-0" />
              <span className="text-gray-400">Guests:</span>
              <span className="ml-auto text-gray-200">{booking.head_count ?? "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="size-4 text-yellow-400/70 shrink-0" />
              <span className="text-gray-400">Venue:</span>
              <span className="ml-auto text-gray-200">{booking.venue ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Event Timeline</h2>
            <span className="text-sm text-gray-500">
              {done}/{total} done
            </span>
          </div>
          {milestones && milestones.length > 0 ? (
            <div className="relative space-y-0">
              {milestones.map((ms, idx) => (
                <MilestoneCheckbox key={ms.id} milestone={ms} isLast={idx === milestones.length - 1} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ListChecks className="mb-2 size-8 text-gray-600" />
              <p className="text-sm text-gray-500">No timeline items yet.</p>
              <p className="text-xs text-gray-600 mt-1">Your coordinator will add milestones for your event.</p>
            </div>
          )}
        </div>

        {isCompleted && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Star className="size-5 text-yellow-400" />
              Rate Your Event
            </h2>
            <EventRatingForm bookingId={booking.id} existingRating={existingRating ?? undefined} />
          </div>
        )}
      </div>
    </div>
  );
}
