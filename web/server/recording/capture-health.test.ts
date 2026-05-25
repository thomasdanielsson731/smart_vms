import { describe, expect, it } from 'vitest'
import { healthToCameraStatus, recordCaptureFailure, recordCaptureSuccess } from './capture-health'

describe('capture health', () => {
  it('marks offline after two consecutive failures', () => {
    let health = recordCaptureFailure({}, 'cam-1')
    expect(healthToCameraStatus(health['cam-1'], true)).toBe('degraded')
    health = recordCaptureFailure(health, 'cam-1')
    expect(healthToCameraStatus(health['cam-1'], true)).toBe('offline')
  })

  it('resets to online on success', () => {
    let health = recordCaptureFailure(recordCaptureFailure({}, 'cam-1'), 'cam-1')
    health = recordCaptureSuccess(health, 'cam-1')
    expect(healthToCameraStatus(health['cam-1'], true)).toBe('online')
  })
})
