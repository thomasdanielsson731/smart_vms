import { describe, expect, it } from 'vitest'
import { formatGiB, storageUsageSnapshot } from './storage-utils'
import type { RecordingStorageSettings } from '@/types/storage'

const baseSettings: RecordingStorageSettings = {
  maxRecordingGiB: 100,
  maxClipsGiB: 10,
  maxRetentionDays: 30,
  warnAtPercent: 80,
  onLimitReached: 'delete_oldest',
}

describe('storageUsageSnapshot', () => {
  it('returns zero usage until server reports values', () => {
    const usage = storageUsageSnapshot(baseSettings)
    expect(usage.recordingUsedGiB).toBe(0)
    expect(usage.clipsUsedGiB).toBe(0)
    expect(usage.recordingPercent).toBe(0)
    expect(usage.clipsPercent).toBe(0)
    expect(usage.isOverQuota).toBe(false)
    expect(usage.isWarning).toBe(false)
  })
})

describe('formatGiB', () => {
  it('formats small values with one decimal', () => {
    expect(formatGiB(12.4)).toBe('12.4 GiB')
  })

  it('rounds large values', () => {
    expect(formatGiB(256)).toBe('256 GiB')
  })
})
