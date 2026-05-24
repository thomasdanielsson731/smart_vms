# Forensic — tidslinje & granskning

**Status:** UI mock i `web/`

## Syfte

Operatör ska kunna **utreda händelser** i efterhand: se alla larm på en tidslinje, filtrera per kamera/period, och öppna kopplat inspelningsklipp med metadata (regel, konfidens, status).

## UI (`forensic` workspace)

| Del | Funktion |
|-----|----------|
| Period | 24h / 48h / 7d |
| Kamerafilter | Alla eller en kamera |
| Tidslinje | Markörer per larm (färg = allvar) |
| Larmlista | Synkad med tidslinje |
| Uppspelning | Klippfönster + metadata + export (mock) |
| **Analys (nivå 2)** | Berikad förklaring av larm + personer efter trigg |

Se [alarm-tier2-analytics.md](alarm-tier2-analytics.md).

## Chatt

- «Öppna forensic»
- «Visa alla larm på tidslinjen»
- «Forensisk granskning senaste dygnet»

## Backend (Phase 1+)

- `GET /api/v1/forensic/timeline?from=&to=&cameraId=`
- Returnerar incidents + recording segment overlap
- `GET /api/v1/clips/{id}/playback` för video

## Relaterat

- [ux-ai-first.md](ux-ai-first.md)
- [data-model-and-events.md](../architecture/data-model-and-events.md)
