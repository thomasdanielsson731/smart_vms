import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  loadAlarmDefinitions,
  normalizeAlarmDefinition,
  saveAlarmDefinitions,
} from '@/lib/alarm-storage'
import type { AlarmDefinition } from '@/types/alarm'

const sample: AlarmDefinition = {
  id: 'alarm-test-1',
  name: 'Garage after 22:00',
  description: 'Person in garage',
  cameraIds: ['cam-garage'],
  schedule: 'Every day 22:00–06:00',
  trigger: 'person',
  severity: 'high',
  enabled: true,
  createdAt: '2026-05-28T10:00:00.000Z',
}

describe('alarm-storage', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
    })
  })

  it('round-trips alarm definitions via localStorage', () => {
    saveAlarmDefinitions([sample])
    expect(loadAlarmDefinitions()).toEqual([sample])
  })

  it('drops invalid stored entries', () => {
    localStorage.setItem('smart-vms-alarm-definitions', JSON.stringify([sample, { id: 1 }]))
    const loaded = loadAlarmDefinitions()
    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.id).toBe(sample.id)
  })

  it('normalizes optional fields', () => {
    const normalized = normalizeAlarmDefinition({
      ...sample,
      zoneName: 'porch',
      quietHours: '22:00-06:00',
    })
    expect(normalized?.zoneName).toBe('porch')
    expect(normalized?.quietHours).toBe('22:00-06:00')
  })
})
