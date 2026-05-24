import { describe, expect, it } from 'vitest'
import { streamTestMessage } from './camera-stream-test'
import { cameraDirectWebUrl, cameraProxiedWebUrl } from './camera-web'

describe('streamTestMessage', () => {
  it('returns null for successful tests', () => {
    expect(streamTestMessage({ ok: true, code: 'ok', message: '', host: '192.168.1.51' })).toBeNull()
  })

  it('maps missing credentials to actionable guidance', () => {
    const msg = streamTestMessage({
      ok: false,
      code: 'missing_credentials',
      message: '',
      host: '192.168.1.51',
    })
    expect(msg).toContain('Settings')
    expect(msg).toContain('AXIS_VAPIX_USER')
  })

  it('maps auth failures to credential hint', () => {
    const msg = streamTestMessage({
      ok: false,
      code: 'auth_failed',
      message: '',
      host: '192.168.1.51',
    })
    expect(msg).toContain('rejected')
  })
})

describe('camera-web URLs', () => {
  const host = '192.168.1.51'

  it('builds direct camera URL', () => {
    expect(cameraDirectWebUrl(host, '/view/index.shtml')).toBe(
      'http://192.168.1.51/view/index.shtml',
    )
  })

  it('builds proxied URL for iframe embedding', () => {
    expect(cameraProxiedWebUrl(host)).toBe('/api/camera/192.168.1.51/web')
    expect(cameraProxiedWebUrl(host, '/index.html')).toBe(
      '/api/camera/192.168.1.51/web/index.html',
    )
  })
})
