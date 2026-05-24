import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadLastLoginAt, saveLastLoginAt } from './last-login-storage'

describe('last-login-storage', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => store.clear(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns null when user has no saved login', () => {
    expect(loadLastLoginAt('admin')).toBeNull()
  })

  it('saves and loads login timestamp per user', () => {
    saveLastLoginAt('admin', '2026-05-24T10:00:00.000Z')
    expect(loadLastLoginAt('admin')).toBe('2026-05-24T10:00:00.000Z')
  })

  it('returns previous login when saving a new one', () => {
    saveLastLoginAt('admin', '2026-05-23T08:00:00.000Z')
    const previous = saveLastLoginAt('admin', '2026-05-24T10:00:00.000Z')
    expect(previous).toBe('2026-05-23T08:00:00.000Z')
    expect(loadLastLoginAt('admin')).toBe('2026-05-24T10:00:00.000Z')
  })

  it('isolates timestamps between users', () => {
    saveLastLoginAt('admin', '2026-05-24T10:00:00.000Z')
    saveLastLoginAt('viewer', '2026-05-24T11:00:00.000Z')
    expect(loadLastLoginAt('admin')).toBe('2026-05-24T10:00:00.000Z')
    expect(loadLastLoginAt('viewer')).toBe('2026-05-24T11:00:00.000Z')
  })
})
