import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionCookie, verifyIdToken } from "@/lib/firebase/admin";
import type { FirebaseUser } from "@/lib/firebase/admin";

const SESSION_COOKIE = "__session";

async function getAppUser(): Promise<FirebaseUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  return verifySessionCookie(session);
}

export async function requireUser(): Promise<FirebaseUser> {
  const user = await getAppUser();
  if (!user) redirect("/auth/login");
  return user;
}
