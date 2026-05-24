import { describe, expect, it } from 'vitest'
import { canAccessWorkspace, canWriteSettings, roleLabel } from './auth-permissions'

describe('auth-permissions', () => {
  it('grants admin full workspace access', () => {
    expect(canAccessWorkspace('admin', 'onboarding')).toBe(true)
    expect(canAccessWorkspace('admin', 'alarms')).toBe(true)
    expect(canAccessWorkspace('admin', 'video')).toBe(true)
  })

  it('restricts viewer from admin-only workspaces', () => {
    expect(canAccessWorkspace('viewer', 'onboarding')).toBe(false)
    expect(canAccessWorkspace('viewer', 'alarms')).toBe(false)
    expect(canAccessWorkspace('viewer', 'video')).toBe(true)
    expect(canAccessWorkspace('viewer', 'forensic')).toBe(true)
  })

  it('allows only admin to write settings', () => {
    expect(canWriteSettings('admin')).toBe(true)
    expect(canWriteSettings('viewer')).toBe(false)
  })

  it('labels roles for UI', () => {
    expect(roleLabel('admin')).toBe('Administrator')
    expect(roleLabel('viewer')).toBe('Read-only')
  })
})
