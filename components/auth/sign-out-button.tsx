"use client";

import { signOut } from "@/app/auth/actions";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => { await signOut(); }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
    >
      <LogOut className="size-3.5" />
      Sign Out
    </button>
  );
}
