import type { CameraMapPlacement } from '@/types/map'

/** Default positions for demo (adjust to your property in the map view) */
export function buildDefaultPlacements(cameraIds: string[]): Record<string, CameraMapPlacement> {
  const presets: Record<string, Omit<CameraMapPlacement, 'cameraId'>> = {
    'cam-driveway': {
      lat: 59.32955,
      lng: 18.06785,
      heading: 200,
      fovDeg: 70,
      rangeM: 22,
      viewLabel: 'Driveway and approach',
    },
    'cam-entry': {
      lat: 59.32935,
      lng: 18.06825,
      heading: 270,
      fovDeg: 65,
      rangeM: 12,
      viewLabel: 'Entry and door',
    },
    'cam-garden': {
      lat: 59.32915,
      lng: 18.06855,
      heading: 15,
      fovDeg: 90,
      rangeM: 25,
      viewLabel: 'Garden and patio',
    },
    'cam-garage': {
      lat: 59.32945,
      lng: 18.06875,
      heading: 120,
      fovDeg: 60,
      rangeM: 15,
      viewLabel: 'Garage door',
    },
  }

  const out: Record<string, CameraMapPlacement> = {}
  for (const id of cameraIds) {
    const p = presets[id]
    if (p) out[id] = { cameraId: id, ...p }
  }
  return out
}
