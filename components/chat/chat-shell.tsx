"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function ChatShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isRoomView = pathname.startsWith("/chat/") && pathname !== "/chat";

  return (
    <>
      <div
        className={`${
          isRoomView ? "hidden" : "flex"
        } md:flex w-full md:w-72 shrink-0 flex-col border-r border-gray-800 bg-gray-900/80 backdrop-blur`}
      >
        {sidebar}
      </div>
      <main
        className={`${
          !isRoomView ? "hidden" : "flex"
        } md:flex flex-1 flex-col min-w-0`}
      >
        {children}
      </main>
    </>
  );
}
