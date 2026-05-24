# Second tier analytics vid larm

**Status:** Regelbaserad mock i `web/` — berikning efter kameratrigg

## Syfte

När en kamera triggar ett larm ska ett **andra analyssteg** (tier 2) köras som förklarar:

- **Vad som hände** — regel, konfidens, kamera, kontext
- **Personer** — kända/okända via ansiktsigenkänning, roller, kameraminne
- **Prioritet** — rutin, granska eller prioritera

Tier 1 är rådetektionen (regel + best picture). Tier 2 är den mänskligt läsbara berättelsen för operatören.

## Datamodell

`AlarmTier2Analysis` (`web/src/types/alarm-analytics.ts`):

| Fält | Beskrivning |
|------|-------------|
| `headline` | Kort rubrik |
| `summary` | Narrativ sammanfattning |
| `triggerExplanation` | Varför regeln triggades |
| `persons[]` | Kända, okända eller infererade personer |
| `insights[]` | Punkter för operatör |
| `assessedPriority` | `routine` / `review` / `urgent` |
| `sources` | `rule`, `object_detection`, `face_recognition`, `vapix` |

Valfritt cachat på `Incident.tier2` när backend/edge har genererat analysen.

## UI

| Plats | Visning |
|-------|---------|
| Forensic | Full `AlarmTier2Panel` vid valt larm |
| Dashboard | Kompakt analys under varje senaste larm |
| Larmlista | Tier-2-rubrik under larmtitel |

## Pipeline (målbild)

```
Kamera → Tier 1 (regel + best picture)
       → Tier 2 (objekt + ansikte + kontext)
       → Incident med tier2
       → UI / Copilot / notifiering
```

**Mock:** `generateAlarmTier2Analysis()` kombinerar larm, `faceMatch`, profiler och inställningar.

**Framtid:**

- Edge: objektklass + ansikte lokalt, skicka `tier2`-payload
- Server: valfri Ollama-förfining av sammanfattning
- Copilot: «Förklara senaste larmet» läser `tier2`

## Relaterat

- [forensic.md](forensic.md)
- [face-recognition.md](face-recognition.md)
- [edge-vs-server.md](../architecture/edge-vs-server.md)
