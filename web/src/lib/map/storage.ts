import type { CameraMapPlacement } from '@/types/map'
import type { MapSiteSettings } from '@/types/map'
import { defaultMapSite } from '@/types/map'

const PLACEMENTS_KEY = 'smart-vms-map-placements'
const SITE_KEY = 'smart-vms-map-site'

export function loadMapPlacements(): Record<string, CameraMapPlacement> {
  try {
    const raw = localStorage.getItem(PLACEMENTS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, CameraMapPlacement>
  } catch {
    return {}
  }
}

export function saveMapPlacements(placements: Record<string, CameraMapPlacement>): void {
  localStorage.setItem(PLACEMENTS_KEY, JSON.stringify(placements))
}

export function loadMapSite(): MapSiteSettings {
  try {
    const raw = localStorage.getItem(SITE_KEY)
    if (!raw) return defaultMapSite
    return JSON.parse(raw) as MapSiteSettings
  } catch {
    return defaultMapSite
  }
}

export function saveMapSite(site: MapSiteSettings): void {
  localStorage.setItem(SITE_KEY, JSON.stringify(site))
}
