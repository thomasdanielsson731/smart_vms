# UI — Phase 1 scope

**Status:** Proposed — AI-first shell in `web/`

## Goal

Operator works primarily through **Copilot chat**; video, dashboard, tracking, and monitoring agents open as **workspace panels**. See [ux-ai-first.md](ux-ai-first.md).

## Surfaces (implemented as shell)

| Surface | Opened via | Phase 1 acceptance |
|---------|------------|-------------------|
| Chat (main) | Default | LLM + tools (mock intent today) |
| Video | Chat / rail | Live + playback per camera |
| Dashboard | Chat / rail | Real metrics from API |
| Tracking | Chat / rail | Cross-camera tracks (Phase 2–3) |
| Agents | Chat / rail | CRUD monitoring policies |
| Inställningar | Chat | Auth, retention (admin) |

## Design decisions

- **Language:** Swedish UI for home operator
- **Theme:** Dark, high contrast (typical VMS)
- **Mock-first:** Types align with `data-model-and-events.md`; swap data layer later

## Open ADRs

- Live view transport (WebRTC vs HLS)
- API style (REST + OpenAPI)

## Related

- [roadmap.md](roadmap.md) Phase 1
- [web/README.md](../../web/README.md)
