import type { ForensicIncident } from '@/types/forensic'

/** Scrub at or above this value shows live stream (right edge of timeline). */
export const LIVE_POSITION_THRESHOLD = 99

export function isTimelineLive(position: number): boolean {
  return position >= LIVE_POSITION_THRESHOLD
}

export function positionFromIncident(
  incident: ForensicIncident,
  rangeStart: Date,
  rangeEnd: Date,
): number {
  const span = rangeEnd.getTime() - rangeStart.getTime()
  if (span <= 0) return LIVE_POSITION_THRESHOLD - 1
  const raw =
    ((new Date(incident.occurredAt).getTime() - rangeStart.getTime()) / span) *
    LIVE_POSITION_THRESHOLD
  return Math.max(0, Math.min(LIVE_POSITION_THRESHOLD - 1, raw))
}

export function timeAtPosition(position: number, rangeStart: Date, rangeEnd: Date): Date {
  const span = rangeEnd.getTime() - rangeStart.getTime()
  const fraction = Math.min(position, LIVE_POSITION_THRESHOLD) / LIVE_POSITION_THRESHOLD
  return new Date(rangeStart.getTime() + span * fraction)
}
