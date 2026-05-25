import type { CameraMapPlacement } from '@/types/map'

/** Wedge polygon för kamerans bildfält (lat/lng) */
export function fovWedgeCoords(
  lat: number,
  lng: number,
  headingDeg: number,
  fovDeg: number,
  rangeM: number,
  steps = 24,
): [number, number][] {
  const coords: [number, number][] = [[lat, lng]]
  const half = fovDeg / 2
  const start = headingDeg - half
  const end = headingDeg + half

  for (let i = 0; i <= steps; i++) {
    const bearing = start + ((end - start) * i) / steps
    const [pLat, pLng] = destinationPoint(lat, lng, bearing, rangeM)
    coords.push([pLat, pLng])
  }
  coords.push([lat, lng])
  return coords
}

/** En punkt ut från lat/lng med bäring (grader) och avstånd (meter) */
export function destinationPoint(
  lat: number,
  lng: number,
  bearingDeg: number,
  distanceM: number,
): [number, number] {
  const R = 6371000
  const brng = (bearingDeg * Math.PI) / 180
  const lat1 = (lat * Math.PI) / 180
  const lng1 = (lng * Math.PI) / 180
  const d = distanceM / R

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  )
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    )

  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI]
}

export function placementFromPartial(
  cameraId: string,
  partial: Partial<CameraMapPlacement> & { lat: number; lng: number },
): CameraMapPlacement {
  return {
    cameraId,
    lat: partial.lat,
    lng: partial.lng,
    heading: partial.heading ?? 180,
    fovDeg: partial.fovDeg ?? 75,
    rangeM: partial.rangeM ?? 18,
    viewLabel: partial.viewLabel ?? '',
  }
}

export function placedCameraPoints(
  placements: Record<string, CameraMapPlacement>,
  cameraIds: string[],
): { lat: number; lng: number }[] {
  return cameraIds
    .map((id) => placements[id])
    .filter((p): p is CameraMapPlacement => !!p)
    .map((p) => ({ lat: p.lat, lng: p.lng }))
}

export function centerOfPoints(
  points: { lat: number; lng: number }[],
): { lat: number; lng: number } | null {
  if (points.length === 0) return null
  if (points.length === 1) return points[0]!
  const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length
  const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length
  return { lat, lng }
}
