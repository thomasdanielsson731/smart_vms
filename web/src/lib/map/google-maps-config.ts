/** Google Maps JavaScript API key — Maps JavaScript API must be enabled in Cloud Console */
export const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim()

/** Demo map ID works for development; replace with your own Map ID in production */
export const googleMapsMapId =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID').trim()

export function isGoogleMapsEnabled(): boolean {
  return googleMapsApiKey.length > 0
}
