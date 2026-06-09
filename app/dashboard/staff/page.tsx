import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { CalendarDays, MapPin, Briefcase, ListTodo } from "lucide-react";

export default async function StaffTasks() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const { data: rawAssignments } = await supabase
    .from("staff_assignments")
    .select("id, role_description, assigned_at, booking_service_id")
    .eq("staff_id", user.uid)
    .order("assigned_at", { ascending: false });

  interface StaffTask {
    id: string;
    role_description: string | null;
    service_name: string;
    service_category: string;
    event_type: string;
    event_date: string;
    venue: string | null;
    client_name: string | null;
  }

  const tasks: StaffTask[] = [];
  if (rawAssignments) {
    const bookingServiceIds = rawAssignments.map((sa) => sa.booking_service_id);
    const { data: allBs } = await supabase
      .from("booking_services")
      .select("id, quantity, services(name, category), events_bookings!booking_id(event_type, event_date, venue, profiles!client_id(full_name))")
      .in("id", bookingServiceIds);

    const bsMap = new Map((allBs ?? []).map((bs) => {
      const entry = bs as Record<string, unknown>;
      return [entry.id as string, entry];
    }));

    for (const sa of rawAssignments) {
      const bs = bsMap.get(sa.booking_service_id);
      if (!bs) continue;
      const ev = bs.events_bookings as Record<string, unknown> | null;
      const svc = bs.services as Record<string, unknown> | null;
      const prof = ev?.profiles as Record<string, unknown> | null;
      tasks.push({
        id: sa.id,
        role_description: sa.role_description,
        service_name: (svc?.name as string) ?? "Unknown",
        service_category: (svc?.category as string) ?? "",
        event_type: (ev?.event_type as string) ?? "",
        event_date: (ev?.event_date as string) ?? "",
        venue: (ev?.venue as string | null) ?? null,
        client_name: (prof?.full_name as string | null) ?? null,
      });
    }
  }

  tasks.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const grouped = tasks.reduce<Record<string, StaffTask[]>>((acc, t) => {
    if (!acc[t.event_type]) acc[t.event_type] = [];
    acc[t.event_type].push(t);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Task List</h1>
        <p className="mt-1 text-gray-400">Upcoming events and services you are assigned to.</p>
      </div>

      {tasks.length > 0 ? (
        Object.entries(grouped).map(([eventType, eventTasks]) => {
          const first = eventTasks[0];
          const eventDate = new Date(first.event_date);
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div key={eventType} className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-400/10">
                  <Briefcase className="size-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-semibold capitalize text-gray-200">{eventType}</h2>
                  <p className="text-xs text-gray-500">
                    {first.client_name}
                    {first.venue && <> · <MapPin className="inline size-3" /> {first.venue}</>}
                    {" · "}
                    <span suppressHydrationWarning className={diffDays < 0 ? "text-gray-600" : "text-yellow-400"}>
                      {diffDays < 0 ? `${Math.abs(diffDays)} days ago` : diffDays === 0 ? "Today!" : `${diffDays} days away`}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {eventTasks.map((task) => (
                  <div key={task.id} className="group rounded-xl border border-gray-800 bg-gray-900/30 p-4 hover:bg-gray-900/60 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-yellow-400/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
                            {task.service_name}
                          </span>
                          {task.service_category && (
                            <span className="text-xs text-gray-600 capitalize">{task.service_category}</span>
                          )}
                        </div>
                        {task.role_description && (
                          <p className="mt-2 text-sm text-gray-400">{task.role_description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <CalendarDays className="size-4 text-gray-600" />
                        <span className="text-sm text-gray-400">
                          {eventDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 p-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-800">
            <ListTodo className="size-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-300">No Assignments Yet</h2>
          <p className="mt-2 text-sm text-gray-500">You haven&apos;t been assigned to any events. Check back later!</p>
        </div>
      )}
    </div>
  );
}
