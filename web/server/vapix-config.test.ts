import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearVapixCredentials,
  credentialsFilePath,
  getStoredCredentials,
  resolveVapixCredentials,
  saveVapixCredentials,
  vapixConfigPublicView,
} from './vapix-config'

describe('vapix-config', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smartvms-vapix-'))
    clearVapixCredentials(tmpDir)
    fs.writeFileSync(
      path.join(tmpDir, '.env'),
      [
        'SMARTVMS_SESSION_SECRET=stable-test-secret',
        'AXIS_VAPIX_USER=env-user',
        'AXIS_VAPIX_PASSWORD=env-pass',
      ].join('\n'),
    )
  })

  afterEach(() => {
    clearVapixCredentials(tmpDir)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('saves encrypted credentials to disk', () => {
    saveVapixCredentials(tmpDir, 'test', { user: 'root', password: 'cam-secret' })
    const fp = credentialsFilePath(tmpDir)
    expect(fs.existsSync(fp)).toBe(true)
    expect(fs.readFileSync(fp, 'utf8')).not.toContain('cam-secret')
    expect(getStoredCredentials('test', tmpDir)).toEqual({ user: 'root', password: 'cam-secret' })
  })

  it('survives reload with stable encryption secret', async () => {
    saveVapixCredentials(tmpDir, 'test', { user: 'root', password: 'persist-me' })
    vi.resetModules()
    const reloaded = await import('./vapix-config')
    reloaded.initVapixConfig('test', tmpDir)
    expect(reloaded.getStoredCredentials('test', tmpDir)?.password).toBe('persist-me')
  })

  it('falls back to env when no file is stored', () => {
    const resolved = resolveVapixCredentials('test', tmpDir)
    expect(resolved).toMatchObject({
      user: 'env-user',
      password: 'env-pass',
      source: 'env',
    })
  })

  it('prefers stored credentials over env', () => {
    saveVapixCredentials(tmpDir, 'test', { user: 'stored-user', password: 'stored-pass' })
    const resolved = resolveVapixCredentials('test', tmpDir)
    expect(resolved.user).toBe('stored-user')
    expect(resolved.source).toBe('runtime')
  })

  it('reports configured status for public API view', () => {
    saveVapixCredentials(tmpDir, 'test', { user: 'root', password: 'x' })
    const view = vapixConfigPublicView('test', tmpDir)
    expect(view.configured).toBe(true)
    expect(view.user).toBe('root')
  })

  it('rejects save without user or password', () => {
    expect(() => saveVapixCredentials(tmpDir, 'test', { user: '', password: 'x' })).toThrow()
    expect(() => saveVapixCredentials(tmpDir, 'test', { user: 'root', password: '' })).toThrow()
  })
})
