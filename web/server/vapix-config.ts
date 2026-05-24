import fs from 'node:fs'
import path from 'node:path'
import { loadEnv } from 'vite'
import {
  decryptSecretPayload,
  encryptSecretPayload,
  readLegacyPlainJson,
  removeSecretFile,
  writeSecretFile,
  type StoredSecretPayload,
} from './credential-store'

export interface VapixCredentials {
  user: string
  password: string
}

export type VapixCredentialSource = 'runtime' | 'file' | 'env' | 'none'

const FILENAME = '.vapix.credentials.json'

let runtime: VapixCredentials | null = null

export function credentialsFilePath(cwd: string): string {
  return path.join(cwd, FILENAME)
}

/** Stable key for encrypting stored VAPIX credentials — not the per-boot random session secret. */
function encryptionSecret(mode: string, cwd: string): string {
  const env = loadEnv(mode, cwd, '')
  return (
    env.SMARTVMS_VAPIX_ENCRYPTION_SECRET ||
    env.SMARTVMS_SESSION_SECRET ||
    env.VITE_SMARTVMS_SESSION_SECRET ||
    'smartvms-dev-vapix-encryption-v1'
  )
}

function loadFromFile(mode: string, cwd: string): VapixCredentials | null {
  const fp = credentialsFilePath(cwd)
  if (!fs.existsSync(fp)) return null
  const raw = fs.readFileSync(fp, 'utf8')
  const secret = encryptionSecret(mode, cwd)

  const decrypted = decryptSecretPayload(raw, secret)
  if (decrypted) {
    return { user: decrypted.user, password: decrypted.password }
  }

  const legacy = readLegacyPlainJson(raw)
  if (legacy) {
    saveVapixCredentials(cwd, mode, { user: legacy.user, password: legacy.password })
    return { user: legacy.user, password: legacy.password }
  }

  return null
}

export function initVapixConfig(mode: string, cwd: string): void {
  runtime = loadFromFile(mode, cwd)
  if (runtime) {
    console.log('[vapix] Gemensamma kameruppgifter laddade (krypterad lagring)')
  }
}

export function getStoredCredentials(mode: string, cwd: string): VapixCredentials | null {
  return runtime ?? loadFromFile(mode, cwd)
}

export function saveVapixCredentials(
  cwd: string,
  mode: string,
  creds: VapixCredentials,
): void {
  const normalized: StoredSecretPayload = {
    user: creds.user.trim(),
    password: creds.password,
  }
  if (!normalized.user || !normalized.password) {
    throw new Error('VAPIX-användare och lösenord krävs')
  }

  const secret = encryptionSecret(mode, cwd)
  const encrypted = encryptSecretPayload(normalized, secret)
  writeSecretFile(credentialsFilePath(cwd), encrypted)
  runtime = normalized
}

export function clearVapixCredentials(cwd: string): void {
  runtime = null
  removeSecretFile(credentialsFilePath(cwd))
}

export function resolveVapixCredentials(
  mode: string,
  cwd: string,
  vapixUserOverride?: string,
): { user: string; password: string; source: VapixCredentialSource } {
  const stored = getStoredCredentials(mode, cwd)
  if (stored?.user && stored.password) {
    return {
      user: stored.user,
      password: stored.password,
      source: runtime ? 'runtime' : 'file',
    }
  }

  const env = loadEnv(mode, cwd, '')
  const envUser = (env.AXIS_VAPIX_USER || env.VITE_AXIS_VAPIX_USER || '').trim()
  const envPass = env.AXIS_VAPIX_PASSWORD || env.VITE_AXIS_VAPIX_PASSWORD || ''
  if (envUser && envPass) {
    return {
      user: envUser,
      password: envPass,
      source: 'env',
    }
  }

  // Per-camera override only when no shared credentials are configured
  if (vapixUserOverride?.trim()) {
    return {
      user: vapixUserOverride.trim(),
      password: envPass,
      source: 'none',
    }
  }

  return {
    user: envUser,
    password: envPass,
    source: 'none',
  }
}

export function vapixConfigPublicView(
  mode: string,
  cwd: string,
): { user: string; configured: boolean; source: VapixCredentialSource } {
  const { user, password, source } = resolveVapixCredentials(mode, cwd)
  return {
    user,
    configured: Boolean(user && password),
    source: password ? source : 'none',
  }
}
