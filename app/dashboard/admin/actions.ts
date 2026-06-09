"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification } from "@/utils/notifications/actions";

export async function addServiceToBooking(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const bookingId = formData.get("bookingId") as string;
  const serviceId = formData.get("serviceId") as string;

  const { error } = await supabase.from("booking_services").insert({
    booking_id: bookingId,
    service_id: serviceId,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/admin/assign");
}

export async function removeServiceFromBooking(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const bookingServiceId = formData.get("bookingServiceId") as string;

  const { error } = await supabase
    .from("booking_services")
    .delete()
    .eq("id", bookingServiceId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/admin/assign");
}

export async function assignStaff(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const bookingServiceId = formData.get("bookingServiceId") as string;
  const staffId = formData.get("staffId") as string;
  const roleDescription = formData.get("roleDescription") as string;

  const { error } = await supabase.from("staff_assignments").insert({
    booking_service_id: bookingServiceId,
    staff_id: staffId,
    role_description: roleDescription || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/admin/assign");
}

export async function removeStaff(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const assignmentId = formData.get("assignmentId") as string;

  const { error } = await supabase
    .from("staff_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/admin/assign");
}

export async function createMilestone(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const bookingId = formData.get("bookingId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const sortOrder = formData.get("sortOrder") as string;

  await supabase.from("event_milestones").insert({
    booking_id: bookingId,
    title,
    description: description || null,
    due_date: dueDate || null,
    sort_order: sortOrder ? parseInt(sortOrder) : 0,
  });

  const { data: booking } = await supabase
    .from("events_bookings")
    .select("client_id")
    .eq("id", bookingId)
    .single();

  if (booking) {
    await createNotification({
      profileId: booking.client_id,
      title: "New Milestone Added",
      message: `"${title}" has been added to your event timeline.`,
      type: "milestone",
      link: "/dashboard/client",
    });
  }

  revalidatePath("/dashboard/admin/milestones");
}

export async function updateMilestone(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const sortOrder = formData.get("sortOrder") as string;

  await supabase
    .from("event_milestones")
    .update({
      title,
      description: description || null,
      due_date: dueDate || null,
      sort_order: sortOrder ? parseInt(sortOrder) : 0,
    })
    .eq("id", id);

  revalidatePath("/dashboard/admin/milestones");
}

export async function deleteMilestone(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const id = formData.get("id") as string;

  await supabase.from("event_milestones").delete().eq("id", id);
  revalidatePath("/dashboard/admin/milestones");
}

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const clientEmail = formData.get("clientEmail") as string;
  const eventType = formData.get("eventType") as string;
  const eventDate = formData.get("eventDate") as string;
  const venue = formData.get("venue") as string;
  const budget = formData.get("budget") as string;
  const headCount = formData.get("headCount") as string;
  const packageName = formData.get("packageName") as string;
  const notes = formData.get("notes") as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", clientEmail)
    .single();

  if (profile) {
    await supabase.from("events_bookings").insert({
      client_id: profile.id,
      event_type: eventType,
      event_date: eventDate,
      venue: venue || null,
      budget: budget ? parseFloat(budget) : null,
      head_count: headCount ? parseInt(headCount) : null,
      package_name: packageName || null,
      notes: notes || null,
    });
  }

  revalidatePath("/dashboard/admin");
}

export async function uploadApprovalFile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const bookingId = formData.get("bookingId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const fileType = formData.get("fileType") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop() ?? "bin";
  const fileName = `${bookingId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError, data } = await supabase.storage
    .from("approval_files")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) return;

  const { data: urlData } = supabase.storage
    .from("approval_files")
    .getPublicUrl(fileName);

  await supabase.from("approval_items").insert({
    booking_id: bookingId,
    title,
    description: description || null,
    file_type: fileType || null,
    file_url: urlData?.publicUrl ?? null,
  });

  const { data: booking } = await supabase
    .from("events_bookings")
    .select("client_id")
    .eq("id", bookingId)
    .single();

  if (booking) {
    await createNotification({
      profileId: booking.client_id,
      title: "New Proof Ready for Review",
      message: `"${title}" has been uploaded for your review.`,
      type: "approval",
      link: "/dashboard/client/approvals",
    });
  }

  revalidatePath("/dashboard/admin/uploads");
}

export async function updateBookingStatus(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await supabase.from("events_bookings").update({ status }).eq("id", id);
  revalidatePath("/dashboard/admin");
}

export async function promoteToStaff(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const profileId = formData.get("profileId") as string;

  await supabase.from("profiles").update({ role: "staff" }).eq("id", profileId);
  revalidatePath("/dashboard/admin/staff");
}

export async function demoteFromStaff(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const profileId = formData.get("profileId") as string;

  await supabase.from("profiles").update({ role: "client" }).eq("id", profileId);
  revalidatePath("/dashboard/admin/staff");
}

export async function deleteBooking(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const id = formData.get("id") as string;

  await supabase.from("events_bookings").delete().eq("id", id);
  revalidatePath("/dashboard/admin");
}

export async function deleteApprovalItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const id = formData.get("id") as string;
  const fileUrl = formData.get("fileUrl") as string;

  if (fileUrl) {
    const fileName = fileUrl.split("/").slice(-2).join("/");
    await supabase.storage.from("approval_files").remove([fileName]);
  }

  await supabase.from("approval_items").delete().eq("id", id);
  revalidatePath("/dashboard/admin/uploads");
}
