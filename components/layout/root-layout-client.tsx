"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import type { ReactNode } from "react";

const authPaths = ["/auth", "/auth/login", "/auth/sign-up"];
const dashboardPath = "/dashboard";

export default function RootLayoutClient({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));
  const isDashboardPage = pathname.startsWith(dashboardPath);

  if (isAuthPage || isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      {footer}
    </>
  );
}
