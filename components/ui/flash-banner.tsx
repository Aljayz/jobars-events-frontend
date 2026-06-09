"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, X } from "lucide-react";

function FlashBannerInner() {
  const { get } = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error">("success");

  useEffect(() => {
    const error = get("error");
    const success = get("success");
    if (error) {
      setMessage(error);
      setType("error");
      setVisible(true);
    } else if (success) {
      setMessage(success);
      setType("success");
      setVisible(true);
    }
  }, [get]);

  if (!visible) return null;

  return (
    <div className={`mb-4 flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
      type === "success" ? "bg-green-900/50 text-green-300 border border-green-800" :
      "bg-red-900/50 text-red-300 border border-red-800"
    }`}>
      <div className="flex items-center gap-2">
        {type === "success" ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
        {message}
      </div>
      <button type="button" onClick={() => setVisible(false)} className="hover:text-white transition-colors">
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
