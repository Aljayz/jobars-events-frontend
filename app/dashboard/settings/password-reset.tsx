"use client";

import { useState } from "react";
import { firebaseAuth } from "@/lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";
import { KeyRound, CheckCircle, Loader2 } from "lucide-react";

export default function PasswordResetButton({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(firebaseAuth(), email);
      setSent(true);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <CheckCircle className="size-4 shrink-0" />
        Password reset email sent. Check your inbox.
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleReset}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-700 disabled:opacity-50 transition-all"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <KeyRound className="size-4 text-gray-500" />
        )}
        {loading ? "Sending…" : "Send Password Reset Email"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
