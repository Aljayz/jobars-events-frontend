import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { updateProfile } from "./actions";
import { User, Mail, Phone, Shield } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.uid)
    .single();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="mt-1 text-gray-400">Manage your account details.</p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <form action={updateProfile} className="space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-gray-800">
            <div className="flex size-16 items-center justify-center rounded-full bg-yellow-400/20 text-2xl font-bold text-yellow-400">
              {(profile?.full_name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-200">{profile?.full_name ?? "User"}</p>
              <p className="text-sm text-gray-500 capitalize">{profile?.role ?? "—"}</p>
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
              defaultValue={profile?.full_name ?? ""}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Mail className="size-4 text-gray-500" />
              Email
            </label>
            <input
              name="email"
              id="email"
              value={profile?.email ?? ""}
              readOnly
              disabled
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-600">Email cannot be changed.</p>
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
            <Shield className="size-4 text-gray-500" />
            <span className="text-sm text-gray-400 capitalize">Role: <span className="font-medium text-gray-300">{profile?.role ?? "—"}</span></span>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
