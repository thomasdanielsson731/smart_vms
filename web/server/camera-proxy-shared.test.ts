import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  isAllowedCameraHost,
  isAxisDeviceParams,
  parseAxisParamList,
  pickDeviceInfo,
  pickPublicDeviceInfo,
  pickStreamProfileLabel,
  prepareCameraWebHtml,
  proxyWebBasePath,
  rewriteCameraAbsoluteUrls,
  rewriteCameraWebHtml,
  rewriteLocationHeader,
  rewriteSetCookieHeader,
} from './camera-proxy-shared'

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures/vapix/param-list.txt',
)

describe('isAllowedCameraHost (SSRF guard)', () => {
  it('allows private LAN ranges', () => {
    expect(isAllowedCameraHost('192.168.1.51')).toBe(true)
    expect(isAllowedCameraHost('10.0.0.5')).toBe(true)
    expect(isAllowedCameraHost('172.16.0.1')).toBe(true)
  })

  it('blocks localhost unless explicitly allowed', () => {
    expect(isAllowedCameraHost('127.0.0.1')).toBe(false)
    expect(isAllowedCameraHost('127.0.0.1', { allowLocalhost: true })).toBe(true)
  })

  it('blocks public and invalid hosts', () => {
    expect(isAllowedCameraHost('8.8.8.8')).toBe(false)
    expect(isAllowedCameraHost('example.com')).toBe(false)
    expect(isAllowedCameraHost('192.168.1')).toBe(false)
    expect(isAllowedCameraHost('192.168.1.999')).toBe(false)
    expect(isAllowedCameraHost('')).toBe(false)
  })
})

describe('camera web URL rewriting', () => {
  const host = '192.168.1.51'
  const base = proxyWebBasePath(host)

  it('rewrites root-relative links in HTML', () => {
    const html = '<a href="/index.html">Home</a>'
    expect(rewriteCameraWebHtml(html, host)).toContain(`href="${base}/index.html"`)
  })

  it('rewrites absolute camera URLs', () => {
    const js = 'fetch("http://192.168.1.51/axis-cgi/param.cgi")'
    const out = rewriteCameraAbsoluteUrls(js, host, base)
    expect(out).toContain(`${base}/axis-cgi/param.cgi`)
    expect(out).not.toContain('http://192.168.1.51')
  })

  it('rewrites HTTPS redirects to proxy path', () => {
    expect(rewriteLocationHeader('https://192.168.1.51/view/index.shtml', host)).toBe(
      `${base}/view/index.shtml`,
    )
  })

  it('rewrites relative Location headers', () => {
    expect(rewriteLocationHeader('/login', host)).toBe(`${base}/login`)
  })

  it('strips cookie domain and scopes path to proxy', () => {
    const cookie = 'session=abc; Domain=192.168.1.51; Path=/'
    expect(rewriteSetCookieHeader(cookie, host)).toContain(`path=${base}/`)
    expect(rewriteSetCookieHeader(cookie, host)).not.toMatch(/domain=/i)
  })

  it('injects base tag and fetch shim into HTML head', () => {
    const html = '<html><head><title>Axis</title></head><body></body></html>'
    const out = prepareCameraWebHtml(html, host)
    expect(out).toContain(`<base href="${base}/">`)
    expect(out).toContain('window.fetch')
  })
})

describe('VAPIX param parsing', () => {
  it('parses param.cgi list format from fixture', () => {
    const text = fs.readFileSync(fixturePath, 'utf8')
    const params = parseAxisParamList(text)
    expect(params['root.Brand.ProdShort']).toBe('M1065-L')
    expect(params['root.Network.eth0.IPAddress']).toBe('192.168.1.51')
  })

  it('maps params to device info fields', () => {
    const params = parseAxisParamList(fs.readFileSync(fixturePath, 'utf8'))
    expect(pickDeviceInfo(params)).toEqual({
      brand: 'AXIS',
      model: 'M1065-L',
      firmware: '10.12.65',
      serial: 'ACCC8E123456',
      ip: '192.168.1.51',
      mac: '00:40:8C:12:34:56',
    })
  })

  it('public device info omits MAC', () => {
    const params = parseAxisParamList(fs.readFileSync(fixturePath, 'utf8'))
    expect(pickPublicDeviceInfo(params)).not.toHaveProperty('mac')
    expect(pickPublicDeviceInfo(params).serial).toBe('ACCC8E123456')
  })

  it('detects Axis devices from param list', () => {
    const params = parseAxisParamList(fs.readFileSync(fixturePath, 'utf8'))
    expect(isAxisDeviceParams(params)).toBe(true)
    expect(isAxisDeviceParams({ 'root.Brand.Brand': 'Other' })).toBe(false)
  })

  it('reads stream profile label when present', () => {
    const params = parseAxisParamList(
      'root.StreamProfile.S0.Name=Sub 640x360\nroot.Properties.Image.Resolution=1920x1080\n',
    )
    expect(pickStreamProfileLabel(params)).toBe('Sub 640x360')
  })
})
