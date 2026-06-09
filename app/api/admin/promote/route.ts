import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!caller || !["admin", "manager"].includes(caller.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, role } = await request.json();

  if (!email || !role) {
    return NextResponse.json({ error: "email and role required" }, { status: 400 });
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!targetProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", targetProfile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
