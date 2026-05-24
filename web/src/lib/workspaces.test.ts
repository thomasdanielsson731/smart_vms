import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WORKSPACE_IDS, isCopilotWorkspaceId, parseWorkspaceId } from './workspaces'

describe('parseWorkspaceId — all normal workspaces', () => {
  afterEach(() => vi.unstubAllEnvs())

  beforeEach(() => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'true')
  })

  it.each(WORKSPACE_IDS)('accepts %s', (id) => {
    const parsed = parseWorkspaceId(id)
    if (id === 'forensic') expect(parsed).toBe('video')
    else if (id === 'onboarding') expect(parsed).toBe('config')
    else expect(parsed).toBe(id)
  })

  it('rejects unknown ids', () => {
    expect(parseWorkspaceId('not-real')).toBeNull()
    expect(parseWorkspaceId('')).toBeNull()
    expect(parseWorkspaceId(null)).toBeNull()
  })

  it('maps legacy alarms workspace to agents', () => {
    expect(parseWorkspaceId('alarms')).toBe('agents')
  })

  it('maps legacy onboarding workspace to config', () => {
    expect(parseWorkspaceId('onboarding')).toBe('config')
  })

  it('rejects faces when feature flag is off', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', '')
    expect(parseWorkspaceId('faces')).toBeNull()
    expect(parseWorkspaceId('video')).toBe('video')
  })
})

describe('isCopilotWorkspaceId', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('mirrors parseWorkspaceId for string ids', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'true')
    expect(isCopilotWorkspaceId('video')).toBe(true)
    expect(isCopilotWorkspaceId('camera-web')).toBe(true)
    expect(isCopilotWorkspaceId('bogus')).toBe(false)
  })
})
