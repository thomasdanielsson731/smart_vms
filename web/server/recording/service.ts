import fs from 'node:fs'
import path from 'node:path'
import DigestClient from 'digest-fetch'
import type { RecordingStorageSettings } from '../../src/types/storage'
import { resolveVapixCredentials } from '../vapix-config'
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

  listSegments(from: Date, to: Date, cameraId?: string): RecordingSegmentMeta[] {
    const frames = loadManifest(this.root).filter((f) => {
      const t = new Date(f.capturedAt).getTime()
      if (t < from.getTime() || t > to.getTime()) return false
      if (cameraId && f.cameraId !== cameraId) return false
      return true
    })
    return framesToSegments(frames)
  }

  getUsage(settings: RecordingStorageSettings): RecordingUsage {
    void settings
    return computeUsage(this.root, loadManifest(this.root))
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

    const cameras = loadServerCameraRegistry(this.root).filter((c) => c.recordingEnabled)
    if (cameras.length === 0) return

    const client = new DigestClient(creds.user, creds.password)
    const manifest = loadManifest(this.root)
    const capturedAt = new Date().toISOString()

    for (const camera of cameras) {
      try {
        const url = `http://${camera.host}/axis-cgi/jpg/image.cgi?resolution=640x480&camera=1`
        const res = await client.fetch(url, { signal: AbortSignal.timeout(8000) })
        if (!res.ok) continue
        const buffer = Buffer.from(await res.arrayBuffer())
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
      } catch {
        /* camera offline — skip frame */
      }
    }

    const settings = defaultSettings()
    const retained = applyRetention(this.root, manifest, settings)
    saveManifest(this.root, retained)
  }
}

function defaultSettings(): RecordingStorageSettings {
  return {
    maxRecordingGiB: 100,
    maxClipsGiB: 50,
    maxRetentionDays: 30,
    warnAtPercent: 85,
    onLimitReached: 'delete_oldest',
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
