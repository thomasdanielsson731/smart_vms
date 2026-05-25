/** Ollama API — proxied via Vite in dev (`/api/ollama` → localhost:11434) */
export const ollamaConfig = {
  baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL?.replace(/\/$/, '') || '/api/ollama',
  model: import.meta.env.VITE_OLLAMA_MODEL || 'qwen2.5-coder:7b',
  /** Vision model for scene-based camera naming — requires `ollama pull` */
  visionModel: import.meta.env.VITE_OLLAMA_VISION_MODEL || 'moondream',
}
