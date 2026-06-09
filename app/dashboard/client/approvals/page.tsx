import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import ApprovalCard from "@/components/client/approval-card";
import { CheckSquare } from "lucide-react";

export default async function ApprovalsPage() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const { data: bookings } = await supabase
    .from("events_bookings")
    .select("id")
    .eq("client_id", user.uid);

  const bookingIds = bookings?.map((b) => b.id) ?? [];

  if (bookingIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 p-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-800">
          <CheckSquare className="size-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-300">No Approvals Yet</h2>
        <p className="mt-2 text-sm text-gray-500">
          When your service providers upload proofs or previews, they will appear here for your review.
        </p>
      </div>
    );
  }

  const { data: approvals } = await supabase
    .from("approval_items")
    .select("*")
    .in("booking_id", bookingIds)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="mt-1 text-gray-400">Review and approve invitation proofs, photo previews, and more.</p>
      </div>

      {approvals && approvals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {approvals.map((item) => (
            <ApprovalCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 p-12 text-center">
          <CheckSquare className="mb-3 size-8 text-gray-600" />
          <p className="text-sm text-gray-500">No items pending your review.</p>
        </div>
      )}
    </div>
  );
}
