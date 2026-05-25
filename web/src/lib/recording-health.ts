export interface CameraCaptureHealth {
  lastSuccessAt: string | null
  lastFailureAt: string | null
  consecutiveFailures: number
}

export type CaptureHealthMap = Record<string, CameraCaptureHealth>

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
