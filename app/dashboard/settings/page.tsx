import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { updateProfile } from "./actions";
import PasswordResetButton from "./password-reset";
import DangerZone from "./danger-zone";
import { User, Mail, Phone, Shield, KeyRound, BadgeCheck } from "lucide-react";

export default async function SettingsPage() {
  const [user, supabase] = await Promise.all([requireUser(), createClient()]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.uid)
    .single();

  const displayName = user.full_name ?? profile?.full_name ?? "User";
  const initials = displayName.charAt(0).toUpperCase();
  const displayEmail = user.email ?? profile?.email ?? "";
  const rawRole = user.role ?? profile?.role ?? "—";
  const displayRole = user.client_mode || rawRole === "external-client" || rawRole === "client"
    ? "client"
    : rawRole.replace(/-/g, " ");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-gray-400">Manage your account and preferences.</p>
      </div>

      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-200">Profile Information</h2>

        <form action={updateProfile} className="space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-gray-800">
            <div className="flex size-16 items-center justify-center rounded-full bg-yellow-400/20 text-2xl font-bold text-yellow-400">
              {initials}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-200">{displayName}</p>
              <p className="text-sm text-gray-500 capitalize">{displayRole}</p>
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
              <User className="size-4 text-gray-500" />
              Full Name
            </label>
            <input
              name="fullName"
              id="fullName"
              defaultValue={displayName !== "User" ? displayName : ""}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Phone className="size-4 text-gray-500" />
              Phone
            </label>
            <input
              name="phone"
              id="phone"
              defaultValue={profile?.phone ?? ""}
              placeholder="+63 XXX XXX XXXX"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-4 py-3">
            <Shield className="size-4 shrink-0 text-gray-500" />
            <span className="text-sm text-gray-400 capitalize">
              Role: <span className="font-medium text-gray-300">{displayRole}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95"
            >
              Save Changes
            </button>
            <button
              type="reset"
              className="rounded-lg border border-gray-700 px-6 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-all"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-200">Security</h2>
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Mail className="size-4 text-gray-500" />
              Email
            </span>
            <input
              value={displayEmail}
              readOnly
              disabled
              aria-label="Email"
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-600">Email cannot be changed.</p>
          </div>

          {user.email_verified && (
            <div className="flex items-center gap-2 rounded-lg bg-green-950/30 border border-green-900/50 px-4 py-3">
              <BadgeCheck className="size-4 shrink-0 text-green-400" />
              <span className="text-sm text-green-300">Email verified</span>
            </div>
          )}

          <div className="border-t border-gray-800 pt-4">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
              <KeyRound className="size-4 text-gray-500" />
              Password
            </span>
            <PasswordResetButton email={displayEmail} />
          </div>
        </div>
      </section>

      <DangerZone />
    </div>
  );
}
