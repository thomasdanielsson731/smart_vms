import { describe, expect, it } from 'vitest'
import { canAccessWorkspace, canWriteSettings, roleLabel } from './auth-permissions'
import { WORKSPACE_IDS } from './workspaces'

describe('auth-permissions — admin', () => {
  it('grants access to all workspaces', () => {
    for (const workspace of WORKSPACE_IDS) {
      expect(canAccessWorkspace('admin', workspace)).toBe(true)
    }
  })

  it('can write settings', () => {
    expect(canWriteSettings('admin')).toBe(true)
    expect(roleLabel('admin')).toBe('Administrator')
  })
})

describe('auth-permissions — viewer', () => {
  const viewerAllowed: typeof WORKSPACE_IDS[number][] = [
    'video',
    'dashboard',
    'tracking',
    'agents',
    'forensic',
    'map',
    'faces',
    'settings',
  ]

  it('allows read-only workspaces', () => {
    for (const workspace of viewerAllowed) {
      expect(canAccessWorkspace('viewer', workspace)).toBe(true)
    }
  })

  it('denies admin-only workspaces', () => {
    expect(canAccessWorkspace('viewer', 'config')).toBe(false)
    expect(canAccessWorkspace('viewer', 'onboarding')).toBe(false)
    expect(canAccessWorkspace('viewer', 'camera-web')).toBe(false)
  })

  it('cannot write settings', () => {
    expect(canWriteSettings('viewer')).toBe(false)
    expect(roleLabel('viewer')).toBe('Read-only')
  })
})
