export interface ResolvedMap {
  maps_url: string;
  lat: number | null;
  lng: number | null;
}

function extractCoordinates(url: string): { lat: number; lng: number } | null {
  const pbMatch = url.match(/[?&]pb=([^&]+)/);
  if (pbMatch) {
    const pb = pbMatch[1];
    const place = pb.match(/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/);
    if (place) return { lat: parseFloat(place[2]), lng: parseFloat(place[1]) };
    const center = pb.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (center) return { lat: parseFloat(center[1]), lng: parseFloat(center[2]) };
  }

  const at = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };

  const q = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (q) return { lat: parseFloat(q[1]), lng: parseFloat(q[2]) };

  const ll = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (ll) return { lat: parseFloat(ll[1]), lng: parseFloat(ll[2]) };

  return null;
}

export async function resolveGoogleMapsUrl(input: string): Promise<ResolvedMap> {
  const domain = (input.match(/^https?:\/\/([^\/]+)/) || [])[1];

  if (!domain) {
    throw new Error("Invalid URL. Please paste a full Google Maps link starting with https://");
  }

  if (domain.includes("google") && (domain.includes("goo.gl") || input.includes("maps.app.goo.gl"))) {
    throw new Error(
      "This looks like a mobile app share link. Open Google Maps on your computer, search for the location, click Share → Embed a map, and paste the iframe src URL starting with https://www.google.com/maps/embed?pb=...",
    );
  }

  if (!domain.includes("google.com")) {
    throw new Error("Please paste a Google Maps URL (starting with https://www.google.com/maps/...)");
  }

  let resolvedUrl: string;

  try {
    const resp = await fetch(input, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(5000) });
    resolvedUrl = resp.url;
  } catch {
    throw new Error("Could not reach the URL. Check the link and try again.");
  }

  const coords = extractCoordinates(resolvedUrl);

  return { maps_url: resolvedUrl, lat: coords?.lat ?? null, lng: coords?.lng ?? null };
}

export function parseMapsUrl(mapsUrl: string | null | undefined): { lat: number; lng: number } | null {
  if (!mapsUrl) return null;
  return extractCoordinates(mapsUrl);
}
