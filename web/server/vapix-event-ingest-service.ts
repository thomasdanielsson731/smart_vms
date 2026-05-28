import { loadEnv } from 'vite'
import DigestClient from 'digest-fetch'
import { recordingRootDir, loadServerCameraRegistry, type ServerCameraRef } from './recording/store'
import { resolveVapixCredentials } from './vapix-config'
import { axisEventToSmartVmsEvent, vapixEventKey, type SmartVmsEventPayload } from './vapix-event-normalize'
import { pollAxisRecentEvents, streamAxisLiveEvents } from './vapix-live-stream'
import type { ParsedAxisEvent } from './recorded-events'

export type VapixListenerMode = 'stream' | 'poll' | 'stopped'

export interface VapixCameraListenerStatus {
  cameraId: string
  cameraName: string
  host: string
  mode: VapixListenerMode
  connected: boolean
  lastEventAt: string | null
  lastError: string | null
  ingestedTotal: number
}

export interface VapixEventIngestStatus {
  enabled: boolean
  serverUrl: string | null
  serverReachable: boolean
  ingestedTotal: number
  droppedDuplicates: number
  ingestErrors: number
  lastIngestAt: string | null
  cameras: VapixCameraListenerStatus[]
}

const DEDUPE_MS_DEFAULT = 5000
const POLL_INTERVAL_MS = 15_000
const RECONNECT_DELAY_MS = 5000

class CameraEventListener {
  readonly status: VapixCameraListenerStatus
  private abort: AbortController | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private running = false
  private readonly dedupeMs: number
  private readonly recentKeys = new Map<string, number>()

  constructor(
    camera: ServerCameraRef,
    private readonly client: DigestClient,
    private readonly onNormalized: (event: SmartVmsEventPayload) => Promise<void>,
    dedupeMs: number,
  ) {
    this.dedupeMs = dedupeMs
    this.status = {
      cameraId: camera.id,
      cameraName: camera.name,
      host: camera.host,
      mode: 'stopped',
      connected: false,
      lastEventAt: null,
      lastError: null,
      ingestedTotal: 0,
    }
  }

  start(): void {
    if (this.running) return
    this.running = true
    void this.runLoop()
  }

  stop(): void {
    this.running = false
    this.status.mode = 'stopped'
    this.status.connected = false
    this.abort?.abort()
    this.abort = null
    if (this.pollTimer) clearInterval(this.pollTimer)
    this.pollTimer = null
  }

  private rememberKey(key: string, now: number): boolean {
    const prev = this.recentKeys.get(key)
    if (prev != null && now - prev < this.dedupeMs) return false
    this.recentKeys.set(key, now)
    for (const [k, ts] of this.recentKeys) {
      if (now - ts > this.dedupeMs * 2) this.recentKeys.delete(k)
    }
    return true
  }

  private async emit(event: ParsedAxisEvent): Promise<void> {
    const key = vapixEventKey(this.status.cameraId, event.topic, event.occurredAt)
    const now = Date.now()
    if (!this.rememberKey(key, now)) return

    const payload = axisEventToSmartVmsEvent(event, {
      id: this.status.cameraId,
      name: this.status.cameraName,
    })
    await this.onNormalized(payload)
    this.status.ingestedTotal += 1
    this.status.lastEventAt = payload.occurred_at
    this.status.lastError = null
  }

  private async runLoop(): Promise<void> {
    while (this.running) {
      this.abort = new AbortController()
      this.status.mode = 'stream'
      this.status.connected = true
      const result = await streamAxisLiveEvents(
        this.client,
        this.status.host,
        (event) => {
          void this.emit(event).catch((err) => {
            this.status.lastError = err instanceof Error ? err.message : 'ingest_failed'
          })
        },
        this.abort.signal,
      )

      if (!this.running) break

      if (result === 'failed') {
        this.status.mode = 'poll'
        this.status.lastError = 'Live stream unavailable — polling recent events'
        await this.pollOnce()
        this.pollTimer = setInterval(() => {
          void this.pollOnce()
        }, POLL_INTERVAL_MS)
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS * 4))
        if (this.pollTimer) clearInterval(this.pollTimer)
        this.pollTimer = null
      }

