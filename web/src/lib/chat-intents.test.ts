import { describe, expect, it, vi, afterEach } from 'vitest'
import { resolveChatIntent } from './chat-intents'

describe('resolveChatIntent — normal workspace routes', () => {
  afterEach(() => vi.unstubAllEnvs())

  it.each([
    ['discover cameras on the network', 'onboarding', undefined],
    ['scan the LAN for Axis cameras', 'onboarding', undefined],
    ['create a new alarm for garage', 'alarms', { mode: 'create' }],
    ['open map view', 'map', undefined],
    ['floor plan map', 'map', undefined],
    ['open dashboard', 'dashboard', undefined],
    ['show statistics for alarms', 'dashboard', undefined],
    ['open tracking', 'tracking', undefined],
    ['list monitoring agents', 'agents', undefined],
    ['open settings', 'settings', undefined],
    ['limit recording storage', 'settings', undefined],
    ['open forensic timeline', 'video', { range: '48h', t: '50' }],
    ['review all alarms from last 48 hours', 'video', { range: '48h', t: '50' }],
  ] as const)('routes "%s" to %s', (input, workspace, params) => {
    const action = resolveChatIntent(input)
    expect(action?.workspace).toBe(workspace)
    if (params) {
      expect(action?.params).toEqual(params)
    }
    expect(action?.reply).toBeTruthy()
  })

  it.each([
    ['show live video from entry', 'cam-entry', '100'],
    ['play live from garden', 'cam-garden', '100'],
    ['show garage camera', 'cam-garage', '100'],
    ['live driveway', 'cam-driveway', '100'],
  ] as const)('routes live video for "%s"', (input, camera, t) => {
    const action = resolveChatIntent(input)
    expect(action?.workspace).toBe('video')
    expect(action?.params?.camera).toBe(camera)
    expect(action?.params?.t).toBe(t)
  })

  it.each([
    ['play driveway clip from yesterday', 'cam-driveway', '40'],
    ['show entry video from last night', 'cam-entry', '40'],
  ] as const)('routes playback for "%s"', (input, camera, t) => {
    const action = resolveChatIntent(input)
    expect(action?.workspace).toBe('video')
    expect(action?.params?.camera).toBe(camera)
    expect(action?.params?.t).toBe(t)
  })

  it.each([
    ['open camera web interface', 'cam-driveway'],
    ['axis web UI', 'cam-driveway'],
    ['kamerans webbgränssnitt', 'cam-driveway'],
  ] as const)('routes camera web for "%s"', (input, camera) => {
    const action = resolveChatIntent(input)
    expect(action?.workspace).toBe('camera-web')
    expect(action?.params?.camera).toBe(camera)
    expect(action?.params?.path).toBe('/')
  })

  it('routes agent listing to agents workspace', () => {
    expect(resolveChatIntent('list monitoring agents')?.workspace).toBe('agents')
  })
})

describe('resolveChatIntent — face recognition', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('returns privacy message when face recognition is disabled', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', '')
    const action = resolveChatIntent('open face recognition')
    expect(action?.workspace).toBeUndefined()
    expect(action?.reply).toMatch(/disabled/)
  })

  it('routes face recognition when enabled', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'true')
    const action = resolveChatIntent('open face recognition')
    expect(action?.workspace).toBe('faces')
    expect(action?.params?.tab).toBe('enroll')
  })

  it('does not route camera web interface to faces', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'true')
    expect(resolveChatIntent('open camera web interface')?.workspace).toBe('camera-web')
  })
})

describe('resolveChatIntent — no match', () => {
  it('returns null for unrelated input', () => {
    expect(resolveChatIntent('what is the weather today')).toBeNull()
    expect(resolveChatIntent('')).toBeNull()
  })

  it('does not route alarm keywords inside onboarding requests', () => {
    expect(resolveChatIntent('onboard cameras and create alarm')?.workspace).toBe('onboarding')
  })
})
