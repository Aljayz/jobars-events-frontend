import { createClient } from "@/utils/supabase/server";
import AssignStaffForm from "@/components/admin/assign-staff-form";

export default async function ResourceAssigner({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const [supabase, searchParamsResult] = await Promise.all([
    createClient(),
    searchParams,
  ]);
  const { booking: selectedBookingId } = searchParamsResult;

  const [bookingsRes, staffRes, servicesRes] = await Promise.all([
    supabase
      .from("events_bookings")
      .select("id, event_type, event_date, profiles!events_bookings_client_id_fkey(full_name)")
      .order("event_date", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "staff"),
    supabase
      .from("services")
      .select("id, name, category")
      .eq("is_active", true)
      .order("name"),
  ]);

  const bookings = bookingsRes.data;
  const allStaff = staffRes.data;
  const allServices = servicesRes.data;

  let bookingServices: Array<Record<string, unknown>> = [];

  if (selectedBookingId) {
    const { data } = await supabase
      .from("booking_services")
      .select("id, service_id, booking_id, quantity, services(name, category), staff_assignments(id, staff_id, role_description, profiles!staff_assignments_staff_id_fkey(full_name))")
      .eq("booking_id", selectedBookingId);

    bookingServices = (data ?? []) as Array<Record<string, unknown>>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Resource Assigner</h1>
        <p className="mt-1 text-gray-400">
          Select an event to assign service teams and staff members.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Events
          </h2>
          <div className="space-y-1">
            {bookings && bookings.length > 0 ? (
              bookings.map((b) => {
                const isSelected = b.id === selectedBookingId;
                const clientProfiles = (b.profiles ?? []) as Array<{ full_name: string }>;
                return (
                  <a
                    key={b.id}
                    href={`/dashboard/admin/assign?booking=${b.id}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                        : "text-gray-300 hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    <div className="font-medium">
                      {clientProfiles[0]?.full_name ?? "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">
                      {b.event_type} &middot;{" "}
                      {new Date(b.event_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
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
            <AssignStaffForm
              bookingId={selectedBookingId}
              bookingServices={bookingServices}
              allStaff={allStaff ?? []}
              allServices={allServices ?? []}
            />
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-700 p-12 text-gray-500">
              Select an event from the left panel to assign resources.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
