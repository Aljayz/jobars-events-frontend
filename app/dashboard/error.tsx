"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-gray-950 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertTriangle className="size-8 text-red-400" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-100">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        {error.digest ? `Error ${error.digest}` : "An unexpected error occurred."}
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-all"
        >
          <Home className="size-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}
