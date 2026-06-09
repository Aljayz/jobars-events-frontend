import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="min-h-screen bg-gray-950 text-gray-100"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div></div>;
}
