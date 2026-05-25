import type { FaceProfile, FaceRecognitionEvent, FaceRecognitionSettings } from '@/types/face'
import type { Camera } from '@/types/camera'

export interface DetectedFaceWithMemory {
  id: string
  bboxNorm: [number, number, number, number]
  detectScore: number
  matchedProfileId?: string
  matchedName?: string
  unknown: boolean
}

function jitterBbox(
  bbox: [number, number, number, number],
  amount = 0.02,
): [number, number, number, number] {
  const [x, y, w, h] = bbox
  return [
    Math.max(0, Math.min(1 - w, x + (Math.random() - 0.5) * amount)),
    Math.max(0, Math.min(1 - h, y + (Math.random() - 0.5) * amount)),
    w,
    h,
  ]
}

export function profilesRememberedByCamera(
  profiles: FaceProfile[],
  cameraId: string,
): FaceProfile[] {
  return profiles.filter((p) => p.rememberedByCameras.includes(cameraId))
}

export function scanFrameWithCameraMemory(
  cameraId: string,
  profiles: FaceProfile[],
  seed: number,
): DetectedFaceWithMemory[] {
  const remembered = profilesRememberedByCamera(profiles, cameraId)
  return remembered.map((profile, i) => {
    const bbox =
      profile.enrollment?.cameraId === cameraId && profile.enrollment.bboxNorm
        ? jitterBbox(profile.enrollment.bboxNorm, 0.03)
        : ([0.2 + i * 0.25, 0.3, 0.12, 0.2] as [number, number, number, number])
    return {
      id: `known-${profile.id}-${seed}`,
      bboxNorm: bbox,
      detectScore: 0.9,
      matchedProfileId: profile.id,
      matchedName: profile.name,
      unknown: false,
    }
  })
}

export function buildFaceEventsFromMemory(
  profiles: FaceProfile[],
  cameras: Camera[],
  settings: FaceRecognitionSettings,
): FaceRecognitionEvent[] {
  void profiles
  void cameras
  void settings
  return []
}

export function mergeRememberedCameras(
  existing: string[],
  cameraId: string,
): string[] {
  if (existing.includes(cameraId)) return existing
  return [...existing, cameraId]
}
