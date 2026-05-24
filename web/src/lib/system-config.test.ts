import { describe, expect, it, vi, afterEach } from 'vitest'
import { buildSystemFeatures, parseConfigurationTab } from './system-config'
import { defaultRecordingStorageSettings } from '@/types/storage'
import { defaultFaceSettings } from '@/lib/face-storage'

describe('parseConfigurationTab', () => {
  it('parses known tabs', () => {
    expect(parseConfigurationTab('overview')).toBe('overview')
    expect(parseConfigurationTab('cameras')).toBe('cameras')
    expect(parseConfigurationTab('onboard')).toBe('onboard')
  })

  it('defaults to overview', () => {
    expect(parseConfigurationTab(undefined)).toBe('overview')
    expect(parseConfigurationTab('invalid')).toBe('overview')
  })
})

describe('buildSystemFeatures', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('reflects env and runtime flags', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'true')
    vi.stubEnv('VITE_CAMERA_STREAM_ENABLED', 'true')
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')

    const features = buildSystemFeatures({
      storageSettings: defaultRecordingStorageSettings(),
      faceSettings: defaultFaceSettings(),
      vapixConfigured: true,
      cameraCount: 2,
      agentCount: 1,
    })

    expect(features.find((f) => f.id === 'vapix')?.enabled).toBe(true)
    expect(features.find((f) => f.id === 'face-recognition')?.enabled).toBe(true)
    expect(features.find((f) => f.id === 'google-maps')?.enabled).toBe(true)
    expect(features.find((f) => f.id === 'cameras')?.description).toContain('2 cameras')
  })
})
