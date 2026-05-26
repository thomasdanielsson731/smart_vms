import { describe, expect, it } from 'vitest'
import { matchIncidentQuery, parseEventSearchIntent } from '@/lib/event-search'
import type { ForensicIncident } from '@/types/forensic'

const sample: ForensicIncident = {
  id: '1',
  title: 'Vehicle detected',
  cameraId: 'cam-driveway',
  cameraName: 'Driveway',
  severity: 'medium',
  status: 'closed',
  occurredAt: '2026-05-20T10:00:00.000Z',
  ruleName: 'axis/RuleEngine/vehicle',
  clipStartAt: '2026-05-20T09:59:50.000Z',
  clipEndAt: '2026-05-20T10:00:20.000Z',
  durationSec: 30,
}

describe('matchIncidentQuery', () => {
  it('matches all tokens in metadata', () => {
    expect(matchIncidentQuery(sample, 'vehicle driveway')).toBe(true)
    expect(matchIncidentQuery(sample, 'person driveway')).toBe(false)
  })

  it('returns true for empty query', () => {
    expect(matchIncidentQuery(sample, '')).toBe(true)
  })
})

describe('parseEventSearchIntent', () => {
  it('extracts query and range from natural language', () => {
    const parsed = parseEventSearchIntent('Show me vehicles at the driveway last week')
    expect(parsed?.query).toMatch(/vehicle/i)
    expect(parsed?.range).toBe('7d')
    expect(parsed?.cameraId).toBe('cam-driveway')
  })

  it('handles alarm why questions', () => {
    const parsed = parseEventSearchIntent('Why did I get an alarm at 23:14?')
    expect(parsed?.query).toBe('23:14')
  })

  it('returns null for unrelated prompts', () => {
    expect(parseEventSearchIntent('Open live from the driveway')).toBeNull()
  })
})
