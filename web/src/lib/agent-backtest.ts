import type { AlarmDraft, AlarmDefinition, AlarmTrigger } from '@/types/alarm'
import type { ForensicIncident } from '@/types/forensic'
import type { IncidentSeverity } from '@/types/incident'

export type AgentBacktestRange = '24h' | '7d' | '30d'

export interface AgentBacktestHit {
  incidentId: string
  title: string
  cameraId: string
  cameraName: string
  occurredAt: string
  severity: IncidentSeverity
  matchedBecause: string
}

export interface AgentBacktestResult {
  range: AgentBacktestRange
  rangeStart: string
  rangeEnd: string
  totalRecordedEvents: number
  matchedCount: number
  hits: AgentBacktestHit[]
}

export type AgentRuleInput = Pick<
  AlarmDefinition,
  'cameraIds' | 'trigger' | 'zoneName' | 'quietHours' | 'severity'
>

export function backtestRangeToMs(range: AgentBacktestRange): number {
  switch (range) {
    case '24h':
      return 24 * 3600_000
    case '7d':
      return 7 * 24 * 3600_000
    case '30d':
      return 30 * 24 * 3600_000
  }
}

function inferTriggerFromIncident(incident: ForensicIncident): AlarmTrigger | null {
  const text = `${incident.title} ${incident.ruleName ?? ''}`.toLowerCase()
  if (/line.?cross|linje|passerar linje/.test(text)) return 'line_cross'
  if (/fordon|vehicle|bil|delivery/.test(text)) return 'vehicle'
  if (/vapix|rörelse|motion/.test(text)) return 'vapix_motion'
  if (/person|intrång|intrusion|visitor|unknown/.test(text)) return 'person'
  return null
}

function triggerMatches(incident: ForensicIncident, trigger: AlarmTrigger): boolean {
  const inferred = inferTriggerFromIncident(incident)
  if (inferred === trigger) return true
  if (trigger === 'vapix_motion' && inferred == null && /motion|rörelse/.test(incident.title.toLowerCase())) {
    return true
  }
  return false
}

function parseHourMinute(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

/** Returns true when the event falls inside quiet hours (rule suppressed). */
export function isWithinQuietHours(iso: string, quietHours: string | undefined): boolean {
  if (!quietHours?.trim()) return false
  const parts = quietHours.split(/[–—-]/).map((p) => p.trim())
  if (parts.length !== 2) return false
  const start = parseHourMinute(parts[0])
  const end = parseHourMinute(parts[1])
  if (start == null || end == null) return false

  const d = new Date(iso)
  const minutes = d.getHours() * 60 + d.getMinutes()

  if (start <= end) return minutes >= start && minutes < end
  return minutes >= start || minutes < end
}

function zoneMatches(incident: ForensicIncident, zoneName: string | undefined): boolean {
  if (!zoneName?.trim()) return true
  const needle = zoneName.trim().toLowerCase()
  const hay = `${incident.title} ${incident.ruleName ?? ''} ${incident.cameraName}`.toLowerCase()
  return hay.includes(needle)
}

export function incidentMatchesAgentRule(
  incident: ForensicIncident,
  rule: AgentRuleInput,
): { matched: boolean; reason: string } {
  if (rule.cameraIds.length > 0 && !rule.cameraIds.includes(incident.cameraId)) {
    return { matched: false, reason: 'Different camera' }
  }
  if (isWithinQuietHours(incident.occurredAt, rule.quietHours)) {
    return { matched: false, reason: 'Inside quiet hours' }
  }
  if (!zoneMatches(incident, rule.zoneName)) {
    return { matched: false, reason: 'Zone mismatch' }
  }
  if (!triggerMatches(incident, rule.trigger)) {
    return { matched: false, reason: `Trigger ${rule.trigger} not detected` }
  }
  return {
    matched: true,
    reason: `Matched ${rule.trigger}${rule.zoneName ? ` in ${rule.zoneName}` : ''}`,
  }
}

export function runAgentBacktest(
  rule: AgentRuleInput,
  incidents: ForensicIncident[],
  range: AgentBacktestRange,
  now: Date = new Date(),
): AgentBacktestResult {
  const rangeEnd = now
  const rangeStart = new Date(now.getTime() - backtestRangeToMs(range))

  const inRange = incidents.filter((i) => {
    const t = new Date(i.occurredAt).getTime()
    return t >= rangeStart.getTime() && t <= rangeEnd.getTime()
  })

  const hits: AgentBacktestHit[] = []
  for (const incident of inRange) {
    const { matched, reason } = incidentMatchesAgentRule(incident, rule)
    if (!matched) continue
    hits.push({
      incidentId: incident.id,
      title: incident.title,
      cameraId: incident.cameraId,
      cameraName: incident.cameraName,
      occurredAt: incident.occurredAt,
      severity: incident.severity,
      matchedBecause: reason,
    })
  }

  hits.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())

  return {
    range,
    rangeStart: rangeStart.toISOString(),
    rangeEnd: rangeEnd.toISOString(),
    totalRecordedEvents: inRange.length,
    matchedCount: hits.length,
    hits,
  }
}

export function draftToRuleInput(draft: AlarmDraft): AgentRuleInput {
  return {
    cameraIds: draft.cameraIds,
    trigger: draft.trigger,
    zoneName: draft.zoneName || undefined,
    quietHours: draft.quietHours || undefined,
    severity: draft.severity,
  }
}

export function alarmToRuleInput(alarm: AlarmDefinition): AgentRuleInput {
  return {
    cameraIds: alarm.cameraIds,
    trigger: alarm.trigger,
    zoneName: alarm.zoneName,
    quietHours: alarm.quietHours,
    severity: alarm.severity,
  }
}
