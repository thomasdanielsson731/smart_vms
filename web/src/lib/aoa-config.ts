import type { AoaConfiguration, AoaScenario } from '@/types/aoa'

const FULL_FRAME_VERTICES: [number, number][] = [
  [-0.9, -0.9],
  [-0.9, 0.9],
  [0.9, 0.9],
  [0.9, -0.9],
]

export function nextScenarioId(scenarios: AoaScenario[] | undefined): number {
  const ids = (scenarios ?? []).map((s) => s.id)
  if (ids.length === 0) return 1
  return Math.max(...ids) + 1
}

export function defaultDeviceId(config: AoaConfiguration | undefined): number {
  const fromConfig = config?.devices?.[0]?.id
  if (typeof fromConfig === 'number') return fromConfig
  return 1
}

export function createMotionScenario(options: {
  id: number
  name: string
  deviceId?: number
}): AoaScenario {
  return {
    id: options.id,
    name: options.name.trim(),
    type: 'motion',
    devices: [{ id: options.deviceId ?? 1 }],
    triggers: [{ type: 'includeArea', vertices: FULL_FRAME_VERTICES }],
  }
}

export function addScenario(config: AoaConfiguration, scenario: AoaScenario): AoaConfiguration {
  const scenarios = [...(config.scenarios ?? []), scenario]
  return { ...config, scenarios }
}

export function removeScenario(config: AoaConfiguration, scenarioId: number): AoaConfiguration {
  return {
    ...config,
    scenarios: (config.scenarios ?? []).filter((s) => s.id !== scenarioId),
  }
}

export function scenarioTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case 'motion':
      return 'Motion in area'
    case 'fence':
      return 'Line crossing (fence)'
    case 'crosslinecounting':
      return 'Crossline counting'
    case 'occupancyinarea':
      return 'Occupancy in area'
    default:
      return type
  }
}
