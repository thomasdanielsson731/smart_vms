import type { CameraMapPlacement } from '@/types/map'

/** Startpositioner för demo (justera till din fastighet i kartvyn) */
export function buildDefaultPlacements(cameraIds: string[]): Record<string, CameraMapPlacement> {
  const presets: Record<string, Omit<CameraMapPlacement, 'cameraId'>> = {
    'cam-driveway': {
      lat: 59.32955,
      lng: 18.06785,
      heading: 200,
      fovDeg: 70,
      rangeM: 22,
      viewLabel: 'Uppfart och infart',
    },
    'cam-entry': {
      lat: 59.32935,
      lng: 18.06825,
      heading: 270,
      fovDeg: 65,
      rangeM: 12,
      viewLabel: 'Entré och dörr',
    },
    'cam-garden': {
      lat: 59.32915,
      lng: 18.06855,
      heading: 15,
      fovDeg: 90,
      rangeM: 25,
      viewLabel: 'Trädgård och uteplats',
    },
    'cam-garage': {
      lat: 59.32945,
      lng: 18.06875,
      heading: 120,
      fovDeg: 60,
      rangeM: 15,
      viewLabel: 'Garageport',
    },
  }

  const out: Record<string, CameraMapPlacement> = {}
  for (const id of cameraIds) {
    const p = presets[id]
    if (p) out[id] = { cameraId: id, ...p }
  }
  return out
}
