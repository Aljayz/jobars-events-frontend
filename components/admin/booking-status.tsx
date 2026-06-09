"use client";

import { useActionState } from "react";
import { updateBookingStatus } from "@/app/dashboard/admin/actions";

const statusOptions = ["pending", "approved", "in_progress", "completed", "cancelled"];

export default function BookingStatusCell({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const [, action] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await updateBookingStatus(formData);
    },
    undefined,
  );

  return (
    <form action={action}>
      <input type="hidden" name="id" value={bookingId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => {
          const form = e.target.form;
          if (form) form.requestSubmit();
        }}
        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize appearance-none cursor-pointer focus:outline-none ${
          currentStatus === "pending"
            ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
            : currentStatus === "approved"
              ? "border-green-500/50 bg-green-500/10 text-green-400"
              : currentStatus === "in_progress"
                ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                : currentStatus === "completed"
                  ? "border-gray-500/50 bg-gray-500/10 text-gray-400"
                  : "border-red-500/50 bg-red-500/10 text-red-400"
        }`}
      >
        {statusOptions.map((s) => (
          <option key={s} value={s} className="bg-gray-900 text-gray-200">
            {s.replace("_", " ")}
          </option>
        ))}
      </select>
    </form>
  );
}
