import type { Camera } from '@/types/camera'
import type { FaceProfile, FaceRecognitionSettings } from '@/types/face'
import type { ForensicIncident } from '@/types/forensic'
import type { IncidentSeverity } from '@/types/incident'
import { isNotableIncident } from '@/lib/alarm-tier2-analytics'
import { filterIncidentsInRange } from '@/lib/mock-forensic'
import { formatDateTime, formatRelativeTime } from '@/lib/format'

export type ActivitySummaryPeriodDays = 1 | 7 | 30

export const ACTIVITY_SUMMARY_PERIODS: { days: ActivitySummaryPeriodDays; label: string }[] = [
  { days: 1, label: '1 day' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
]

export interface ActivitySummaryInput {
  displayName: string
  /** Used for the 1-day window when available — otherwise last 24 hours. */
  sinceLastLogin: string | null
  periodDays: ActivitySummaryPeriodDays
  incidents: ForensicIncident[]
  cameras: Camera[]
  faceProfiles: FaceProfile[]
  faceSettings: FaceRecognitionSettings
  now?: Date
}

interface PeriodStats {
  total: number
  high: number
  highlights: ForensicIncident[]
}

const severityRank: Record<IncidentSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function resolveSummaryPeriodRange(
  periodDays: ActivitySummaryPeriodDays,
  sinceLastLogin: string | null,
  now: Date,
): { start: Date; end: Date } {
  if (periodDays === 1 && sinceLastLogin) {
    return { start: new Date(sinceLastLogin), end: now }
  }
  return {
    start: new Date(now.getTime() - periodDays * 24 * 3600_000),
    end: now,
  }
}

export function summaryPeriodLabel(
  periodDays: ActivitySummaryPeriodDays,
  sinceLastLogin: string | null,
): string {
  if (periodDays === 1 && sinceLastLogin) {
    return `Since last sign-in (${formatDateTime(sinceLastLogin)})`
  }
  if (periodDays === 1) return 'Last 24 hours (first visit)'
  if (periodDays === 7) return 'Last 7 days'
  return 'Last 30 days'
}

function statsForPeriod(
  incidents: ForensicIncident[],
  rangeStart: Date,
  rangeEnd: Date,
  ctx: Pick<ActivitySummaryInput, 'faceProfiles' | 'faceSettings'>,
): PeriodStats {
  const tier2Ctx = {
    faceProfiles: ctx.faceProfiles,
    faceSettings: ctx.faceSettings,
  }
  const filtered = filterIncidentsInRange(incidents, rangeStart, rangeEnd, null)
    .filter((i) => isNotableIncident(i, tier2Ctx))
    .sort((a, b) => {
      const sev = severityRank[a.severity] - severityRank[b.severity]
      if (sev !== 0) return sev
      return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    })

  return {
    total: filtered.length,
    high: filtered.filter((i) => i.severity === 'high').length,
    highlights: filtered.slice(0, 5),
  }
}

function severityLabel(severity: IncidentSeverity): string {
  if (severity === 'high') return 'Serious'
  if (severity === 'medium') return 'Review'
  return 'Anomaly'
}

function formatPeriodSection(
  title: string,
  stats: PeriodStats,
  emptyText: string,
): string {
  if (stats.total === 0) {
    return `${title}\n${emptyText}`
  }

  const parts = [
    `${stats.total} anomal${stats.total === 1 ? 'y' : 'ies'} or serious alarm${stats.total === 1 ? '' : 's'}`,
    stats.high > 0 ? `${stats.high} high severity` : null,
  ].filter(Boolean)

  const lines = [`${title}`, parts.join(' · ')]
  for (const inc of stats.highlights) {
    lines.push(
      `• [${severityLabel(inc.severity)}] ${inc.title} (${inc.cameraName}, ${formatRelativeTime(inc.occurredAt)})`,
    )
  }
  return lines.join('\n')
}

function emptyTextForPeriod(
  periodDays: ActivitySummaryPeriodDays,
  sinceLastLogin: string | null,
): string {
  if (periodDays === 1 && sinceLastLogin) {
    return 'No anomalies or serious alarms since your last sign-in.'
  }
  if (periodDays === 1) return 'No anomalies or serious alarms in the last 24 hours.'
  if (periodDays === 7) return 'No anomalies or serious alarms in the last 7 days.'
  return 'No anomalies or serious alarms in the last 30 days.'
}

export function buildChatActivitySummary(input: ActivitySummaryInput): string {
  const now = input.now ?? new Date()
  const { start, end } = resolveSummaryPeriodRange(
    input.periodDays,
    input.sinceLastLogin,
    now,
  )

  const offlineCameras = input.cameras.filter((c) => c.status === 'offline')
  const ctx = { faceProfiles: input.faceProfiles, faceSettings: input.faceSettings }
  const stats = statsForPeriod(input.incidents, start, end, ctx)
  const periodTitle = summaryPeriodLabel(input.periodDays, input.sinceLastLogin)

  const sections = [
    `Welcome back, ${input.displayName}.`,
    'Only anomalies and serious alarms are shown.',
    '',
    formatPeriodSection(
      periodTitle,
      stats,
      emptyTextForPeriod(input.periodDays, input.sinceLastLogin),
    ),
  ]

  if (offlineCameras.length > 0) {
    sections.push(
      '',
      `Infrastructure: ${offlineCameras.map((c) => c.name).join(', ')} offline.`,
    )
  }

  sections.push('', 'Ask me to open video, review alarms or check the dashboard.')

  return sections.join('\n')
}
