import { describe, expect, it } from 'vitest'
import { normalizeCameraHost } from './camera-hosts-storage'

describe('normalizeCameraHost', () => {
  it('normalizes leading zeros in octets', () => {
    expect(normalizeCameraHost('192.168.001.200')).toBe('192.168.1.200')
  })

  it('leaves standard IPs unchanged', () => {
    expect(normalizeCameraHost('192.168.68.200')).toBe('192.168.68.200')
  })
})
