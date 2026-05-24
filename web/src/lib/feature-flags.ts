/** Face identification workspace — opt-in; off by default (privacy). */
export function isFaceRecognitionEnabled(): boolean {
  return import.meta.env.VITE_FACE_RECOGNITION_ENABLED === 'true'
}

export function isCameraStreamEnabled(): boolean {
  return import.meta.env.VITE_CAMERA_STREAM_ENABLED !== 'false'
}

export function isGoogleMapsConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim())
}

export function ollamaModelName(): string {
  return import.meta.env.VITE_OLLAMA_MODEL ?? 'qwen2.5-coder:7b'
}
