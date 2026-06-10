export interface ResolvedMap {
  maps_url: string;
  lat: number;
  lng: number;
}

function extractCoordinates(url: string): { lat: number; lng: number } | null {
  const at = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };

  const q = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (q) return { lat: parseFloat(q[1]), lng: parseFloat(q[2]) };

  const ll = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (ll) return { lat: parseFloat(ll[1]), lng: parseFloat(ll[2]) };

  return null;
}

export async function resolveGoogleMapsUrl(input: string): Promise<ResolvedMap> {
  let resolvedUrl: string;

  try {
    const resp = await fetch(input, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(5000) });
    resolvedUrl = resp.url;
  } catch {
    throw new Error("Could not reach the URL. Check the link and try again.");
  }

  const coords = extractCoordinates(resolvedUrl);
  if (!coords) {
    throw new Error(
      "Could not find coordinates in the Google Maps link. Make sure it's a valid Google Maps URL with a pinned location.",
    );
  }

  return { maps_url: resolvedUrl, ...coords };
}

export function parseMapsUrl(mapsUrl: string | null | undefined): { lat: number; lng: number } | null {
  if (!mapsUrl) return null;
  return extractCoordinates(mapsUrl);
}
