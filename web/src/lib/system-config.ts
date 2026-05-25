import type { FaceRecognitionSettings } from '@/types/face'
import type { RecordingStorageSettings } from '@/types/storage'
import type { SystemFeature } from '@/types/config'
import {
  isCameraStreamEnabled,
  isFaceRecognitionEnabled,
  ollamaModelName,
} from '@/lib/feature-flags'

interface SystemFeatureInput {
  storageSettings: RecordingStorageSettings
  faceSettings: FaceRecognitionSettings
  vapixConfigured: boolean | null
  cameraCount: number
  agentCount: number
}

export function buildSystemFeatures(input: SystemFeatureInput): SystemFeature[] {
  const { storageSettings, faceSettings, vapixConfigured, cameraCount, agentCount } = input

  return [
    {
      id: 'vapix',
      label: 'VAPIX credentials',
      description: 'Shared digest auth for camera API access',
      enabled: vapixConfigured === true,
      source: 'runtime',
      configureHint: 'Settings → Cameras (VAPIX)',
    },
    {
      id: 'live-stream',
      label: 'Live video',
      description: 'MJPEG/snapshot streams in the UI',
      enabled: isCameraStreamEnabled(),
      source: 'env',
      configureHint: 'VITE_CAMERA_STREAM_ENABLED in web/.env',
    },
    {
      id: 'recording',
      label: 'Recording quota',
      description: `${storageSettings.maxRecordingGiB} GiB max · ${storageSettings.maxRetentionDays} day retention`,
      enabled: storageSettings.maxRecordingGiB > 0,
      source: 'settings',
      configureHint: 'Settings → Recording & storage',
    },
    {
      id: 'face-recognition',
      label: 'Face recognition workspace',
      description: 'Opt-in identification UI (privacy gated)',
      enabled: isFaceRecognitionEnabled(),
      source: 'env',
      configureHint: 'VITE_FACE_RECOGNITION_ENABLED=true',
    },
    {
      id: 'face-runtime',
      label: 'Face matching',
      description: 'Operator-enabled face events and alerts',
      enabled: faceSettings.enabled,
      source: 'settings',
      configureHint: 'Faces workspace → Settings',
    },
    {
      id: 'map',
      label: 'OpenStreetMap',
      description: 'Leaflet map view with OSM tiles',
      enabled: true,
      source: 'runtime',
      configureHint: 'Map workspace',
    },
    {
      id: 'ollama',
      label: 'Smart Chat (Ollama)',
      description: `Local copilot model: ${ollamaModelName()}`,
      enabled: true,
      source: 'env',
      configureHint: 'VITE_OLLAMA_BASE_URL / VITE_OLLAMA_MODEL',
    },
    {
      id: 'cameras',
      label: 'Registered cameras',
      description: `${cameraCount} camera${cameraCount === 1 ? '' : 's'} in registry`,
      enabled: cameraCount > 0,
      source: 'runtime',
      configureHint: 'Configuration → Onboard cameras',
    },
    {
      id: 'agents',
      label: 'Monitoring agents',
      description: `${agentCount} agent rule${agentCount === 1 ? '' : 's'} defined`,
      enabled: agentCount > 0,
      source: 'runtime',
      configureHint: 'Agents workspace',
    },
  ]
}

export function parseConfigurationTab(raw: string | undefined): 'overview' | 'cameras' | 'onboard' {
  if (raw === 'cameras' || raw === 'onboard') return raw
  return 'overview'
}
