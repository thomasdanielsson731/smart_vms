import { describe, expect, it, vi, afterEach } from 'vitest'
import { resolveChatIntent } from './chat-intents'

describe('resolveChatIntent', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('routes onboarding requests', () => {
    expect(resolveChatIntent('discover cameras on the network')?.workspace).toBe('onboarding')
  })

  it('routes alarm creation', () => {
    expect(resolveChatIntent('create a new alarm for garage')?.workspace).toBe('alarms')
  })

  it('routes live video with camera hint', () => {
    const action = resolveChatIntent('show live video from entry')
    expect(action?.workspace).toBe('video')
    expect(action?.params?.camera).toBe('cam-entry')
    expect(action?.params?.t).toBe('100')
  })

  it('routes playback when time hint is present', () => {
    const action = resolveChatIntent('play driveway clip from yesterday')
    expect(action?.params?.t).toBe('40')
  })

  it('routes forensic requests to video timeline', () => {
    expect(resolveChatIntent('open forensic timeline')?.workspace).toBe('video')
  })

  it('returns privacy message when face recognition is disabled', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', '')
    const action = resolveChatIntent('open face recognition')
    expect(action?.workspace).toBeUndefined()
    expect(action?.reply).toMatch(/disabled/)
  })

  it('routes face recognition when enabled', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'true')
    expect(resolveChatIntent('open face recognition')?.workspace).toBe('faces')
  })

  it('does not route "interface" to face recognition', () => {
    expect(resolveChatIntent('open camera web interface')?.workspace).toBe('camera-web')
  })

  it('returns null for unrelated input', () => {
    expect(resolveChatIntent('what is the weather today')).toBeNull()
  })
})
