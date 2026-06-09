import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getCachedLocations = unstable_cache(
  async () => {
    const { data } = await supabasePublic
      .from("business_locations")
      .select("*")
      .order("name");
    return data ?? [];
  },
  ["business_locations"],
  { revalidate: 30, tags: ["locations"] }
);
