import fs from 'node:fs'
import path from 'node:path'
import { ensureRecordingDir } from './store'

const HEALTH_FILE = 'capture-health.json'

export interface CameraCaptureHealth {
  lastSuccessAt: string | null
  lastFailureAt: string | null
  consecutiveFailures: number
}

export type CaptureHealthMap = Record<string, CameraCaptureHealth>

function emptyHealth(): CameraCaptureHealth {
  return { lastSuccessAt: null, lastFailureAt: null, consecutiveFailures: 0 }
}

export function loadCaptureHealth(root: string): CaptureHealthMap {
  try {
    const raw = fs.readFileSync(path.join(root, HEALTH_FILE), 'utf8')
    const parsed = JSON.parse(raw) as CaptureHealthMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveCaptureHealth(root: string, health: CaptureHealthMap): void {
  ensureRecordingDir(root)
  fs.writeFileSync(path.join(root, HEALTH_FILE), JSON.stringify(health, null, 2), 'utf8')
}

export function recordCaptureSuccess(health: CaptureHealthMap, cameraId: string): CaptureHealthMap {
  const prev = health[cameraId] ?? emptyHealth()
  return {
    ...health,
    [cameraId]: {
      lastSuccessAt: new Date().toISOString(),
      lastFailureAt: prev.lastFailureAt,
      consecutiveFailures: 0,
    },
  }
}

export function recordCaptureFailure(health: CaptureHealthMap, cameraId: string): CaptureHealthMap {
  const prev = health[cameraId] ?? emptyHealth()
  return {
    ...health,
    [cameraId]: {
      lastSuccessAt: prev.lastSuccessAt,
      lastFailureAt: new Date().toISOString(),
      consecutiveFailures: prev.consecutiveFailures + 1,
    },
  }
}

/** Map capture health to camera status for UI. */
export function healthToCameraStatus(
  health: CameraCaptureHealth | undefined,
  recordingEnabled: boolean,
): 'online' | 'offline' | 'degraded' | 'unknown' {
  if (!recordingEnabled) return 'unknown'
  if (!health) return 'unknown'
  if (health.consecutiveFailures >= 2) return 'offline'
  if (health.consecutiveFailures === 1) return 'degraded'
  if (health.lastSuccessAt) return 'online'
  return 'unknown'
}
