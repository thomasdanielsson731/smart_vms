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

/** Mock förbrukning tills inspelningstjänst rapporterar riktiga värden */
export function mockStorageUsage(settings: RecordingStorageSettings): StorageUsageSnapshot {
  const recordingUsedGiB = Math.min(
    settings.maxRecordingGiB * 0.62,
    settings.maxRecordingGiB,
  )
  const clipsCap =
    settings.maxClipsGiB > 0 ? settings.maxClipsGiB : settings.maxRecordingGiB * 0.1
  const clipsUsedGiB = Math.min(clipsCap * 0.45, clipsCap)

  const recordingPercent =
    settings.maxRecordingGiB > 0
      ? Math.round((recordingUsedGiB / settings.maxRecordingGiB) * 100)
      : 0
  const clipsPercent = clipsCap > 0 ? Math.round((clipsUsedGiB / clipsCap) * 100) : 0

  return {
    recordingUsedGiB,
    clipsUsedGiB,
    recordingPercent,
    clipsPercent,
    isOverQuota: recordingPercent >= 100,
    isWarning: recordingPercent >= settings.warnAtPercent,
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
