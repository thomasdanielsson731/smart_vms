import fs from 'node:fs'
import path from 'node:path'
import DigestClient from 'digest-fetch'
import type { RecordingStorageSettings } from '../../src/types/storage'
import { resolveVapixCredentials } from '../vapix-config'
import {
  loadCaptureHealth,
  recordCaptureFailure,
  recordCaptureSuccess,
  saveCaptureHealth,
  type CaptureHealthMap,
} from './capture-health'
import {
  loadRecordingStorageSettings,
  saveRecordingStorageSettings,
} from './storage-settings'
import {
  applyRetention,
  computeUsage,
  ensureRecordingDir,
  framesToSegments,
  loadManifest,
  loadServerCameraRegistry,
  recordingRootDir,
  saveManifest,
  saveServerCameraRegistry,
  snapshotRelativePath,
  type RecordingFrameMeta,
  type RecordingSegmentMeta,
  type RecordingUsage,
  type ServerCameraRef,
} from './store'

const CAPTURE_INTERVAL_MS = 30_000
const SNAPSHOT_PATH = '/axis-cgi/jpg/image.cgi?resolution=640x480&camera=1'

async function fetchSnapshotBuffer(client: DigestClient, host: string): Promise<Buffer | null> {
  for (const scheme of ['http', 'https'] as const) {
    try {
      const res = await client.fetch(`${scheme}://${host}${SNAPSHOT_PATH}`, {
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      return Buffer.from(await res.arrayBuffer())
    } catch {
      if (scheme === 'http') continue
    }
  }
  return null
}

export class RecordingService {
  private timer: ReturnType<typeof setInterval> | null = null
  private running = false
  private readonly root: string
  private readonly mode: string
  private readonly cwd: string

  constructor(mode: string, cwd: string) {
    this.mode = mode
    this.cwd = cwd
    this.root = recordingRootDir(mode, cwd)
    ensureRecordingDir(this.root)
  }

  start(): void {
    if (this.running) return
    this.running = true
    void this.captureTick()
    this.timer = setInterval(() => void this.captureTick(), CAPTURE_INTERVAL_MS)
  }

  stop(): void {
    this.running = false
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  syncCameras(cameras: ServerCameraRef[]): void {
    saveServerCameraRegistry(this.root, cameras)
  }

  getCameras(): ServerCameraRef[] {
    return loadServerCameraRegistry(this.root)
  }

  getStorageSettings(): RecordingStorageSettings {
    return loadRecordingStorageSettings(this.root)
  }

  setStorageSettings(settings: RecordingStorageSettings): void {
    saveRecordingStorageSettings(this.root, settings)
  }

  getCaptureHealth(): CaptureHealthMap {
    return loadCaptureHealth(this.root)
  }

  listSegments(from: Date, to: Date, cameraId?: string): RecordingSegmentMeta[] {
    const frames = loadManifest(this.root).filter((f) => {
      const t = new Date(f.capturedAt).getTime()
      if (t < from.getTime() || t > to.getTime()) return false
      if (cameraId && f.cameraId !== cameraId) return false
      return true
    })
    return framesToSegments(frames)
  }

  getUsage(settings?: RecordingStorageSettings): RecordingUsage {
    const resolved = settings ?? loadRecordingStorageSettings(this.root)
    return computeUsage(this.root, loadManifest(this.root), resolved)
  }

  getFramePath(frameId: string): string | null {
    const frame = loadManifest(this.root).find((f) => f.id === frameId)
    if (!frame) return null
    return path.join(this.root, frame.relativePath)
  }

  getNearestFrame(cameraId: string, at: Date): RecordingFrameMeta | null {
    const frames = loadManifest(this.root)
      .filter((f) => f.cameraId === cameraId)
      .sort(
        (a, b) =>
          Math.abs(new Date(a.capturedAt).getTime() - at.getTime()) -
          Math.abs(new Date(b.capturedAt).getTime() - at.getTime()),
      )
    return frames[0] ?? null
  }

  private async captureTick(): Promise<void> {
    const creds = resolveVapixCredentials(this.mode, this.cwd)
    if (!creds.password) return

    const settings = loadRecordingStorageSettings(this.root)
    const manifest = loadManifest(this.root)
    const usage = computeUsage(this.root, manifest, settings)

    if (
      settings.onLimitReached === 'stop_recording' &&
      usage.recordingUsedGiB >= settings.maxRecordingGiB
    ) {
      const retained = applyRetention(this.root, manifest, settings)
      saveManifest(this.root, retained)
      return
    }

    const cameras = loadServerCameraRegistry(this.root).filter((c) => c.recordingEnabled)
    if (cameras.length === 0) return

    const client = new DigestClient(creds.user, creds.password)
    const capturedAt = new Date().toISOString()
    let health = loadCaptureHealth(this.root)

    for (const camera of cameras) {
      const buffer = await fetchSnapshotBuffer(client, camera.host)
      if (!buffer) {
        health = recordCaptureFailure(health, camera.id)
        continue
      }

      const relativePath = snapshotRelativePath(camera.id, capturedAt)
      const abs = path.join(this.root, relativePath)
      fs.mkdirSync(path.dirname(abs), { recursive: true })
      fs.writeFileSync(abs, buffer)
      manifest.push({
        id: `frm-${camera.id}-${Date.now()}`,
        cameraId: camera.id,
        capturedAt,
        bytes: buffer.length,
        relativePath,
      })
      health = recordCaptureSuccess(health, camera.id)
    }

    saveCaptureHealth(this.root, health)
    const retained = applyRetention(this.root, manifest, settings)
    saveManifest(this.root, retained)
  }
}

let singleton: RecordingService | null = null

export function getRecordingService(mode: string, cwd: string): RecordingService {
  if (!singleton) {
    singleton = new RecordingService(mode, cwd)
    singleton.start()
  }
  return singleton
}

function buildUsageSnapshot(
  usage: RecordingUsage,
  settings: RecordingStorageSettings,
): {
  recordingUsedGiB: number
  clipsUsedGiB: number
  recordingPercent: number
  clipsPercent: number
  isOverQuota: boolean
  isWarning: boolean
} {
  const recordingPercent = Math.min(
    100,
    (usage.recordingUsedGiB / settings.maxRecordingGiB) * 100,
  )
  const clipsCap =
    settings.maxClipsGiB > 0 ? settings.maxClipsGiB : settings.maxRecordingGiB * 0.1
  const clipsPercent = Math.min(100, (usage.clipsUsedGiB / clipsCap) * 100)
  return {
    recordingUsedGiB: usage.recordingUsedGiB,
    clipsUsedGiB: usage.clipsUsedGiB,
    recordingPercent,
    clipsPercent,
    isOverQuota: usage.recordingUsedGiB >= settings.maxRecordingGiB,
    isWarning: recordingPercent >= settings.warnAtPercent,
  }
}

export { buildUsageSnapshot }
