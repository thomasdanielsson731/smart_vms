/** Vad som händer när inspelningskvoten nås */
export type StorageLimitPolicy = 'delete_oldest' | 'stop_recording' | 'warn_only'

export interface RecordingStorageSettings {
  /** Max total storlek för inspelningar (GiB) */
  maxRecordingGiB: number
  /** Max storlek för händelseklipp (GiB), 0 = del av inspelningskvot */
  maxClipsGiB: number
  /** Max ålder inspelning (dagar) — raderas även om utrymme finns */
  maxRetentionDays: number
  /** Varna operatör vid denna andel av kvoten (0–100) */
  warnAtPercent: number
  /** Policy vid 100 % av inspelningskvoten */
  onLimitReached: StorageLimitPolicy
}

export interface StorageUsageSnapshot {
  recordingUsedGiB: number
  clipsUsedGiB: number
  recordingPercent: number
  clipsPercent: number
  isOverQuota: boolean
  isWarning: boolean
}

export const defaultRecordingStorageSettings = (): RecordingStorageSettings => ({
  maxRecordingGiB: 500,
  maxClipsGiB: 50,
  maxRetentionDays: 30,
  warnAtPercent: 85,
  onLimitReached: 'delete_oldest',
})
