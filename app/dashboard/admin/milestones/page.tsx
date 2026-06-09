import { createClient } from "@/utils/supabase/server";
import { createMilestone, deleteMilestone } from "../actions";
import { Check, Trash2, Plus, CalendarDays } from "lucide-react";

export default async function MilestonesPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const [supabase, searchParamsResult] = await Promise.all([
    createClient(),
    searchParams,
  ]);
  const { booking: selectedBookingId } = searchParamsResult;

  const [bookingsRes, milestonesRes] = await Promise.all([
    supabase
      .from("events_bookings")
      .select("id, event_type, event_date, profiles!events_bookings_client_id_fkey(full_name)")
      .order("event_date", { ascending: false }),
    selectedBookingId
      ? supabase
          .from("event_milestones")
          .select("*")
          .eq("booking_id", selectedBookingId)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const bookings = bookingsRes.data;
  const milestones = milestonesRes.data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Milestones</h1>
        <p className="mt-1 text-gray-400">Create and manage event timeline checklists.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300 uppercase tracking-wide">Events</h2>
          <div className="space-y-1">
            {bookings && bookings.length > 0 ? (
              bookings.map((b) => {
                const isSelected = b.id === selectedBookingId;
                const clientName = (b.profiles as unknown as { full_name: string }[])?.[0]?.full_name;
                return (
                  <a
                    key={b.id}
                    href={`/dashboard/admin/milestones?booking=${b.id}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                        : "text-gray-300 hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    <div className="font-medium">{clientName ?? "Unknown"}</div>
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">
                      {b.event_type} &middot;{" "}
                      {new Date(b.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </a>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 px-3">No events yet.</p>
            )}
          </div>
        </div>

        <div>
          {selectedBookingId ? (
            <div className="space-y-6">
              <form action={createMilestone} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
                <input type="hidden" name="bookingId" value={selectedBookingId} />
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Plus className="size-4 text-yellow-400" />
                  Add Milestone
                </h3>
                <div className="space-y-3">
                  <input
                    name="title"
                    placeholder="Milestone title"
                    aria-label="Milestone title"
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                  />
                  <textarea
                    name="description"
                    placeholder="Description (optional)"
                    aria-label="Milestone description"
                    rows={2}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none resize-none"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label htmlFor="dueDate" className="mb-1 block text-xs text-gray-500">Due date</label>
                      <input
                        type="date"
                        name="dueDate"
                        id="dueDate"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
                      />
                    </div>
                    <div className="w-24">
                      <label htmlFor="sortOrder" className="mb-1 block text-xs text-gray-500">Order</label>
                      <input
                        type="number"
                        name="sortOrder"
                        id="sortOrder"
                        defaultValue={milestones?.length ?? 0}
                        min={0}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500 transition-all"
                  >
                    Add Milestone
                  </button>
                </div>
              </form>

              {milestones && milestones.length > 0 ? (
                <div className="space-y-2">
                  {milestones.map((ms, idx) => (
                    <MilestoneCard key={ms.id} milestone={ms} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 p-12 text-center text-sm text-gray-500">
                  No milestones yet for this event.
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-700 p-12 text-gray-500">
              Select an event to manage its milestones.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function MilestoneCard({
  milestone,
  index,
}: {
  milestone: Record<string, unknown>;
  index: number;
}) {
  const isCompleted = milestone.is_completed as boolean;

  return (
    <div className={`rounded-xl border ${isCompleted ? "border-green-500/20" : "border-gray-800"} bg-gray-900/30 p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
            isCompleted ? "border-green-500 bg-green-500/20" : "border-gray-600"
          }`}>
            {isCompleted && <Check className="size-3 text-green-400" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${isCompleted ? "text-gray-500 line-through" : "text-gray-200"}`}>
              {milestone.title as string}
            </p>
            {milestone.description ? (
              <p className="mt-0.5 text-xs text-gray-500">{milestone.description as string}</p>
            ) : null}
            {milestone.due_date ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                <CalendarDays className="size-3" />
                {new Date(milestone.due_date as string).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <form action={deleteMilestone}>
            <input type="hidden" name="id" value={milestone.id as string} />
            <button
              type="submit"
              aria-label="Delete milestone"
              className="rounded-lg p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="size-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
