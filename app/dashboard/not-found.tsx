import Link from "next/link";
import { SearchX, Home } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-gray-950 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-yellow-400/10">
        <SearchX className="size-8 text-yellow-400" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-100">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95"
      >
        <Home className="size-4" />
        Go home
      </Link>
    </div>
  );
}
