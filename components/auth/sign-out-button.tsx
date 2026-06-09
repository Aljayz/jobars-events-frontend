"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";
import { clearAuthSession } from "@/app/auth/actions";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { LogOut } from "lucide-react";

async function handleSignOut() {
  await clearAuthSession();
  await firebaseSignOut(auth);
}

export default function SignOutButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
      >
        <LogOut className="size-3.5" />
        Sign Out
      </button>

      <ConfirmDialog
        open={open}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        onConfirm={handleSignOut}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
