/** Ollama API — proxied via Vite in dev (`/api/ollama` → localhost:11434) */
export const ollamaConfig = {
  baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL?.replace(/\/$/, '') || '/api/ollama',
  model: import.meta.env.VITE_OLLAMA_MODEL || 'qwen2.5-coder:7b',
}
