"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, X } from "lucide-react";

function FlashBannerInner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const error = searchParams.get("error");
  const success = searchParams.get("success");
  const message = error || success;
  const isError = !!error;

  if (!message || dismissed) return null;

  return (
    <div className={`mb-4 flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
      isError ? "bg-red-900/50 text-red-300 border border-red-800" :
      "bg-green-900/50 text-green-300 border border-green-800"
    }`}>
      <div className="flex items-center gap-2">
        {isError ? <XCircle className="size-4" /> : <CheckCircle className="size-4" />}
        {message}
      </div>
      <button type="button" onClick={() => setDismissed(true)} className="hover:text-white transition-colors">
        <X className="size-4" />
      </button>
    </div>
  );
}

export default function FlashBanner() {
  return (
    <Suspense fallback={null}>
      <FlashBannerInner />
    </Suspense>
  );
}
