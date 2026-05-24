import { describe, expect, it } from 'vitest'
import { generateAlarmTier2Analysis, isNotableIncident } from './alarm-tier2-analytics'
import type { Incident } from '@/types/incident'

const faceCtx = {
  faceProfiles: [],
  faceSettings: {
    enabled: false,
    minConfidence: 0.7,
    alertOnUnknown: true,
    cameraIds: [],
    consentAcknowledgedAt: null,
  },
}

function incident(partial: Partial<Incident> & Pick<Incident, 'id' | 'title'>): Incident {
  return {
    cameraId: 'cam-driveway',
    cameraName: 'Driveway',
    severity: 'low',
    status: 'open',
    occurredAt: '2026-05-24T10:00:00Z',
    ...partial,
  }
}

describe('isNotableIncident', () => {
  it('treats high severity as notable', () => {
    expect(
      isNotableIncident(
        incident({ id: '1', title: 'Person — garage', severity: 'high', ruleName: 'Night — garage' }),
        faceCtx,
      ),
    ).toBe(true)
  })

  it('treats medium severity as notable (review priority)', () => {
    expect(
      isNotableIncident(
        incident({
          id: '2',
          title: 'Person on driveway',
          severity: 'medium',
          ruleName: 'Zone — driveway night',
        }),
        faceCtx,
      ),
    ).toBe(true)
  })

  it('excludes routine low-severity vehicle alarms', () => {
    expect(
      isNotableIncident(
        incident({
          id: '3',
          title: 'Vehicle at entry',
          severity: 'low',
          ruleName: 'Vehicle — daytime',
        }),
        faceCtx,
      ),
    ).toBe(false)
  })

  it('flags unknown person at night as notable', () => {
    expect(
      isNotableIncident(
        incident({
          id: '4',
          title: 'Person — entry',
          severity: 'low',
          ruleName: 'Night — entry',
          faceMatch: {
            profileId: null,
            displayName: 'Unknown person',
            confidence: 0.8,
            unknown: true,
          },
        }),
        faceCtx,
      ),
    ).toBe(true)
  })
})

describe('generateAlarmTier2Analysis', () => {
  it('returns headline and assessed priority for person alarm', () => {
    const analysis = generateAlarmTier2Analysis(
      incident({
        id: '5',
        title: 'Person on driveway (after quiet hours)',
        severity: 'medium',
        ruleName: 'Zone — driveway night',
      }),
      faceCtx,
    )
    expect(analysis.headline).toBeTruthy()
    expect(analysis.assessedPriority).toBe('review')
    expect(analysis.incidentId).toBe('5')
  })

  it('classifies vehicle incidents as vehicle subject', () => {
    const analysis = generateAlarmTier2Analysis(
      incident({
        id: '6',
        title: 'Vehicle at entry',
        severity: 'low',
        ruleName: 'Vehicle — daytime',
      }),
      faceCtx,
    )
    expect(analysis.subjectType).toBe('vehicle')
    expect(analysis.assessedPriority).toBe('routine')
  })
})
