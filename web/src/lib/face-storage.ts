import type { FaceProfile, FaceRecognitionSettings } from '@/types/face'

const SETTINGS_KEY = 'smart-vms-face-settings'
const PROFILES_KEY = 'smart-vms-face-profiles'

function normalizeProfile(profile: FaceProfile): FaceProfile {
  const fromEnrollment = profile.enrollment?.cameraId
  const remembered = profile.rememberedByCameras ?? (fromEnrollment ? [fromEnrollment] : [])
  return { ...profile, rememberedByCameras: remembered }
}

export function defaultFaceSettings(): FaceRecognitionSettings {
  return {
    enabled: false,
    minConfidence: 0.75,
    alertOnUnknown: true,
    cameraIds: [],
    consentAcknowledgedAt: null,
  }
}

export function loadFaceSettings(): FaceRecognitionSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultFaceSettings()
    return { ...defaultFaceSettings(), ...JSON.parse(raw) }
  } catch {
    return defaultFaceSettings()
  }
}

export function saveFaceSettings(settings: FaceRecognitionSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadFaceProfiles(): FaceProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (!raw) return []
    return (JSON.parse(raw) as FaceProfile[]).map(normalizeProfile)
  } catch {
    return []
  }
}

export function saveFaceProfiles(profiles: FaceProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles.map(normalizeProfile)))
}
