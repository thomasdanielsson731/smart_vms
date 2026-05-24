import { afterEach, describe, expect, it, vi } from 'vitest'
import { isFaceRecognitionEnabled } from './feature-flags'

describe('feature-flags', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('disables face recognition by default', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', '')
    expect(isFaceRecognitionEnabled()).toBe(false)
  })

  it('enables face recognition when env is true', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'true')
    expect(isFaceRecognitionEnabled()).toBe(true)
  })

  it('treats any other value as disabled', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'false')
    expect(isFaceRecognitionEnabled()).toBe(false)
  })
})
