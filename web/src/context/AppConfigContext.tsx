import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { mockCameras } from '@/lib/mock-data'
import {
  applyCameraHostOverrides,
  loadCameraHostOverrides,
  mergeCameraHostOverride,
  saveCameraHostOverrides,
} from '@/lib/camera-hosts-storage'
import { mockMonitoringAgents } from '@/lib/mock-agents'
import { mockNetworkDiscovery } from '@/lib/mock-discovery'
import type { Camera } from '@/types/camera'
import type { MonitoringAgent } from '@/types/agent'
import type { AlarmDefinition, AlarmDraft } from '@/types/alarm'
import type { DiscoveredCamera, OnboardingBatch, DiscoveryStatus } from '@/types/onboarding'
import {
  defaultRecordingStorageSettings,
  type RecordingStorageSettings,
  type StorageUsageSnapshot,
} from '@/types/storage'
import {
  loadStorageSettings,
  mockStorageUsage,
  saveStorageSettings,
} from '@/lib/storage-utils'
import type { CameraMapPlacement, MapSiteSettings } from '@/types/map'
import { buildDefaultPlacements } from '@/lib/map/defaults'
import { loadMapPlacements, loadMapSite, saveMapPlacements, saveMapSite } from '@/lib/map/storage'
import type {
  FaceProfile,
  FaceRecognitionEvent,
  FaceRecognitionSettings,
} from '@/types/face'
import {
  loadFaceProfiles,
  loadFaceSettings,
  saveFaceProfiles,
  saveFaceSettings,
} from '@/lib/face-storage'
import { defaultFaceProfiles, mockFaceEvents } from '@/lib/mock-faces'
import { buildFaceEventsFromMemory } from '@/lib/face-memory'

function agentsToAlarms(agents: MonitoringAgent[]): AlarmDefinition[] {
  return agents.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    cameraIds: [],
    schedule: a.schedule,
    trigger: 'person' as const,
    severity: 'medium' as const,
    enabled: a.status === 'active',
    createdAt: new Date().toISOString(),
  }))
}

