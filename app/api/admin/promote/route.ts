import { NextResponse, NextRequest } from "next/server";
import { verifySessionCookie, adminGetUserByEmail, adminSetCustomClaims } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const caller = await verifySessionCookie(sessionCookie);
  if (!caller || !["admin", "manager"].includes(caller.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, role } = await request.json();

  if (!email || !role) {
    return NextResponse.json({ error: "email and role required" }, { status: 400 });
  }

  try {
    const targetUser = await adminGetUserByEmail(email);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await adminSetCustomClaims(targetUser.uid, { role });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
