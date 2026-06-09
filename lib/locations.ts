import { unstable_cache } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export const getCachedLocations = unstable_cache(
  async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("business_locations")
      .select("*")
      .order("name");
    return data ?? [];
  },
  ["business_locations"],
  { revalidate: 30, tags: ["locations"] }
);
