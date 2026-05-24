import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  hostsForScan,
  parseScanSubnet,
  resolveScanSubnet,
  subnetLabelFromIp,
} from './camera-discovery'
import { isAxisDeviceParams, parseAxisParamList } from './camera-proxy-shared'

describe('parseScanSubnet', () => {
  it('expands /24 to 254 hosts', () => {
    const hosts = parseScanSubnet('192.168.68.0/24')
    expect(hosts).toHaveLength(254)
    expect(hosts![0]).toBe('192.168.68.1')
    expect(hosts![253]).toBe('192.168.68.254')
  })

  it('rejects public ranges', () => {
    expect(parseScanSubnet('8.8.8.0/24')).toBeNull()
  })
})

describe('subnetLabelFromIp', () => {
  it('derives /24 from seed IP', () => {
    expect(subnetLabelFromIp('192.168.68.200')).toBe('192.168.68.0/24')
  })
})

describe('resolveScanSubnet', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('returns null without env seed or subnet', () => {
    vi.stubEnv('VITE_CAMERA_HOSTS', '')
    vi.stubEnv('VITE_CAMERA_SUBNET', '')
    expect(resolveScanSubnet('test', process.cwd(), null)).toBeNull()
  })

  it('derives subnet from VITE_CAMERA_HOSTS', () => {
    vi.stubEnv('VITE_CAMERA_HOSTS', '192.168.68.200')
    vi.stubEnv('VITE_CAMERA_SUBNET', '')
    expect(resolveScanSubnet('test', process.cwd(), null)).toBe('192.168.68.0/24')
  })
})

describe('isAxisDeviceParams', () => {
  it('requires AXIS brand or product prefix', () => {
    expect(isAxisDeviceParams({ 'root.Brand.Brand': 'AXIS' })).toBe(true)
    expect(
      isAxisDeviceParams(parseAxisParamList('root.Brand.ProdNbr=AXIS M1065-L\n')),
    ).toBe(true)
    expect(isAxisDeviceParams({ 'root.Brand.Brand': 'Hikvision' })).toBe(false)
  })
})

describe('hostsForScan', () => {
  it('returns empty for bad subnet', () => {
    expect(hostsForScan('invalid')).toEqual([])
  })
})
