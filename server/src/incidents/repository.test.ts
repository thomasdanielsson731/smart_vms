import { describe, expect, it } from 'vitest'
import { InMemoryIncidentRepository } from './memory-store.js'
import { buildSearchText, incidentFromEvent } from './repository.js'

describe('InMemoryIncidentRepository', () => {
  it('ingests detection events as incidents', async () => {
    const repo = new InMemoryIncidentRepository()
    const incident = await repo.ingestEvent({
      schema_version: '1.0',
      event_id: 'evt-1',
      event_type: 'detection.created',
      occurred_at: new Date().toISOString(),
      source: { camera_id: 'cam-a', edge_node_id: 'edge-1' },
      payload: { title: 'Person in driveway', camera_name: 'Driveway' },
    })
    expect(incident?.title).toBe('Person in driveway')
    expect(incident?.cameraName).toBe('Driveway')

    const list = await repo.listIncidents({ q: 'driveway' })
    expect(list).toHaveLength(1)
  })

  it('dedupes by event_id', async () => {
    const repo = new InMemoryIncidentRepository()
    const event = {
      schema_version: '1.0',
      event_id: 'evt-dup',
      event_type: 'rule.matched',
      occurred_at: new Date().toISOString(),
      source: { camera_id: 'cam-a' },
      payload: { title: 'Rule hit' },
    }
    await repo.ingestEvent(event)
    await repo.ingestEvent(event)
    const list = await repo.listIncidents({})
    expect(list).toHaveLength(1)
  })
})

describe('buildSearchText', () => {
  it('includes payload fields for metadata search', () => {
    const text = buildSearchText({
      schema_version: '1.0',
      event_id: 'x',
      event_type: 'detection.created',
      occurred_at: new Date().toISOString(),
      source: { camera_id: 'cam-1' },
      payload: { class: 'person' },
    })
    expect(text).toContain('person')
  })
})

describe('incidentFromEvent', () => {
  it('computes clip window around occurred_at', () => {
    const occurred = '2026-05-25T12:00:00.000Z'
    const inc = incidentFromEvent({
      schema_version: '1.0',
      event_id: 'e1',
      event_type: 'detection.created',
      occurred_at: occurred,
      source: { camera_id: 'cam-1' },
      payload: {},
    })
    expect(inc.durationSec).toBe(30)
    expect(new Date(inc.clipStartAt).getTime()).toBeLessThan(Date.parse(occurred))
  })
})
