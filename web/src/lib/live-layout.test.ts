import { describe, expect, it } from 'vitest'
import { parseLiveLayout } from '@/components/camera/LiveLayoutToggle'

describe('parseLiveLayout', () => {
  it('defaults to single camera layout', () => {
    expect(parseLiveLayout(undefined)).toBe('single')
    expect(parseLiveLayout(null)).toBe('single')
    expect(parseLiveLayout('')).toBe('single')
    expect(parseLiveLayout('single')).toBe('single')
  })

  it('selects grid when param is grid', () => {
    expect(parseLiveLayout('grid')).toBe('grid')
  })
})
