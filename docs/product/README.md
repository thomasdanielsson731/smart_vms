# Product documentation — index

**Status:** Living — reflects Phase 1 UI in `web/`

## Start here

| Document | Audience | Content |
|----------|----------|---------|
| [overview.md](overview.md) | Everyone | Product summary, pillars, journeys |
| [vision.md](vision.md) | Strategy | North star, non-goals, metrics |
| [roadmap.md](roadmap.md) | Delivery | Phases 0–4, exit criteria |
| [features.md](features.md) | PM / eng | Feature catalog: real vs mock |

## Personas & UX

| Document | Content |
|----------|---------|
| [personas-and-use-cases.md](personas-and-use-cases.md) | Owner-operator, use cases UC-1… |
| [ux-ai-first.md](ux-ai-first.md) | Chat-first layout, intents, agents |
| [ui-phase1.md](ui-phase1.md) | Phase 1 workspace scope |

## Feature specs

| Document | Feature |
|----------|---------|
| [storage-quota.md](storage-quota.md) | Recording disk limits |
| [forensic.md](forensic.md) | Timeline + alarm review |
| [map-view.md](map-view.md) | Map, FOV, alarms, my location |
| [face-recognition.md](face-recognition.md) | Opt-in face registry |
| [alarm-tier2-analytics.md](alarm-tier2-analytics.md) | Post-alarm enrichment |
| [camera-web-ui.md](camera-web-ui.md) | Embedded Axis web interface |
| [multi-config.md](multi-config.md) | Bulk onboarding + alarms |

## Backlog

| Document | Content |
|----------|---------|
| [ideas-backlog.md](ideas-backlog.md) | Unprioritized ideas |

## Implementation map

Most Phase 1 UI lives in `web/src/components/workspace/`. When a spec says **Mock**, data is in `web/src/lib/mock-*.ts` until backend services exist.
