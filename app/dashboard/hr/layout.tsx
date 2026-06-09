import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function HRLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (!["human-resource", "admin", "super-admin"].includes(user.role)) redirect(`/dashboard/${user.role}`);
  return <>{children}</>;
}
