"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function rateEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const bookingId = formData.get("booking_id") as string;
  const rating = parseInt(formData.get("rating") as string);
  const review = (formData.get("review") as string) || null;

  const { data: existing } = await supabase
    .from("event_ratings")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("event_ratings").update({ rating, review }).eq("id", existing.id);
  } else {
    await supabase.from("event_ratings").insert({ booking_id: bookingId, client_id: user.id, rating, review });
  }

  revalidatePath("/dashboard/client");
}
