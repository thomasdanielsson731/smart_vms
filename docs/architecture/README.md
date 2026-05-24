# Architecture — index

**Status:** Living — Phase 0–1 documented; edge/server services **Proposed** until implemented

## Documents

| Document | Scope |
|----------|--------|
| [overview.md](overview.md) | Full-system components, event flow, deployment modes |
| [web-application.md](web-application.md) | **Decided** — React + Vite Phase 1 app |
| [edge-vs-server.md](edge-vs-server.md) | Analytics responsibility split |
| [axis-vapix.md](axis-vapix.md) | Axis control plane integration |
| [data-model-and-events.md](data-model-and-events.md) | Events, clips, incidents (contracts) |
| [trust-boundaries.md](trust-boundaries.md) | Security zones and controls |
| [deployment-home.md](deployment-home.md) | Home LAN topology by phase |

## Diagram conventions

- **Mermaid** for flows and component diagrams
- Label trust boundaries (browser, LAN, camera, internet)
- State **Proposed** vs **Decided** at top of each doc

## Target repository layout

```text
smart-vms/
├── web/           Phase 1 UI + dev API plugins  ← today
├── edge-agent/    Per-site ingest + inference   ← future
├── server/        Recording, incidents, bus    ← future
├── shared/        Schemas, OpenAPI, fixtures    ← future
└── deploy/        Compose, systemd, configs     ← future
```

## ADRs

Architecture decisions with long-lived impact → [../decisions/](../decisions/).

Examples needing ADRs when implemented:

- Event bus choice (MQTT vs NATS)
- Live view transport (WebRTC vs HLS)
- Remote access pattern

## Related product docs

- [../product/overview.md](../product/overview.md)
- [../product/features.md](../product/features.md)
- [../product/roadmap.md](../product/roadmap.md)
