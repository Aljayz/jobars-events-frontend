"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/utils/notifications/actions";
import { requireUser } from "@/lib/user";

export async function toggleMilestone(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const milestoneId = formData.get("milestoneId") as string;
  const isCompleted = formData.get("isCompleted") === "true";

  const { data: milestone } = await supabase
    .from("event_milestones")
    .select("*, events_bookings!booking_id(client_id)")
    .eq("id", milestoneId)
    .single();

  if (!milestone) return;

  const { error } = await supabase
    .from("event_milestones")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", milestoneId);

  if (error) return { error: error.message };

  if (isCompleted) {
    const booking = milestone.events_bookings as { client_id: string } | null;
    if (booking) {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .in("role", ["admin", "manager"]);

      await Promise.all((admins ?? []).map((admin) =>
        createNotification({
          profileId: admin.id,
          title: "Milestone Completed",
          message: `"${milestone.title}" was marked as done.`,
          type: "milestone",
          link: "/dashboard/admin/milestones",
        })
      ));
    }
  }

  revalidatePath("/dashboard/client");
}

export async function updateApprovalStatus(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const approvalId = formData.get("approvalId") as string;
  const status = formData.get("status") as string;
  const feedback = formData.get("feedback") as string;

  const { data: approval } = await supabase
    .from("approval_items")
    .select("*, events_bookings!booking_id(client_id)")
    .eq("id", approvalId)
    .single();

  if (!approval) return;

  const { error } = await supabase
    .from("approval_items")
    .update({
      status,
      feedback: feedback || null,
    })
    .eq("id", approvalId);

  if (error) return { error: error.message };

  if (status === "approved" || status === "revision_requested") {
    const booking = approval.events_bookings as { client_id: string } | null;
    if (booking) {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .in("role", ["admin", "manager"]);

      await Promise.all((admins ?? []).map((admin) =>
        createNotification({
          profileId: admin.id,
          title: status === "approved" ? "Proof Approved" : "Revision Requested",
          message: `"${approval.title}" was ${status.replace("_", " ")} by the client.`,
          type: "approval",
          link: "/dashboard/admin/uploads",
        })
      ));
    }
  }

  revalidatePath("/dashboard/client/approvals");
}