      if (!this.running) break
      await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS))
    }
  }

  private async pollOnce(): Promise<void> {
    try {
      const events = await pollAxisRecentEvents(this.client, this.status.host)
      for (const event of events) {
        await this.emit(event)
      }
      this.status.connected = true
    } catch (err) {
      this.status.connected = false
      this.status.lastError = err instanceof Error ? err.message : 'poll_failed'
    }
  }
}

export class VapixEventIngestService {
  private listeners = new Map<string, CameraEventListener>()
  private readonly mode: string
  private readonly cwd: string
  private readonly dedupeMs: number
  private ingestedTotal = 0
  private droppedDuplicates = 0
  private ingestErrors = 0
  private lastIngestAt: string | null = null
  private serverReachable = false
  private enabled: boolean
  private running = false

  constructor(mode: string, cwd: string) {
    this.mode = mode
    this.cwd = cwd
    const env = loadEnv(mode, cwd, '')
    this.dedupeMs = Number(env.SMARTVMS_VAPIX_EVENT_DEDUPE_MS ?? DEDUPE_MS_DEFAULT)
    this.enabled = env.SMARTVMS_VAPIX_EVENTS_ENABLED !== 'false'
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.syncFromRegistry()
    setInterval(() => this.syncFromRegistry(), 60_000)
  }

  stop(): void {
    this.running = false
    for (const listener of this.listeners.values()) listener.stop()
    this.listeners.clear()
  }

  syncCameras(cameras: ServerCameraRef[]): void {
    const creds = resolveVapixCredentials(this.mode, this.cwd)
    if (!creds) return

    const client = new DigestClient(creds.user, creds.password)
    const nextIds = new Set<string>()

    for (const camera of cameras) {
      if (!camera.host) continue
      nextIds.add(camera.id)
      let listener = this.listeners.get(camera.id)
      if (!listener) {
        listener = new CameraEventListener(
          camera,
          client,
          (event) => this.ingest(event),
          this.dedupeMs,
        )
        this.listeners.set(camera.id, listener)
        if (this.running && this.enabled) listener.start()
      } else if (listener.status.host !== camera.host || listener.status.cameraName !== camera.name) {
        listener.stop()
        listener = new CameraEventListener(
          camera,
          client,
          (event) => this.ingest(event),
          this.dedupeMs,
        )
        this.listeners.set(camera.id, listener)
        if (this.running && this.enabled) listener.start()
      } else {
        listener.status.cameraName = camera.name
      }
    }

    for (const [id, listener] of this.listeners) {
      if (!nextIds.has(id)) {
        listener.stop()
        this.listeners.delete(id)
      }
    }
  }

  syncFromRegistry(): void {
    const root = recordingRootDir(this.mode, this.cwd)
    this.syncCameras(loadServerCameraRegistry(root))
  }

  private serverUrl(): string | null {
    const env = loadEnv(this.mode, this.cwd, '')
    return env.SMARTVMS_SERVER_URL ?? 'http://127.0.0.1:8787'
  }

  private async ingest(event: SmartVmsEventPayload): Promise<void> {
    if (!this.enabled) return
    const url = this.serverUrl()
    if (!url) return

    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/api/events/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        signal: AbortSignal.timeout(8000),
      })
      this.serverReachable = res.ok || res.status === 202
      if (!res.ok) {
        this.ingestErrors += 1
        return
      }
      this.ingestedTotal += 1
      this.lastIngestAt = new Date().toISOString()
    } catch {
      this.serverReachable = false
      this.ingestErrors += 1
    }
  }

  getStatus(): VapixEventIngestStatus {
    return {
      enabled: this.enabled,
      serverUrl: this.serverUrl(),
      serverReachable: this.serverReachable,
      ingestedTotal: this.ingestedTotal,
      droppedDuplicates: this.droppedDuplicates,
      ingestErrors: this.ingestErrors,
      lastIngestAt: this.lastIngestAt,
      cameras: [...this.listeners.values()].map((l) => l.status),
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) {
      for (const listener of this.listeners.values()) listener.stop()
      return
    }
    this.syncFromRegistry()
    for (const listener of this.listeners.values()) listener.start()
  }
}

let singleton: VapixEventIngestService | null = null

export function getVapixEventIngestService(mode: string, cwd: string): VapixEventIngestService {
  if (!singleton) {
    singleton = new VapixEventIngestService(mode, cwd)
    singleton.start()
  }
  return singleton
}
