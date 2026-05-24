/** Face identification workspace — opt-in; off by default (privacy). */
export function isFaceRecognitionEnabled(): boolean {
  return import.meta.env.VITE_FACE_RECOGNITION_ENABLED === 'true'
}
