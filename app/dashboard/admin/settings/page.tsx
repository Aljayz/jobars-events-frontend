import { getCachedBusinessSettings } from "@/lib/business";
import { requireUser } from "@/lib/user";
import { updateBusinessSettings } from "../actions";
import FlashBanner from "@/components/ui/flash-banner";
import { Suspense } from "react";
import { Building2, MapPin, Phone, Mail, Clock, Globe } from "lucide-react";

export default async function BusinessSettingsPage() {
  const user = await requireUser();
  if (!["super-admin", "admin"].includes(user.role)) {
    return <p className="text-sm text-red-400">You do not have permission to access this page.</p>;
  }

  const settings = await getCachedBusinessSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Business Settings</h1>
        <p className="mt-1 text-gray-400">
          Manage your business contact information displayed across the site.
        </p>
      </div>

      <Suspense fallback={null}><FlashBanner /></Suspense>

      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-200">Contact Information</h2>

        <form action={updateBusinessSettings} className="space-y-5">
          <div>
            <label htmlFor="businessName" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Building2 className="size-4 text-gray-500" />
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              defaultValue={settings.business_name}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
              <MapPin className="size-4 text-gray-500" />
              Address
            </label>
            <input
              id="address"
              name="address"
              defaultValue={settings.address}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
                <Phone className="size-4 text-gray-500" />
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={settings.phone}
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
                id="email"
                name="email"
                type="email"
                defaultValue={settings.email}
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="businessHours" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Clock className="size-4 text-gray-500" />
              Business Hours
            </label>
            <input
              id="businessHours"
              name="businessHours"
              defaultValue={settings.business_hours}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="facebookUrl" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Globe className="size-4 text-gray-500" />
              Facebook Page URL
            </label>
            <input
              id="facebookUrl"
              name="facebookUrl"
              type="url"
              defaultValue={settings.facebook_url}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
            />
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
    </div>
  );
}
