import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  decryptSecretPayload,
  encryptSecretPayload,
  readLegacyPlainJson,
  removeSecretFile,
  writeSecretFile,
} from './credential-store'

describe('credential-store', () => {
  const secret = 'test-encryption-secret'
  const payload = { user: 'root', password: 'camera-pass-123' }

  it('round-trips encrypt and decrypt', () => {
    const encrypted = encryptSecretPayload(payload, secret)
    expect(encrypted).not.toContain('camera-pass')
    expect(decryptSecretPayload(encrypted, secret)).toEqual(payload)
  })

  it('returns null when decryption secret is wrong', () => {
    const encrypted = encryptSecretPayload(payload, secret)
    expect(decryptSecretPayload(encrypted, 'wrong-secret')).toBeNull()
  })

  it('returns null for tampered ciphertext', () => {
    const encrypted = encryptSecretPayload(payload, secret)
    const tampered = encrypted.replace(/.$/, encrypted.endsWith('a') ? 'b' : 'a')
    expect(decryptSecretPayload(tampered, secret)).toBeNull()
  })

  it('reads legacy plain JSON credentials', () => {
    const raw = JSON.stringify({ user: ' root ', password: 'legacy' })
    expect(readLegacyPlainJson(raw)).toEqual({ user: 'root', password: 'legacy' })
  })

  it('rejects legacy JSON without password', () => {
    expect(readLegacyPlainJson(JSON.stringify({ user: 'root' }))).toBeNull()
  })

  it('writes secret file with restricted permissions when supported', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'smartvms-cred-'))
    const filePath = path.join(dir, '.vapix.credentials.json')
    writeSecretFile(filePath, '{"v":1}')
    expect(fs.existsSync(filePath)).toBe(true)
    removeSecretFile(filePath)
    expect(fs.existsSync(filePath)).toBe(false)
    fs.rmSync(dir, { recursive: true })
  })
})
