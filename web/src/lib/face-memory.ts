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
  const results: DetectedFaceWithMemory[] = remembered.map((profile, i) => {
    const bbox =
      profile.enrollment?.cameraId === cameraId && profile.enrollment.bboxNorm
        ? jitterBbox(profile.enrollment.bboxNorm, 0.03)
        : ([0.2 + i * 0.25, 0.3, 0.12, 0.2] as [number, number, number, number])
    return {
      id: `known-${profile.id}-${seed}`,
      bboxNorm: bbox,
      detectScore: 0.9 + Math.random() * 0.08,
      matchedProfileId: profile.id,
      matchedName: profile.name,
      unknown: false,
    }
  })

  const unknownCount = remembered.length === 0 ? 1 : seed % 3 === 0 ? 1 : 0
  for (let u = 0; u < unknownCount; u++) {
    results.push({
      id: `unknown-${seed}-${u}`,
      bboxNorm: [0.5 + u * 0.1, 0.35, 0.11, 0.18],
      detectScore: 0.78 + Math.random() * 0.1,
      unknown: true,
    })
  }

  return results
}

export function buildFaceEventsFromMemory(
  profiles: FaceProfile[],
  cameras: Camera[],
  settings: FaceRecognitionSettings,
): FaceRecognitionEvent[] {
  if (!settings.enabled) return []

  const events: FaceRecognitionEvent[] = []
  const now = Date.now()

  for (const profile of profiles) {
    for (const cameraId of profile.rememberedByCameras) {
      const camera = cameras.find((c) => c.id === cameraId)
      if (!camera) continue
      if (settings.cameraIds.length > 0 && !settings.cameraIds.includes(cameraId)) continue

      events.push({
        id: `frec-mem-${profile.id}-${cameraId}`,
        occurredAt: new Date(now - Math.random() * 48 * 3600_000).toISOString(),
        cameraId,
        cameraName: camera.name,
        match: {
          profileId: profile.id,
          displayName: profile.name,
          confidence: 0.85 + Math.random() * 0.12,
          unknown: false,
        },
      })
    }
  }

  return events.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )
}

export function mergeRememberedCameras(
  existing: string[],
  cameraId: string,
): string[] {
  if (existing.includes(cameraId)) return existing
  return [...existing, cameraId]
}
