export async function getRoadDistanceKm(
  sellerLat: number,
  sellerLng: number,
  buyerLat: number,
  buyerLng: number
): Promise<number> {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${sellerLng},${sellerLat};${buyerLng},${buyerLat}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&overview=false`;

  const res = await fetch(url);
  const data = await res.json();

  const meters = data.routes?.[0]?.distance ?? 0;
  return meters / 1000; // convert meters → km
}
