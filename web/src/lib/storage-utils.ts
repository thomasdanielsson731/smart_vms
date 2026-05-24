import type { RecordingStorageSettings, StorageUsageSnapshot } from '@/types/storage'

const STORAGE_KEY = 'smart-vms-recording-storage'

export function loadStorageSettings(): RecordingStorageSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as RecordingStorageSettings
  } catch {
    return null
  }
}

export function saveStorageSettings(settings: RecordingStorageSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

/** Usage snapshot until the recording service reports real values. */
export function storageUsageSnapshot(_settings: RecordingStorageSettings): StorageUsageSnapshot {
  return {
    recordingUsedGiB: 0,
    clipsUsedGiB: 0,
    recordingPercent: 0,
    clipsPercent: 0,
    isOverQuota: false,
    isWarning: false,
  }
}

export function formatGiB(gib: number): string {
  if (gib >= 100) return `${Math.round(gib)} GiB`
  return `${gib.toFixed(1)} GiB`
}

export const policyLabels: Record<RecordingStorageSettings['onLimitReached'], string> = {
  delete_oldest: 'Delete oldest recordings (recommended)',
  stop_recording: 'Stop new recordings',
  warn_only: 'Warn only (no automatic action)',
}
