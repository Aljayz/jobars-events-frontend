"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function submitContact(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  const { error } = await supabase.from("contact_inquiries").insert({
    name,
    email,
    subject,
    message,
  });

  if (error) {
    redirect("/contact?error=Failed to send message. Please try again.");
  }

  redirect("/contact?success=Message sent! We'll get back to you within 24 hours.");
}
