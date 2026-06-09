"use client";

import { useTransition } from "react";
import { toggleClientMode } from "@/app/dashboard/client-mode/actions";
import { Repeat } from "lucide-react";

export default function ClientModeToggle({ active }: { active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button type="button"
      onClick={() => startTransition(() => toggleClientMode())}
      disabled={pending}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-gray-300 transition-all hover:bg-yellow-400/5 hover:text-yellow-400 disabled:opacity-50"
    >
      <Repeat className="size-4" />
      <span className="hidden md:inline">
        {pending ? "Switching..." : active ? "Switch to Dashboard" : "Switch to Client View"}
      </span>
    </button>
  );
}
