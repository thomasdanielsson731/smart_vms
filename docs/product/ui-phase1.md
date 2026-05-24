# UI — Phase 1 scope

**Status:** Decided — AI-first shell shipped in `web/` (mock data layer; real auth + live video)

## Goal

The operator works primarily through **Copilot chat**; video, dashboard, tracking, and monitoring open as **workspace panels**. See [ux-ai-first.md](ux-ai-first.md).

## Workspaces

| Workspace | ID | Opened via | Phase 1 |
|-----------|-----|------------|---------|
| Copilot (main) | — | Default | Real Ollama + keyword intents |
| Video | `video` | Chat / sidebar | Real live · mock playback |
| Dashboard | `dashboard` | Chat / sidebar | Mock metrics |
| Forensic | `forensic` | Chat / sidebar | Mock timeline |
| Map | `map` | Chat / sidebar | Real map · mock alarm geo |
| Faces | `faces` | Chat / sidebar | Opt-in · mock detection |
| Camera web | `camera-web` | Chat / sidebar | Real proxied Axis UI |
| Onboarding | `onboarding` | Chat / sidebar | Mock discovery |
| Create alarm | `alarms` | Chat / sidebar | Mock rules |
| Agents | `agents` | Chat / sidebar | Mock policies |
| Tracking | `tracking` | Chat / sidebar | Mock (Phase 3) |
| Settings | `settings` | Sidebar | Real auth + VAPIX + storage UI |

## Design decisions

- **Language:** English UI
- **Theme:** Dark, high contrast (typical VMS)
- **Auth:** Login required; admin vs viewer
- **Data:** Types align with [../architecture/data-model-and-events.md](../architecture/data-model-and-events.md); swap mock layer for API later

## Real vs mock

See [features.md](features.md) for the full matrix.

## Open ADRs

- Live view transport (WebRTC vs HLS) for scale
- Extract API from Vite plugins to `server/` (Phase 3)

## Related

- [roadmap.md](roadmap.md) Phase 1
- [../architecture/web-application.md](../architecture/web-application.md)
- [../../web/package.json](../../web/package.json)
