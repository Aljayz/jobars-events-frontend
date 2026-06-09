import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (user.role !== "staff") redirect(`/dashboard/${user.role}`);
  return <>{children}</>;
}
