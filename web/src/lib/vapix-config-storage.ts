import type { VapixConnectionSettings } from '@/types/vapix'

const STORAGE_KEY = 'smart-vms-vapix-config'

export function loadLocalVapixSettings(): VapixConnectionSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as VapixConnectionSettings
  } catch {
    return null
  }
}

export function saveLocalVapixSettings(settings: VapixConnectionSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function clearLocalVapixSettings(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export const defaultVapixUser = 'root'
