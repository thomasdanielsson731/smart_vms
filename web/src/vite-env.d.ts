/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OLLAMA_BASE_URL: string
  readonly VITE_OLLAMA_MODEL: string
  readonly VITE_CAMERA_STREAM_ENABLED?: string
  readonly VITE_CAMERA_HOSTS?: string
  readonly VITE_CAMERA_SUBNET?: string
  readonly VITE_FACE_RECOGNITION_ENABLED?: string
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
