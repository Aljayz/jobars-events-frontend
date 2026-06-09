import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const role = user.role;
  const clientMode = user.client_mode === true;

  if (role !== "external-client" && role !== "client" && !clientMode) redirect(`/dashboard/${role}`);

  return <>{children}</>;
}
