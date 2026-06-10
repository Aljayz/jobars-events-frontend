import { unstable_cache } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface BusinessSettings {
  id: number;
  business_name: string;
  address: string;
  phone: string;
  email: string;
  business_hours: string;
  facebook_url: string;
  updated_at: string;
}

const defaults: BusinessSettings = {
  id: 1,
  business_name: "Jobars Events",
  address: "Bayugan City, Agusan del Sur, Philippines",
  phone: "+63 968 666 6783",
  email: "jobars.info@gmail.com",
  business_hours: "Monday to Saturday, 8:00 AM to 6:00 PM",
  facebook_url: "https://www.facebook.com/profile.php?id=100063642080742",
  updated_at: new Date().toISOString(),
};

export const getCachedBusinessSettings = unstable_cache(
  async (): Promise<BusinessSettings> => {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("business_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (data) return data as BusinessSettings;
    } catch {
      // env vars unavailable during build/prerender
    }
    return defaults;
  },
  ["business_settings"],
  { revalidate: 30, tags: ["business_settings"] }
);
