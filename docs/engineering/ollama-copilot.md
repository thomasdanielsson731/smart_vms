# Ollama Copilot (lokal Qwen)

**Status:** Implemented in `web/` (dev via Vite proxy)

## Översikt

Smart VMS Copilot använder **Ollama** på samma dator som webbläsaren. Standardmodell: `qwen2.5-coder:7b` (~4.7 GB på disk).

## Krav

1. [Ollama](https://ollama.com) installerat och körande (`ollama serve`)
2. Modell pullad: `ollama pull qwen2.5-coder:7b`
3. Web UI: `cd web && npm run dev`

## Konfiguration

`web/.env` (kopiera från `web/.env.example`):

```env
VITE_OLLAMA_BASE_URL=/api/ollama
VITE_OLLAMA_MODEL=qwen2.5-coder:7b
```

| Variabel | Betydelse |
|----------|-----------|
| `VITE_OLLAMA_BASE_URL` | `/api/ollama` proxas till `127.0.0.1:11434` i Vite |
| `VITE_OLLAMA_MODEL` | Modellnamn enligt `ollama list` |

Annan modell (t.ex. 14B): ändra `VITE_OLLAMA_MODEL=qwen2.5-coder:14b`

## Beteende

- Chatt skickar historik + systemprompt (kameror, larm) till `/api/chat`
- Modellen kan avsluta med `@@ACTION@@{...}` för att öppna workspace (video, onboarding, larm, …)
- Om Ollama är nere: **fallback** till nyckelords-intent i `chat-intents.ts`
- Status i Copilot-header: grön = online + modell finns

## Felsökning

| Symptom | Åtgärd |
|---------|--------|
| «Ollama offline» | Starta Ollama-appen eller `ollama serve` |
| Modell saknas | `ollama pull qwen2.5-coder:7b` |
| Långsam första fråga | Normalt — modell laddas in i RAM |
| CORS-fel | Använd `/api/ollama` (proxy), inte direkt `:11434` i dev |

## Framtida

- Streaming-svar i UI
- Backend-proxy i Phase 1 (enda ingång för web + API-nycklar)
- Tool calling mot riktiga VMS-endpoints
