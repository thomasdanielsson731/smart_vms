# Inspelningskvot & lagring

**Status:** UI + localStorage (mock usage) — backend enforcement Phase 1

## Inställningar (operatör)

| Fält | Betydelse |
|------|-----------|
| Max inspelningar (GiB) | Hård kvot för kontinuerlig inspelning |
| Max händelseklipp (GiB) | Separat tak för larmklipp; 0 = 10 % av inspelningskvot |
| Max lagringstid (dagar) | Tidsbaserad gallring även om utrymme finns |
| Varna vid % | Dashboard/larm till operatör |
| Vid full kvot | `delete_oldest` \| `stop_recording` \| `warn_only` |

## Var konfigureras

- **Inställningar**-workspace (chatt: «begränsa lagring», «öppna inställningar»)
- Sparas i `localStorage` (`smart-vms-recording-storage`) tills API finns

## Backend (Phase 1)

Recording service ska:

1. Läsa kvot från DB (ersätter localStorage)
2. Rapportera `recordingUsedBytes`, `clipsUsedBytes` till UI
3. Köra gallring enligt `onLimitReached` och `maxRetentionDays`
4. Exponera `GET/PUT /api/v1/storage/settings`

## Relaterat

- [data-model-and-events.md](../architecture/data-model-and-events.md) — retention defaults
- [security-and-privacy.md](../engineering/security-and-privacy.md)
