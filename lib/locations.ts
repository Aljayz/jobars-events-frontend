import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

function getSupabasePublic() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const getCachedLocations = unstable_cache(
  async () => {
    const { data } = await getSupabasePublic()
      .from("business_locations")
      .select("*")
      .order("name");
    return data ?? [];
  },
  ["business_locations"],
  { revalidate: 30, tags: ["locations"] }
);
