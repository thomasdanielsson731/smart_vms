import { describe, expect, it } from 'vitest'
import { centerOfPoints, placedCameraPoints } from './geo'
import type { CameraMapPlacement } from '@/types/map'

describe('placedCameraPoints', () => {
  const placements: Record<string, CameraMapPlacement> = {
    a: { cameraId: 'a', lat: 59.33, lng: 18.06, heading: 0, fovDeg: 70, rangeM: 20, viewLabel: '' },
    b: { cameraId: 'b', lat: 59.34, lng: 18.07, heading: 0, fovDeg: 70, rangeM: 20, viewLabel: '' },
  }

  it('returns only placed cameras', () => {
    expect(placedCameraPoints(placements, ['a', 'b', 'c'])).toEqual([
      { lat: 59.33, lng: 18.06 },
      { lat: 59.34, lng: 18.07 },
    ])
  })
})

describe('centerOfPoints', () => {
  it('returns single point unchanged', () => {
    expect(centerOfPoints([{ lat: 1, lng: 2 }])).toEqual({ lat: 1, lng: 2 })
  })

  it('averages multiple points', () => {
    expect(centerOfPoints([
      { lat: 0, lng: 0 },
      { lat: 2, lng: 4 },
    ])).toEqual({ lat: 1, lng: 2 })
  })
})
