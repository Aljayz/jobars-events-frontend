"use client";

import { useActionState } from "react";
import { addServiceToBooking, assignStaff, removeStaff, removeServiceFromBooking } from "@/app/dashboard/admin/actions";

interface StaffProfile {
  id: string;
  full_name: string;
  email: string | null;
}

interface Service {
  id: string;
  name: string;
  category: string;
}

export default function AssignStaffForm({
  bookingId,
  bookingServices,
  allStaff,
  allServices,
}: {
  bookingId: string;
  bookingServices: Record<string, unknown>[];
  allStaff: StaffProfile[];
  allServices: Service[];
}) {
  const [addState, addAction, addPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await addServiceToBooking(formData);
    },
    undefined,
  );

  const [assignErr, assignAction, assignPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await assignStaff(formData);
    },
    undefined,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Add Service to Booking
        </h2>
        {addState?.error && (
          <div className="mb-3 rounded border border-red-800 bg-red-900/50 px-3 py-2 text-sm text-red-400">
            {addState.error}
          </div>
        )}
        <form action={addAction} className="flex gap-3">
          <input type="hidden" name="bookingId" value={bookingId} />
          <select
            name="serviceId"
            required
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
          >
            <option value="">Select a service\u2026</option>
            {allServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category.replace("_", " ")})
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={addPending}
            className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-300 transition-colors"
          >
            {addPending ? "Adding\u2026" : "Add"}
          </button>
        </form>
      </div>

      {bookingServices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-700 p-8 text-center text-sm text-gray-500">
          No services assigned to this booking yet. Add a service above.
        </div>
      ) : (
        <div className="space-y-4">
          {bookingServices.map((bs) => {
            const staffAssignments = (bs.staff_assignments ?? []) as Array<{
              id: string;
              staff_id: string;
              role_description: string | null;
              profiles: { full_name: string }[] | null;
            }>;
            const serviceInfo = bs.services as { name: string; category: string } | null;

            return (
              <div
                key={bs.id as string}
                className="rounded-lg border border-gray-800 bg-gray-900 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-200">
                      {serviceInfo?.name ?? "Unknown Service"}
                    </h3>
                    <p className="text-xs text-gray-500 capitalize">
                      {serviceInfo?.category?.replace("_", " ") ?? ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Qty: {bs.quantity as number}
                    </span>
                    <form action={async (fd: FormData) => { await removeServiceFromBooking(fd); }}>
                      <input type="hidden" name="bookingServiceId" value={bs.id as string} />
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Assigned Staff
                  </p>
                  {staffAssignments.length > 0 ? (
                    <div className="space-y-1.5">
                      {staffAssignments.map((sa) => (
                        <div
                          key={sa.id}
                          className="flex items-center justify-between rounded bg-gray-800/50 px-3 py-1.5"
                        >
                          <div>
                            <span className="text-sm text-gray-200">
                              {sa.profiles?.[0]?.full_name ?? "Unknown"}
                            </span>
                            {sa.role_description && (
                              <span className="ml-2 text-xs text-gray-500">
                                &mdash; {sa.role_description}
                              </span>
                            )}
                          </div>
                          <form action={async (fd: FormData) => { await removeStaff(fd); }}>
                            <input type="hidden" name="assignmentId" value={sa.id} />
                            <button
                              type="submit"
                              className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No staff assigned.</p>
                  )}
                </div>

                <form action={assignAction} className="mt-3 flex gap-2">
                  <input type="hidden" name="bookingServiceId" value={bs.id as string} />
                  <select
                    name="staffId"
                    required
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="">Assign staff\u2026</option>
                    {allStaff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name}
                      </option>
                    ))}
                  </select>
                  <input
                    name="roleDescription"
                    placeholder="Role (e.g. Head Chef)"
                    aria-label="Role description"
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={assignPending}
                    className="rounded-lg bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-300 transition-colors"
                  >
                    {assignPending ? "Assigning\u2026" : "Assign"}
                  </button>
                  {assignErr?.error && (
                    <p className="col-span-full text-xs text-red-400">{assignErr.error}</p>
                  )}
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
