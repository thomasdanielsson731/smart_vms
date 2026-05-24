import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export interface StoredSecretPayload {
  user: string
  password: string
}

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(`smartvms:${secret}`).digest()
}

export function encryptSecretPayload(
  payload: StoredSecretPayload,
  secret: string,
): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret), iv)
  const plaintext = JSON.stringify(payload)
  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return JSON.stringify({
    v: 1,
    iv: iv.toString('base64url'),
    tag: tag.toString('base64url'),
    data: data.toString('base64url'),
  })
}

export function decryptSecretPayload(
  raw: string,
  secret: string,
): StoredSecretPayload | null {
  try {
    const envelope = JSON.parse(raw) as {
      v: number
      iv: string
      tag: string
      data: string
    }
    if (envelope.v !== 1) return null
    const decipher = createDecipheriv(
      'aes-256-gcm',
      deriveKey(secret),
      Buffer.from(envelope.iv, 'base64url'),
    )
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url'))
    const plain = Buffer.concat([
      decipher.update(Buffer.from(envelope.data, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
    const parsed = JSON.parse(plain) as StoredSecretPayload
    if (!parsed.user?.trim() || !parsed.password) return null
    return { user: parsed.user.trim(), password: parsed.password }
  } catch {
    return null
  }
}

/** Läser legacy okrypterad JSON och migrerar vid behov. */
export function readLegacyPlainJson(raw: string): StoredSecretPayload | null {
  try {
    const data = JSON.parse(raw) as StoredSecretPayload
    if (!data.user?.trim() || !data.password) return null
    return { user: data.user.trim(), password: data.password }
  } catch {
    return null
  }
}

export function writeSecretFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8', mode: 0o600 })
  } catch {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' })
  }
}

export function removeSecretFile(filePath: string): void {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}
