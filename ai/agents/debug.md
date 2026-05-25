# Debug agent brief

## Mission

Reproduce, isolate, fix with **minimal diff**. Prefer evidence over speculation.

## Process

1. Reproduce (browser, curl, unit test)
2. Identify layer: UI / Vite plugin / camera / server / env
3. Fix root cause — not symptom masking
4. Add regression test if P0 path (recording, auth, proxy)

## Smart VMS hotspots

| Symptom | First look |
|---------|------------|
| Live view blank | VAPIX creds, stream test, digest auth |
| Recording gaps | `capture-health.json`, HTTPS vs HTTP |
| Empty incidents | `SMARTVMS_SERVER_URL`, compose stack |
| Map wrong center | `MapWorkspace` focus, `mapPlacements` |
| Ollama errors | vision model list, `web/src/lib/ollama/vision-model.ts` |

## Must not

- Disable SSRF or auth “temporarily” without explicit user OK
- Commit `.env` while debugging
