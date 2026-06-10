import { createClient } from "@/utils/supabase/server";
import { parseMapsUrl } from "@/lib/maps";
import { MapPin } from "lucide-react";

export default async function Map() {
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("business_locations")
    .select("*")
    .order("is_primary", { ascending: false })
    .limit(1);

  const primary = locations?.[0];
  const mapsUrl = primary?.maps_url as string | null;
  const coords = parseMapsUrl(mapsUrl);
  const address = primary?.address as string ?? "PPHX+GH Jobars Events, City of Bayugan, Agusan del Sur";

  const mapSrc = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`
    : mapsUrl ?? "https://www.google.com/maps?q=8.728785,125.7488967&z=15&output=embed";

  return (
    <section className="bg-gray-950 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center animate-fade-in-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-yellow-400/10 px-4 py-1.5 text-sm font-medium text-yellow-400">
            <MapPin className="size-4" />
            Find Us
          </div>
          <h2 className="text-3xl font-bold text-gray-100 sm:text-4xl">Visit Our Office</h2>
          <p className="mt-2 text-gray-400">{address}</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-800 animate-fade-in-up stagger-2">
          <div className="aspect-video w-full">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Jobars Events location on Google Maps"
              sandbox="allow-scripts"
              className="size-full"
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <a
            href={coords ? `https://www.google.com/maps/dir//${coords.lat},${coords.lng}/@${coords.lat},${coords.lng},15z` : mapsUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <MapPin className="size-4" />
            Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}
