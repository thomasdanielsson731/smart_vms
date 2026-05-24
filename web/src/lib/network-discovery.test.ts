import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mapDiscoveryHttpError, probeCameraMetadata } from './network-discovery'

describe('mapDiscoveryHttpError', () => {
  it('maps 401 to sign-in message', () => {
    const err = mapDiscoveryHttpError(401, {})
    expect(err.code).toBe('unauthenticated')
    expect(err.message).toMatch(/Sign in/)
  })

  it('maps 503 missing_credentials to VAPIX settings message', () => {
    const err = mapDiscoveryHttpError(503, { error: 'missing_credentials' })
    expect(err.code).toBe('missing_credentials')
    expect(err.message).toMatch(/VAPIX/)
  })

  it('maps 502 to scan_failed', () => {
    const err = mapDiscoveryHttpError(502, { message: 'Proxy error' })
    expect(err.code).toBe('scan_failed')
    expect(err.message).toBe('Proxy error')
  })
})

describe('probeCameraMetadata', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps 401 to auth failed label', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401 }),
    )
    const meta = await probeCameraMetadata('192.168.68.200')
    expect(meta.model).toMatch(/auth failed/i)
  })

  it('maps 503 missing_credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: 'missing_credentials' }),
      }),
    )
    const meta = await probeCameraMetadata('192.168.68.200')
    expect(meta.model).toMatch(/credentials missing/i)
  })

  it('maps network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const meta = await probeCameraMetadata('192.168.68.200')
    expect(meta.model).toMatch(/Unreachable/)
  })
})

describe('discoverCameras', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_CAMERA_HOSTS', '192.168.68.200')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('maps LAN scan results from /api/camera/discover', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          subnet: '192.168.68.0/24',
          scanned: 254,
          devices: [
            {
              host: '192.168.68.200',
              model: 'AXIS M1065-L',
              serial: 'ACCC8E999999',
              firmware: '10.12.89',
            },
            {
              host: '192.168.68.201',
              model: 'AXIS P3245-LVE',
              serial: 'ACCC8E888888',
              firmware: '11.10.91',
            },
          ],
        }),
      }),
    )

    const { discoverCameras } = await import('./network-discovery')
    const result = await discoverCameras([])
    expect(result.devices).toHaveLength(2)
    expect(result.devices[0].model).toBe('AXIS M1065-L')
  })

  it('returns error when scan endpoint fails and uses env fallback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/discover')) {
          return Promise.resolve({
            ok: false,
            status: 503,
            json: async () => ({ error: 'missing_credentials', message: 'no creds' }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            model: 'AXIS M1065-L',
            serial: 'SN',
            firmware: '1.0',
          }),
        })
      }),
    )

    const { discoverCameras } = await import('./network-discovery')
    const result = await discoverCameras([])
    expect(result.devices).toHaveLength(1)
    expect(result.errorCode).toBe('missing_credentials')
  })
})
