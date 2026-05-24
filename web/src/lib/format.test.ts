import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDateTime, formatRelativeTime } from './format'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-24T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns em dash for null', () => {
    expect(formatRelativeTime(null)).toBe('—')
  })

  it('formats recent times', () => {
    expect(formatRelativeTime('2026-05-24T11:59:30Z')).toBe('just now')
    expect(formatRelativeTime('2026-05-24T11:30:00Z')).toBe('30 min ago')
    expect(formatRelativeTime('2026-05-24T08:00:00Z')).toBe('4 h ago')
    expect(formatRelativeTime('2026-05-22T12:00:00Z')).toBe('2 d ago')
  })
})

describe('formatDateTime', () => {
  it('formats ISO timestamps for display', () => {
    const formatted = formatDateTime('2026-05-24T14:30:00Z')
    expect(formatted).toMatch(/24/)
    expect(formatted).toMatch(/2026/)
  })
})
