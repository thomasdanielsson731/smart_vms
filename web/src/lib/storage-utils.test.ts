import { describe, expect, it } from 'vitest'
import { formatGiB, mockStorageUsage } from './storage-utils'
import type { RecordingStorageSettings } from '@/types/storage'

const baseSettings: RecordingStorageSettings = {
  maxRecordingGiB: 100,
  maxClipsGiB: 10,
  maxRetentionDays: 30,
  warnAtPercent: 80,
  onLimitReached: 'delete_oldest',
}

describe('mockStorageUsage', () => {
  it('computes usage percentages within quota', () => {
    const usage = mockStorageUsage(baseSettings)
    expect(usage.recordingUsedGiB).toBeLessThanOrEqual(baseSettings.maxRecordingGiB)
    expect(usage.recordingPercent).toBeGreaterThan(0)
    expect(usage.recordingPercent).toBeLessThan(100)
    expect(usage.isOverQuota).toBe(false)
  })

  it('flags warning when usage exceeds warnAtPercent', () => {
    const usage = mockStorageUsage({ ...baseSettings, warnAtPercent: 50 })
    expect(usage.isWarning).toBe(usage.recordingPercent >= 50)
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
