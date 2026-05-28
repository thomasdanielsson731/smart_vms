import { describe, expect, it } from 'vitest'
import {
  axisEventToSmartVmsEvent,
  stableEventId,
  vapixEventKey,
} from './vapix-event-normalize'
import { extractEventsFromBuffer } from './vapix-live-stream'

describe('vapixEventKey', () => {
  it('builds stable dedupe key', () => {
    expect(vapixEventKey('cam-a', 'motion', '2026-05-24T10:00:00Z')).toBe(
      'cam-a|motion|2026-05-24T10:00:00Z',
    )
  })
})

describe('stableEventId', () => {
  it('is deterministic for the same vapix key', () => {
    const key = vapixEventKey('cam-a', 'motion', '2026-05-24T10:00:00Z')
    expect(stableEventId(key)).toBe(stableEventId(key))
  })
})

describe('axisEventToSmartVmsEvent', () => {
  it('maps Axis events to SmartVmsEvent envelope', () => {
    const event = axisEventToSmartVmsEvent(
      {
        occurredAt: '2026-05-24T10:00:00Z',
        topic: 'tns1:RuleEngine/Motion',
        title: 'VAPIX motion event',
      },
      { id: 'cam-driveway', name: 'Driveway' },
    )
    expect(event.event_type).toBe('vapix.received')
    expect(event.source.camera_id).toBe('cam-driveway')
    expect(event.payload.vapix_event_key).toContain('cam-driveway')
  })
})

describe('extractEventsFromBuffer', () => {
  it('parses incremental XML chunks', () => {
    const chunk1 = '<event><topic>motion</topic><utcTime>2026-05-24T10:00:00Z</utcTime></event><event><topic>vehicle</topic><utcTime>2026-05-24T10:01:00Z</utcTime>'
    const first = extractEventsFromBuffer(chunk1)
    expect(first.events).toHaveLength(1)

    const second = extractEventsFromBuffer(first.remainder + '</utcTime></event>')
    expect(second.events).toHaveLength(1)
    expect(second.events[0].title).toMatch(/vehicle/i)
  })
})
