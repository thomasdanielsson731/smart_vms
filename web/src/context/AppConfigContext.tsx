import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  loadCameraHostOverrides,
  mergeCameraHostOverride,
  saveCameraHostOverrides,
} from '@/lib/camera-hosts-storage'
import {
  buildInitialCameras,
  mergeProbeMetadata,
  probesFromDiscovered,
  saveCameraRegistry,
} from '@/lib/camera-registry-storage'
import { discoverCameras, probeCameraMetadata } from '@/lib/network-discovery'
import type { Camera } from '@/types/camera'
import type { AlarmDefinition, AlarmDraft } from '@/types/alarm'
import type { DiscoveredCamera, OnboardingBatch, DiscoveryStatus, OnboardResult } from '@/types/onboarding'
import { testCameraStream, streamTestMessage } from '@/lib/camera-stream-test'
import {
  defaultRecordingStorageSettings,
  type RecordingStorageSettings,
  type StorageUsageSnapshot,
} from '@/types/storage'
import {
  loadStorageSettings,
  storageUsageSnapshot,
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
import type { ForensicIncident } from '@/types/forensic'
import {
  loadFaceProfiles,
  loadFaceSettings,
  saveFaceProfiles,
  saveFaceSettings,
} from '@/lib/face-storage'
import { buildFaceEventsFromMemory } from '@/lib/face-memory'

interface AppConfigContextValue {
  cameras: Camera[]
  incidents: ForensicIncident[]
  updateCameraHost: (cameraId: string, host: string) => void
  alarms: AlarmDefinition[]
  discovered: DiscoveredCamera[]
  discoveryStatus: DiscoveryStatus
  discoveryError: string | null
  discoveryScanInfo: { subnet: string; scanned: number } | null
  scanNetwork: () => Promise<boolean>
  setDiscoveredSelected: (id: string, selected: boolean) => void
  selectAllDiscovered: (selected: boolean, onlyNew?: boolean) => void
  onboardSelected: (batch: OnboardingBatch) => Promise<OnboardResult>
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
  const [cameras, setCameras] = useState<Camera[]>(() => buildInitialCameras())
  const [incidents] = useState<ForensicIncident[]>([])
  const persistCameras = useCallback((next: Camera[]) => {
    setCameras(next)
    saveCameraRegistry(next)
  }, [])
  const [alarms, setAlarms] = useState<AlarmDefinition[]>([])
  const [discovered, setDiscovered] = useState<DiscoveredCamera[]>([])
  const [discoveryStatus, setDiscoveryStatus] = useState<DiscoveryStatus>('idle')
  const [discoveryError, setDiscoveryError] = useState<string | null>(null)
  const [discoveryScanInfo, setDiscoveryScanInfo] = useState<{ subnet: string; scanned: number } | null>(
    null,
  )
  const [storageSettings, setStorageSettings] = useState<RecordingStorageSettings>(() => {
    return loadStorageSettings() ?? defaultRecordingStorageSettings()
  })

  const storageUsage = useMemo(
    () => storageUsageSnapshot(storageSettings),
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
    return buildDefaultPlacements(buildInitialCameras().map((c) => c.id))
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
  const [faceProfiles, setFaceProfiles] = useState<FaceProfile[]>(() => loadFaceProfiles())

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

  const faceEvents = useMemo(
    () => buildFaceEventsFromMemory(faceProfiles, cameras, faceSettings),
    [faceProfiles, cameras, faceSettings],
  )

  const syncCameraMetadata = useCallback((probes: ReturnType<typeof probesFromDiscovered>) => {
    setCameras((prev) => {
      const next = mergeProbeMetadata(prev, probes)
      saveCameraRegistry(next)
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function refreshPendingMetadata() {
      const pending = cameras.filter((c) => c.model === '—' || !c.serial)
      if (pending.length === 0) return

      const probes = await Promise.all(pending.map((c) => probeCameraMetadata(c.host)))
      if (cancelled) return

      setCameras((prev) => {
        const next = mergeProbeMetadata(prev, probes)
        saveCameraRegistry(next)
        return next
      })
    }

    void refreshPendingMetadata()
    return () => {
      cancelled = true
    }
    // Probe once on mount for cameras missing VAPIX metadata
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scanNetwork = useCallback(async (): Promise<boolean> => {
    setDiscoveryStatus('scanning')
    setDiscoveryError(null)
    setDiscoveryScanInfo(null)
    const hosts = cameras.map((c) => c.host)
    try {
      const result = await discoverCameras(hosts)
      setDiscovered(result.devices)
      if (result.subnet && result.scanned) {
        setDiscoveryScanInfo({ subnet: result.subnet, scanned: result.scanned })
      }
      syncCameraMetadata(probesFromDiscovered(result.devices))

      if (result.devices.length === 0) {
        setDiscoveryStatus('error')
        setDiscoveryError(
          result.error ?? 'No Axis cameras found on the subnet. Check VAPIX credentials.',
        )
        return false
      }

      if (result.error) setDiscoveryError(result.error)
      setDiscoveryStatus('done')
      return true
    } catch {
      setDiscoveryStatus('error')
      setDiscoveryError('Scan failed unexpectedly.')
      return false
    }
  }, [cameras, syncCameraMetadata])

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
    async (batch: OnboardingBatch): Promise<OnboardResult> => {
      const toAdd = discovered.filter((d) => d.selected && !d.alreadyRegistered)
      const skipped = discovered.filter((d) => d.selected && d.alreadyRegistered).length
      const failed: OnboardResult['failed'] = []

      for (const d of toAdd) {
        const test = await testCameraStream(d.host)
        if (!test.ok) {
          failed.push({
            host: d.host,
            message: streamTestMessage(test) ?? test.message,
          })
        }
      }

      if (failed.length > 0) {
        return { added: 0, skipped, failed }
      }

      const probedAt = new Date().toISOString()
      const newCameras: Camera[] = toAdd.map((d) => {
        const name = `${batch.namePrefix} ${d.host.split('.').pop()}`.trim()
        return {
          id: `cam-${d.host.replace(/\./g, '-')}`,
          name,
          location: 'Ej angiven',
          host: d.host,
          model: d.model,
          firmware: d.firmware,
          serial: d.serial !== '—' ? d.serial : undefined,
          status: 'online' as const,
          streamProfile: d.streamProfile ?? 'Sub 640×360',
          recordingEnabled: batch.recordingEnabled,
          lastSeenAt: probedAt,
          lastVapixProbeAt: probedAt,
          vapixUser: batch.vapixUser,
        }
      })

      persistCameras([...cameras, ...newCameras])
      setDiscovered((list) =>
        list.map((d) =>
          toAdd.some((t) => t.id === d.id) ? { ...d, alreadyRegistered: true, selected: false } : d,
        ),
      )
      return { added: newCameras.length, skipped, failed: [] }
    },
    [cameras, discovered, persistCameras],
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
    setCameras((prev) => {
      const next = prev.map((c) => (c.id === cameraId ? { ...c, host: trimmed || c.host } : c))
      saveCameraRegistry(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      cameras,
      incidents,
      updateCameraHost,
      alarms,
      discovered,
      discoveryStatus,
      discoveryError,
      discoveryScanInfo,
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
      incidents,
      updateCameraHost,
      alarms,
      discovered,
      discoveryStatus,
      discoveryError,
      discoveryScanInfo,
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
