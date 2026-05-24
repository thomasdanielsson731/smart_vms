/** Placering och riktad vy för kamera på karta */
export interface CameraMapPlacement {
  cameraId: string
  lat: number
  lng: number
  /** Bäring i grader, 0 = norr, medurs */
  heading: number
  /** Öppningsvinkel för bildfält (grader) */
  fovDeg: number
  /** Ungefärlig räckvidd för vy-sektor (meter) */
  rangeM: number
  /** Beskrivning av vad kameran tittar på */
  viewLabel: string
}

export interface MapSiteSettings {
  centerLat: number
  centerLng: number
  defaultZoom: number
}

export const defaultMapSite: MapSiteSettings = {
  centerLat: 59.3293,
  centerLng: 18.0686,
  defaultZoom: 18,
}
