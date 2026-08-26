const EARTH_RADIUS_METERS = 6_371_000;

export interface GeoBoundingBox {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

export function distanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
): number {
  const latDelta = toRadians(latitudeB - latitudeA);
  const lngDelta = toRadians(longitudeB - longitudeA);
  const latA = toRadians(latitudeA);
  const latB = toRadians(latitudeB);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(lngDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
}

export function boundingBoxForRadius(
  latitude: number,
  longitude: number,
  radiusMeters: number
): GeoBoundingBox {
  const latitudeDelta = radiusMeters / 111_320;
  const longitudeDelta =
    radiusMeters / (111_320 * Math.cos(toRadians(latitude)) || 1);

  return {
    minLatitude: latitude - latitudeDelta,
    maxLatitude: latitude + latitudeDelta,
    minLongitude: longitude - longitudeDelta,
    maxLongitude: longitude + longitudeDelta,
  };
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
