import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import type { Camera } from '@/types/camera'
import {
  buildInitialCameras,
  mergeProbeMetadata,
  saveCameraRegistry,
  loadCameraRegistry,
} from './camera-registry-storage'

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => store.clear(),
  })
})

const mockCameras: Camera[] = [
  {
    id: 'cam-a',
    name: 'Driveway',
    location: 'Front',
    host: '192.168.68.200',
    model: '—',
    firmware: '—',
    status: 'online',
    streamProfile: 'Sub',
    recordingEnabled: true,
    lastSeenAt: null,
  },
  {
    id: 'cam-b',
    name: 'Entry',
    location: 'Door',
    host: '192.168.68.201',
    model: '—',
    firmware: '—',
    status: 'online',
    streamProfile: 'Sub',
    recordingEnabled: true,
    lastSeenAt: null,
  },
]

describe('buildInitialCameras', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    store.clear()
  })

  it('creates one camera per VITE_CAMERA_HOSTS entry', () => {
    vi.stubEnv('VITE_CAMERA_HOSTS', '192.168.68.200')
    const cameras = buildInitialCameras()
    expect(cameras).toHaveLength(1)
    expect(cameras[0].host).toBe('192.168.68.200')
  })

  it('returns empty list when no env hosts and no registry', () => {
    vi.unstubAllEnvs()
    vi.stubEnv('VITE_CAMERA_HOSTS', '')
    const cameras = buildInitialCameras()
    expect(cameras).toEqual([])
  })

  it('uses persisted registry when present', () => {
    saveCameraRegistry([
      { ...mockCameras[0], id: 'cam-saved', host: '192.168.68.50', model: 'AXIS M1065-L' },
    ])
    const cameras = buildInitialCameras()
    expect(cameras).toHaveLength(1)
    expect(cameras[0].model).toBe('AXIS M1065-L')
  })
})

describe('mergeProbeMetadata', () => {
  it('updates model and firmware from VAPIX probe', () => {
    const next = mergeProbeMetadata(mockCameras, [
      {
        host: '192.168.68.200',
        model: 'AXIS P3245-LVE',
        serial: 'SN123',
        firmware: '11.10.91',
      },
    ])
    expect(next[0].model).toBe('AXIS P3245-LVE')
    expect(next[0].firmware).toBe('11.10.91')
    expect(next[0].serial).toBe('SN123')
    expect(next[0].lastVapixProbeAt).toBeDefined()
    expect(next[1].model).toBe('—')
  })

  it('ignores failed probe labels', () => {
    const next = mergeProbeMetadata(mockCameras, [
      {
        host: '192.168.68.200',
        model: 'Unreachable — check IP and VAPIX credentials',
        serial: '—',
        firmware: '—',
      },
    ])
    expect(next[0].model).toBe('—')
  })
})

describe('loadCameraRegistry', () => {
  afterEach(() => store.clear())

  it('returns null for empty storage', () => {
    expect(loadCameraRegistry()).toBeNull()
  })
})
