import { describe, expect, it } from 'vitest'
import { parseAxisEventPayload, toForensicIncidents } from './recorded-events'

describe('parseAxisEventPayload', () => {
  it('parses XML event blocks', () => {
    const xml = `
      <events>
        <event>
          <topic>tns1:RuleEngine/ MotionCounter/ Motion</topic>
          <utcTime>2026-05-24T10:15:00Z</utcTime>
        </event>
      </events>`
    const parsed = parseAxisEventPayload(xml)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].title).toMatch(/motion/i)
  })

  it('parses JSON event arrays', () => {
    const parsed = parseAxisEventPayload(
      JSON.stringify({
        events: [{ topic: 'tns1:Analytics/ HumanDetected', timestamp: '2026-05-24T09:00:00Z' }],
      }),
    )
    expect(parsed[0].title).toMatch(/person/i)
  })
})

describe('toForensicIncidents', () => {
  it('maps parsed events into forensic incidents', () => {
    const start = new Date('2026-05-24T08:00:00Z')
    const end = new Date('2026-05-24T12:00:00Z')
    const incidents = toForensicIncidents(
      [{ occurredAt: '2026-05-24T10:00:00Z', topic: 'motion', title: 'Motion' }],
      'cam-a',
      'Driveway',
      start,
      end,
    )
    expect(incidents).toHaveLength(1)
    expect(incidents[0].cameraName).toBe('Driveway')
  })
})
