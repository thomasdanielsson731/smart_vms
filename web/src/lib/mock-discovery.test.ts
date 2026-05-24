import { describe, expect, it, vi } from 'vitest'
import { mockNetworkDiscovery } from './mock-discovery'

describe('mockNetworkDiscovery', () => {
  it('uses VITE_CAMERA_HOSTS when set', () => {
    vi.stubEnv('VITE_CAMERA_HOSTS', '192.168.68.200,192.168.68.201')
    const result = mockNetworkDiscovery([])
    expect(result).toHaveLength(2)
    expect(result[0].host).toBe('192.168.68.200')
    expect(result[1].host).toBe('192.168.68.201')
    vi.unstubAllEnvs()
  })

  it('marks already registered hosts', () => {
    vi.stubEnv('VITE_CAMERA_HOSTS', '192.168.68.200')
    const result = mockNetworkDiscovery(['192.168.68.200'])
    expect(result[0].alreadyRegistered).toBe(true)
    expect(result[0].selected).toBe(false)
    vi.unstubAllEnvs()
  })

  it('falls back to 192.168.68.x demo list without env', () => {
    vi.stubEnv('VITE_CAMERA_HOSTS', '')
    const result = mockNetworkDiscovery([])
    expect(result[0].host).toBe('192.168.68.200')
    expect(result.length).toBeGreaterThan(1)
    vi.unstubAllEnvs()
  })
})
