"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { deleteUser } from "firebase/auth";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DangerZone() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user signed in");
      await deleteUser(user);
      router.push("/auth/login");
    } catch (e: unknown) {
      const msg = (e as Error).message ?? "Delete failed";
      router.push(`/dashboard/settings?error=${encodeURIComponent(msg)}`);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-red-400">
              <AlertTriangle className="size-4" />
              Danger Zone
            </h3>
            <p className="text-sm text-gray-500">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-all active:scale-95"
          >
            <Trash2 className="size-4" />
            Delete Account
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={open}
        title="Delete account?"
        message="This will permanently delete your account and all associated data. You will not be able to recover it."
        confirmLabel={loading ? "Deleting…" : "Delete Forever"}
        confirmClass="bg-red-600 hover:bg-red-500 text-white"
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
