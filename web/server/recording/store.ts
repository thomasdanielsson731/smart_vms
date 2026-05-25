import fs from 'node:fs'
import path from 'node:path'
import type { RecordingStorageSettings } from '../../src/types/storage'

export interface ServerCameraRef {
  id: string
  name: string
  host: string
  recordingEnabled: boolean
}

export interface RecordingFrameMeta {
  id: string
  cameraId: string
  capturedAt: string
  bytes: number
  relativePath: string
}

export interface RecordingSegmentMeta {
  id: string
  cameraId: string
  startAt: string
  endAt: string
  frameCount: number
}

export interface RecordingUsage {
  recordingUsedGiB: number
  clipsUsedGiB: number
  frameCount: number
}

const REGISTRY_FILE = 'camera-registry.json'
const MANIFEST_FILE = 'manifest.json'

export function recordingRootDir(_mode: string, cwd: string): string {
  const env = process.env.SMARTVMS_RECORDING_DIR
  if (env) return path.resolve(env)
  return path.join(cwd, 'recordings')
}

export function ensureRecordingDir(root: string): void {
  fs.mkdirSync(root, { recursive: true })
}

export function registryPath(root: string): string {
  return path.join(root, REGISTRY_FILE)
}

export function manifestPath(root: string): string {
  return path.join(root, MANIFEST_FILE)
}

export function loadServerCameraRegistry(root: string): ServerCameraRef[] {
  try {
    const raw = fs.readFileSync(registryPath(root), 'utf8')
    const parsed = JSON.parse(raw) as ServerCameraRef[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveServerCameraRegistry(root: string, cameras: ServerCameraRef[]): void {
  ensureRecordingDir(root)
  fs.writeFileSync(registryPath(root), JSON.stringify(cameras, null, 2), 'utf8')
}

export function loadManifest(root: string): RecordingFrameMeta[] {
  try {
    const raw = fs.readFileSync(manifestPath(root), 'utf8')
    const parsed = JSON.parse(raw) as RecordingFrameMeta[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveManifest(root: string, frames: RecordingFrameMeta[]): void {
  ensureRecordingDir(root)
  fs.writeFileSync(manifestPath(root), JSON.stringify(frames, null, 2), 'utf8')
}

export function framesToSegments(frames: RecordingFrameMeta[]): RecordingSegmentMeta[] {
  if (frames.length === 0) return []

  const sorted = [...frames].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  )

  const gapMs = 5 * 60_000
  const segments: RecordingSegmentMeta[] = []
  let group: RecordingFrameMeta[] = [sorted[0]!]

  const flush = () => {
    if (group.length === 0) return
    const first = group[0]!
    const last = group[group.length - 1]!
    segments.push({
      id: `seg-${first.cameraId}-${new Date(first.capturedAt).getTime()}`,
      cameraId: first.cameraId,
      startAt: first.capturedAt,
      endAt: last.capturedAt,
      frameCount: group.length,
    })
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!
    const cur = sorted[i]!
    const delta = new Date(cur.capturedAt).getTime() - new Date(prev.capturedAt).getTime()
    if (delta > gapMs || cur.cameraId !== prev.cameraId) {
      flush()
      group = [cur]
    } else {
      group.push(cur)
    }
  }
  flush()
  return segments
}

export function computeUsage(
  _root: string,
  frames: RecordingFrameMeta[],
  _settings?: RecordingStorageSettings,
): RecordingUsage {
  void _settings
  let bytes = 0
  for (const frame of frames) {
    bytes += frame.bytes
  }
  return {
    recordingUsedGiB: bytes / 1024 ** 3,
    clipsUsedGiB: 0,
    frameCount: frames.length,
  }
}

export function applyRetention(
  root: string,
  frames: RecordingFrameMeta[],
  settings: RecordingStorageSettings,
): RecordingFrameMeta[] {
  const maxBytes = settings.maxRecordingGiB * 1024 ** 3
  const minTime =
    Date.now() - settings.maxRetentionDays * 24 * 3600_000

  let kept = frames.filter((f) => new Date(f.capturedAt).getTime() >= minTime)

  kept.sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())

  let total = kept.reduce((sum, f) => sum + f.bytes, 0)
  while (total > maxBytes && kept.length > 0) {
    const removed = kept.shift()!
    total -= removed.bytes
    try {
      fs.unlinkSync(path.join(root, removed.relativePath))
    } catch {
      /* already gone */
    }
  }

  if (settings.onLimitReached === 'stop_recording' && total >= maxBytes) {
    return kept
  }

  return kept
}

export function snapshotRelativePath(cameraId: string, capturedAt: string): string {
  const day = capturedAt.slice(0, 10)
  const file = capturedAt.replace(/[:.]/g, '-')
  return path.join(cameraId, day, `${file}.jpg`)
}
