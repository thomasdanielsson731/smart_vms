import { describe, expect, it, vi, afterEach } from 'vitest'
import { parseWorkspaceId } from './workspaces'

describe('parseWorkspaceId', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('accepts known workspace ids', () => {
    expect(parseWorkspaceId('video')).toBe('video')
    expect(parseWorkspaceId('camera-web')).toBe('camera-web')
  })

  it('rejects unknown ids', () => {
    expect(parseWorkspaceId('not-real')).toBeNull()
    expect(parseWorkspaceId(null)).toBeNull()
  })

  it('rejects faces when feature flag is off', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', '')
    expect(parseWorkspaceId('faces')).toBeNull()
  })

  it('accepts faces when feature flag is on', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'true')
    expect(parseWorkspaceId('faces')).toBe('faces')
  })
})
