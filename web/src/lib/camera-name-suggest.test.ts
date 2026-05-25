import { describe, expect, it } from 'vitest'
import type { Camera } from '@/types/camera'
import { parseSuggestedCameraName, uniqueCameraName } from './camera-name-suggest'

describe('parseSuggestedCameraName', () => {
  it('takes first line and strips quotes', () => {
    expect(parseSuggestedCameraName('"Front door"\nExtra text')).toBe('Front door')
  })

  it('removes Name: prefix', () => {
    expect(parseSuggestedCameraName('Name: Driveway view')).toBe('Driveway view')
  })

  it('truncates long names', () => {
    const long = 'A'.repeat(80)
    expect(parseSuggestedCameraName(long).length).toBeLessThanOrEqual(48)
  })
})

describe('uniqueCameraName', () => {
  const cameras: Camera[] = [
    {
      id: 'a',
      name: 'Driveway',
      location: '',
      host: '1.1.1.1',
      model: '—',
      firmware: '—',
      status: 'online',
      streamProfile: '',
      recordingEnabled: true,
      lastSeenAt: null,
    },
  ]

  it('returns name when unused', () => {
    expect(uniqueCameraName('Garage', cameras)).toBe('Garage')
  })

  it('dedupes against existing names', () => {
    expect(uniqueCameraName('Driveway', cameras)).toBe('Driveway (2)')
  })

  it('ignores self when renaming', () => {
    expect(uniqueCameraName('Driveway', cameras, 'a')).toBe('Driveway')
  })
})
