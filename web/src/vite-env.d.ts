/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OLLAMA_BASE_URL: string
  readonly VITE_OLLAMA_MODEL: string
  readonly VITE_CAMERA_STREAM_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
