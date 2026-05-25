import type { CameraMapPlacement, MapSiteSettings } from '@/types/map'
import { defaultMapSite } from '@/types/map'

/** Place cameras in a ring around the site center (meters-scale offsets). */
export function buildDefaultPlacements(
  cameraIds: string[],
  site: MapSiteSettings = defaultMapSite,
): Record<string, CameraMapPlacement> {
  const out: Record<string, CameraMapPlacement> = {}
  const count = cameraIds.length
  if (count === 0) return out

  const radiusM = 25
  const metersPerDegLat = 111_320
  const metersPerDegLng = 111_320 * Math.cos((site.centerLat * Math.PI) / 180)

  cameraIds.forEach((id, index) => {
    const bearingDeg = (360 / count) * index
    const rad = (bearingDeg * Math.PI) / 180
    const eastM = Math.sin(rad) * radiusM
    const northM = Math.cos(rad) * radiusM

    out[id] = {
      cameraId: id,
      lat: site.centerLat + northM / metersPerDegLat,
      lng: site.centerLng + eastM / metersPerDegLng,
      heading: (bearingDeg + 180) % 360,
      fovDeg: 70,
      rangeM: 20,
      viewLabel: '',
    }
  })

  return out
}
