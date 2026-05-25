# Architecture — index

**Status:** Living — Phase 1 UI + recording **shipped**; Phase 3 server **optional**; edge **Proposed**

## Documents

| Document | Scope |
|----------|--------|
| [overview.md](overview.md) | Full-system components, Phase 1 as-built, target architecture |
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

## Repository layout (today)

```text
smart-vms/
├── web/           Phase 1 UI + Vite API plugins     ← primary operator path
├── server/        Phase 3 API, MQTT, Postgres       ← optional compose
├── shared/        Event schemas (JSON + TS)         ← contract-first
├── edge-agent/    Phase 2 stub                      ← not production
├── deploy/        docker-compose dev stack
└── docs/          Product, architecture, ADRs
```

## Quality & security

Non-negotiables: [../engineering/quality-and-security-bar.md](../engineering/quality-and-security-bar.md)

Security backlog: [../engineering/security-roadmap.md](../engineering/security-roadmap.md)

## ADRs

Architecture decisions with long-lived impact → [../decisions/](../decisions/).

| ADR | Topic |
|-----|--------|
| 0002 | MQTT event bus |
| 0003 | Postgres incident store |
| 0004 | Remote access (Tailscale) |

## Related product docs

- [../product/overview.md](../product/overview.md)
- [../product/features.md](../product/features.md)
- [../product/roadmap.md](../product/roadmap.md)
