import { describe, expect, it } from 'vitest'
import {
  applyRetention,
  framesToSegments,
  type RecordingFrameMeta,
} from './store'

const frame = (cameraId: string, iso: string, bytes = 1000): RecordingFrameMeta => ({
  id: `f-${iso}`,
  cameraId,
  capturedAt: iso,
  bytes,
  relativePath: `${cameraId}/${iso}.jpg`,
})

describe('framesToSegments', () => {
  it('groups frames within 5 minutes', () => {
    const segments = framesToSegments([
      frame('cam-a', '2026-05-24T10:00:00.000Z'),
      frame('cam-a', '2026-05-24T10:02:00.000Z'),
      frame('cam-a', '2026-05-24T10:10:00.000Z'),
    ])
    expect(segments).toHaveLength(2)
    expect(segments[0]?.frameCount).toBe(2)
  })
})

describe('applyRetention', () => {
  it('drops oldest when over quota', () => {
    const kept = applyRetention('/tmp', [frame('c', '2026-05-01T00:00:00.000Z', 900), frame('c', '2026-05-24T00:00:00.000Z', 900)], {
      maxRecordingGiB: 0.000001,
      maxClipsGiB: 0,
      maxRetentionDays: 30,
      warnAtPercent: 85,
      onLimitReached: 'delete_oldest',
    })
    expect(kept).toHaveLength(1)
    expect(kept[0]?.capturedAt).toContain('2026-05-24')
  })
})
