import { describe, expect, it } from 'vitest'
import {
  addScenario,
  createMotionScenario,
  nextScenarioId,
  removeScenario,
  scenarioTypeLabel,
} from './aoa-config'

describe('aoa-config', () => {
  it('creates a full-frame motion scenario', () => {
    const scenario = createMotionScenario({ id: 2, name: 'Driveway', deviceId: 1 })
    expect(scenario.type).toBe('motion')
    expect(scenario.triggers?.[0]).toMatchObject({ type: 'includeArea' })
    expect(scenario.devices).toEqual([{ id: 1 }])
  })

  it('allocates next scenario id', () => {
    expect(nextScenarioId([{ id: 1, name: 'A', type: 'motion' }])).toBe(2)
    expect(nextScenarioId([])).toBe(1)
  })

  it('adds and removes scenarios immutably', () => {
    const base = { scenarios: [{ id: 1, name: 'A', type: 'motion' }] }
    const added = addScenario(base, createMotionScenario({ id: 2, name: 'B' }))
    expect(added.scenarios).toHaveLength(2)
    const removed = removeScenario(added, 1)
    expect(removed.scenarios?.map((s) => s.id)).toEqual([2])
  })

  it('labels scenario types', () => {
    expect(scenarioTypeLabel('crosslinecounting')).toBe('Crossline counting')
  })
})
