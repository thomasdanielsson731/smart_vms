import fs from 'node:fs'
import path from 'node:path'
import { loadEnv } from 'vite'

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

export function loadCredentialsFile(cwd: string): VapixCredentials | null {
  try {
    const fp = credentialsFilePath(cwd)
    if (!fs.existsSync(fp)) return null
    const data = JSON.parse(fs.readFileSync(fp, 'utf8')) as VapixCredentials
    if (!data.user?.trim() || !data.password) return null
    return { user: data.user.trim(), password: data.password }
  } catch {
    return null
  }
}

export function saveCredentialsFile(cwd: string, creds: VapixCredentials): void {
  const fp = credentialsFilePath(cwd)
  fs.writeFileSync(fp, JSON.stringify(creds, null, 2), { mode: 0o600 })
}

export function clearCredentialsFile(cwd: string): void {
  const fp = credentialsFilePath(cwd)
  if (fs.existsSync(fp)) fs.unlinkSync(fp)
}

export function initVapixConfig(cwd: string): void {
  runtime = loadCredentialsFile(cwd)
  if (runtime) {
    console.log('[vapix] Gemensamma kameruppgifter laddade från .vapix.credentials.json')
  }
}

export function setRuntimeCredentials(creds: VapixCredentials | null): void {
  runtime = creds
}

export function getStoredCredentials(cwd: string): VapixCredentials | null {
  return runtime ?? loadCredentialsFile(cwd)
}

export function saveVapixCredentials(cwd: string, creds: VapixCredentials): void {
  const normalized = { user: creds.user.trim(), password: creds.password }
  runtime = normalized
  saveCredentialsFile(cwd, normalized)
}

export function clearVapixCredentials(cwd: string): void {
  runtime = null
  clearCredentialsFile(cwd)
}

export function resolveVapixCredentials(
  mode: string,
  cwd: string,
  vapixUserOverride?: string,
): { user: string; password: string; source: VapixCredentialSource } {
  const stored = getStoredCredentials(cwd)
  if (stored?.user && stored.password) {
    return {
      user: vapixUserOverride?.trim() || stored.user,
      password: stored.password,
      source: runtime ? 'runtime' : 'file',
    }
  }

  const env = loadEnv(mode, cwd, '')
  const envUser = (env.AXIS_VAPIX_USER || env.VITE_AXIS_VAPIX_USER || '').trim()
  const envPass = env.AXIS_VAPIX_PASSWORD || env.VITE_AXIS_VAPIX_PASSWORD || ''
  if (envUser && envPass) {
    return {
      user: vapixUserOverride?.trim() || envUser,
      password: envPass,
      source: 'env',
    }
  }

  return {
    user: vapixUserOverride?.trim() || envUser,
    password: envPass,
    source: 'none',
  }
}

export function isVapixConfigured(mode: string, cwd: string): boolean {
  const { user, password, source } = resolveVapixCredentials(mode, cwd)
  return Boolean(user && password && source !== 'none')
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