interface AppConfigContextValue {
  cameras: Camera[]
  updateCameraHost: (cameraId: string, host: string) => void
  alarms: AlarmDefinition[]
  discovered: DiscoveredCamera[]
  discoveryStatus: DiscoveryStatus
  scanNetwork: () => Promise<void>
  setDiscoveredSelected: (id: string, selected: boolean) => void
  selectAllDiscovered: (selected: boolean, onlyNew?: boolean) => void
  onboardSelected: (batch: OnboardingBatch) => { added: number; skipped: number }
  addAlarm: (draft: AlarmDraft) => AlarmDefinition
  addAlarmsBulk: (draft: AlarmDraft, cameraIds: string[]) => AlarmDefinition[]
  toggleAlarm: (id: string) => void
  storageSettings: RecordingStorageSettings
  storageUsage: StorageUsageSnapshot
  updateStorageSettings: (settings: RecordingStorageSettings) => void
  mapPlacements: Record<string, CameraMapPlacement>
  mapSite: MapSiteSettings
  setCameraMapPlacement: (placement: CameraMapPlacement) => void
  removeCameraMapPlacement: (cameraId: string) => void
  resetMapPlacements: () => void
  updateMapSite: (site: MapSiteSettings) => void
  faceSettings: FaceRecognitionSettings
  updateFaceSettings: (settings: FaceRecognitionSettings) => void
  faceProfiles: FaceProfile[]
  addFaceProfile: (
    draft: Pick<FaceProfile, 'name' | 'role' | 'color'> & {
      notes?: string
      enrollment?: FaceProfile['enrollment']
    },
  ) => void
  removeFaceProfile: (id: string) => void
  faceEvents: FaceRecognitionEvent[]
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null)

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [cameras, setCameras] = useState<Camera[]>(() => applyCameraHostOverrides([...mockCameras]))
  const [alarms, setAlarms] = useState<AlarmDefinition[]>(() =>
    agentsToAlarms(mockMonitoringAgents),
  )
  const [discovered, setDiscovered] = useState<DiscoveredCamera[]>([])
  const [discoveryStatus, setDiscoveryStatus] = useState<DiscoveryStatus>('idle')
  const [storageSettings, setStorageSettings] = useState<RecordingStorageSettings>(() => {
    return loadStorageSettings() ?? defaultRecordingStorageSettings()
  })

  const storageUsage = useMemo(
    () => mockStorageUsage(storageSettings),
    [storageSettings],
  )

  const updateStorageSettings = useCallback((settings: RecordingStorageSettings) => {
    setStorageSettings(settings)
    saveStorageSettings(settings)
  }, [])

  const [mapSite, setMapSite] = useState<MapSiteSettings>(() => loadMapSite())
  const [mapPlacements, setMapPlacements] = useState<Record<string, CameraMapPlacement>>(() => {
    const stored = loadMapPlacements()
    if (Object.keys(stored).length > 0) return stored
    return buildDefaultPlacements(mockCameras.map((c) => c.id))
  })

  const persistPlacements = useCallback((next: Record<string, CameraMapPlacement>) => {
    setMapPlacements(next)
    saveMapPlacements(next)
  }, [])

  const setCameraMapPlacement = useCallback((placement: CameraMapPlacement) => {
    setMapPlacements((prev) => {
      const next = { ...prev, [placement.cameraId]: placement }
      saveMapPlacements(next)
      return next
    })
  }, [])

  const removeCameraMapPlacement = useCallback((cameraId: string) => {
    setMapPlacements((prev) => {
      const next = { ...prev }
      delete next[cameraId]
      saveMapPlacements(next)
      return next
    })
  }, [])

  const resetMapPlacements = useCallback(() => {
    const next = buildDefaultPlacements(cameras.map((c) => c.id))
    persistPlacements(next)
  }, [cameras, persistPlacements])

  const updateMapSite = useCallback((site: MapSiteSettings) => {
    setMapSite(site)
    saveMapSite(site)
  }, [])

  const [faceSettings, setFaceSettings] = useState<FaceRecognitionSettings>(() => loadFaceSettings())
  const [faceProfiles, setFaceProfiles] = useState<FaceProfile[]>(() => {
    const stored = loadFaceProfiles()
    return stored.length > 0 ? stored : defaultFaceProfiles.map((p) => ({ ...p }))
  })

  const updateFaceSettings = useCallback((settings: FaceRecognitionSettings) => {
    setFaceSettings(settings)
    saveFaceSettings(settings)
  }, [])

  const addFaceProfile = useCallback(
    (
      draft: Pick<FaceProfile, 'name' | 'role' | 'color'> & {
        notes?: string
        enrollment?: FaceProfile['enrollment']
      },
    ) => {
      const profile: FaceProfile = {
        id: `face-${crypto.randomUUID().slice(0, 8)}`,
        name: draft.name,
        role: draft.role,
        color: draft.color,
        notes: draft.notes,
        enrollment: draft.enrollment,
        enrolledAt: draft.enrollment?.capturedAt ?? new Date().toISOString(),
        rememberedByCameras: draft.enrollment?.cameraId ? [draft.enrollment.cameraId] : [],
      }
      setFaceProfiles((prev) => {
        const next = [...prev, profile]
        saveFaceProfiles(next)
        return next
      })
    },
    [],
  )

  const removeFaceProfile = useCallback((id: string) => {
    setFaceProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id)
      saveFaceProfiles(next)
      return next
    })
  }, [])

  const faceEvents = useMemo(() => {
    const fromMemory = buildFaceEventsFromMemory(faceProfiles, cameras, faceSettings)
    if (fromMemory.length > 0) return fromMemory
    return faceSettings.enabled ? mockFaceEvents : []
  }, [faceProfiles, cameras, faceSettings])

  const scanNetwork = useCallback(async () => {
    setDiscoveryStatus('scanning')
    await new Promise((r) => setTimeout(r, 1500))
    const hosts = cameras.map((c) => c.host)
    setDiscovered(mockNetworkDiscovery(hosts))
    setDiscoveryStatus('done')
  }, [cameras])

  const setDiscoveredSelected = useCallback((id: string, selected: boolean) => {
    setDiscovered((list) => list.map((d) => (d.id === id ? { ...d, selected } : d)))
  }, [])

  const selectAllDiscovered = useCallback((selected: boolean, onlyNew = false) => {
    setDiscovered((list) =>
      list.map((d) => ({
        ...d,
        selected: onlyNew ? (d.alreadyRegistered ? d.selected : selected) : selected,
      })),
    )
  }, [])

  const onboardSelected = useCallback(
    (batch: OnboardingBatch) => {
      const toAdd = discovered.filter((d) => d.selected && !d.alreadyRegistered)
      let added = 0
      const newCameras: Camera[] = toAdd.map((d) => {
        added++
        const name = `${batch.namePrefix} ${d.host.split('.').pop()}`.trim()
        return {
          id: `cam-${d.host.replace(/\./g, '-')}`,
          name,
          location: 'Ej angiven',
          host: d.host,
          model: d.model,
          firmware: d.firmware,
          status: 'unknown' as const,
          streamProfile: 'Sub 640×360',
          recordingEnabled: batch.recordingEnabled,
          lastSeenAt: null,
          vapixUser: batch.vapixUser,
        }
      })
      setCameras((prev) => [...prev, ...newCameras])
      setDiscovered((list) =>
        list.map((d) =>
          toAdd.some((t) => t.id === d.id) ? { ...d, alreadyRegistered: true, selected: false } : d,
        ),
      )
      return { added, skipped: discovered.filter((d) => d.selected && d.alreadyRegistered).length }
    },
    [discovered],
  )

  const addAlarm = useCallback(
    (draft: AlarmDraft): AlarmDefinition => {
      const alarm: AlarmDefinition = {
        id: `alarm-${crypto.randomUUID().slice(0, 8)}`,
        name: draft.name,
        description: draft.description,
        cameraIds: draft.cameraIds,
        schedule: draft.schedule,
        trigger: draft.trigger,
        zoneName: draft.zoneName || undefined,
        severity: draft.severity,
        quietHours: draft.quietHours || undefined,
        enabled: true,
        createdAt: new Date().toISOString(),
      }
      setAlarms((prev) => [alarm, ...prev])
      return alarm
    },
    [],
  )

  const addAlarmsBulk = useCallback((draft: AlarmDraft, cameraIds: string[]) => {
    const created: AlarmDefinition[] = cameraIds.map((camId) => {
      const cam = cameras.find((c) => c.id === camId)
      return {
        id: `alarm-${crypto.randomUUID().slice(0, 8)}`,
        name: `${draft.name} — ${cam?.name ?? camId}`,
        description: draft.description,
        cameraIds: [camId],
        schedule: draft.schedule,
        trigger: draft.trigger,
        zoneName: draft.zoneName || undefined,
        severity: draft.severity,
        quietHours: draft.quietHours || undefined,
        enabled: true,
        createdAt: new Date().toISOString(),
      }
    })
    setAlarms((prev) => [...created, ...prev])
    return created
  }, [cameras])

  const toggleAlarm = useCallback((id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    )
  }, [])

  const updateCameraHost = useCallback((cameraId: string, host: string) => {
    const trimmed = host.trim()
    const overrides = mergeCameraHostOverride(loadCameraHostOverrides(), cameraId, trimmed)
    saveCameraHostOverrides(overrides)
    setCameras((prev) =>
      prev.map((c) => (c.id === cameraId ? { ...c, host: trimmed || c.host } : c)),
    )
  }, [])

  const value = useMemo(
    () => ({
      cameras,
      updateCameraHost,
      alarms,
      discovered,
      discoveryStatus,
      scanNetwork,
      setDiscoveredSelected,
      selectAllDiscovered,
      onboardSelected,
      addAlarm,
      addAlarmsBulk,
      toggleAlarm,
      storageSettings,
      storageUsage,
      updateStorageSettings,
      mapPlacements,
      mapSite,
      setCameraMapPlacement,
      removeCameraMapPlacement,
      resetMapPlacements,
      updateMapSite,
      faceSettings,
      updateFaceSettings,
      faceProfiles,
      addFaceProfile,
      removeFaceProfile,
      faceEvents,
    }),
    [
      cameras,
      updateCameraHost,
      alarms,
      discovered,
      discoveryStatus,
      scanNetwork,
      setDiscoveredSelected,
      selectAllDiscovered,
      onboardSelected,
      addAlarm,
      addAlarmsBulk,
      toggleAlarm,
      storageSettings,
      storageUsage,
      updateStorageSettings,
      mapPlacements,
      mapSite,
      setCameraMapPlacement,
      removeCameraMapPlacement,
      resetMapPlacements,
      updateMapSite,
      faceSettings,
      updateFaceSettings,
      faceProfiles,
      addFaceProfile,
      removeFaceProfile,
      faceEvents,
    ],
  )

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>
}

export function useAppConfig() {
  const ctx = useContext(AppConfigContext)
  if (!ctx) throw new Error('useAppConfig must be used within AppConfigProvider')
  return ctx
}
