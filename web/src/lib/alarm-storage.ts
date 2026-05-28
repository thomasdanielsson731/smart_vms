import type { AlarmDefinition, AlarmSeverity, AlarmTrigger } from '@/types/alarm'

const STORAGE_KEY = 'smart-vms-alarm-definitions'

const TRIGGERS: AlarmTrigger[] = ['person', 'vehicle', 'vapix_motion', 'line_cross']
const SEVERITIES: AlarmSeverity[] = ['low', 'medium', 'high']

function isTrigger(value: unknown): value is AlarmTrigger {
  return typeof value === 'string' && TRIGGERS.includes(value as AlarmTrigger)
}

function isSeverity(value: unknown): value is AlarmSeverity {
  return typeof value === 'string' && SEVERITIES.includes(value as AlarmSeverity)
}

export function normalizeAlarmDefinition(raw: unknown): AlarmDefinition | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  if (typeof item.id !== 'string' || typeof item.name !== 'string') return null
  if (!Array.isArray(item.cameraIds) || item.cameraIds.some((id) => typeof id !== 'string')) {
    return null
  }
  if (!isTrigger(item.trigger) || !isSeverity(item.severity)) return null

  return {
    id: item.id,
    name: item.name,
    description: typeof item.description === 'string' ? item.description : '',
    cameraIds: item.cameraIds,
    schedule: typeof item.schedule === 'string' ? item.schedule : 'Every day 00:00–23:59',
    trigger: item.trigger,
    zoneName: typeof item.zoneName === 'string' ? item.zoneName : undefined,
    severity: item.severity,
    quietHours: typeof item.quietHours === 'string' ? item.quietHours : undefined,
    enabled: item.enabled !== false,
    createdAt:
      typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
  }
}

export function loadAlarmDefinitions(): AlarmDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeAlarmDefinition)
      .filter((item): item is AlarmDefinition => item != null)
  } catch {
    return []
  }
}

export function saveAlarmDefinitions(alarms: AlarmDefinition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
}
