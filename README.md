# Smart VMS

AI-native video management for home and small-site deployments, built around **Axis cameras (VAPIX)** with **edge analytics** and **central server analytics**.

This repository is intentionally **documentation-first** while the product is shaped. Code will land in phased slices aligned with [docs/product/roadmap.md](docs/product/roadmap.md).

## Who this is for

- **Operator (you):** configure cameras, zones, alerts, retention, privacy.
- **Contributors (human or AI):** implement services against documented architecture and principles.

## Documentation map

| Area | Start here |
|------|------------|
| Product vision & ideas | [docs/product/vision.md](docs/product/vision.md) |
| Use cases & personas | [docs/product/personas-and-use-cases.md](docs/product/personas-and-use-cases.md) |
| Roadmap | [docs/product/roadmap.md](docs/product/roadmap.md) |
| Architecture | [docs/architecture/overview.md](docs/architecture/overview.md) |
| Axis / VAPIX | [docs/architecture/axis-vapix.md](docs/architecture/axis-vapix.md) |
| Edge vs server AI | [docs/architecture/edge-vs-server.md](docs/architecture/edge-vs-server.md) |
| Events & data model | [docs/architecture/data-model-and-events.md](docs/architecture/data-model-and-events.md) |
| Software principles | [docs/engineering/software-principles.md](docs/engineering/software-principles.md) |
| Testing strategy | [docs/engineering/testing-strategy.md](docs/engineering/testing-strategy.md) |
| Security & privacy | [docs/engineering/security-and-privacy.md](docs/engineering/security-and-privacy.md) |
| ADRs (decisions) | [docs/decisions/README.md](docs/decisions/README.md) |

Full index: [docs/README.md](docs/README.md).

## Working with AI agents (Cursor)

**Persistent context:** [AGENTS.md](AGENTS.md) — project norms and how agents should behave.

**Auto-applied rules:** `.cursor/rules/` — coding and doc conventions when relevant files are open.

**On-demand review skills:** `.cursor/skills/` — structured feedback personas. Invoke explicitly, for example:

- *"Use the `architecture-review` skill on `docs/architecture/overview.md`."*
- *"Run `product-review` on the Phase 2 roadmap items."*
- *"Use `vapix-integration-review` before we implement event subscription."*
- *"Use `program-delivery-review` on Phase 1 exit criteria."*

See [AGENTS.md](AGENTS.md#review-agents-skills) for the full roster and expected output format.

## Web UI (started)

```bash
cd web && npm install && npm run dev
```

See [web/README.md](web/README.md) — **AI-first** Copilot UI (chat + workspaces) with Swedish labels and mock data.

## Status

| Phase | Focus | Status |
|-------|--------|--------|
| 0 | Product & architecture docs, agent tooling | **Done** |
| 1 | Stream ingest, recording, playback (no AI) | Planned (UI shell in `web/`) |
| 2 | Edge detection & event pipeline | Planned |
| 3 | Server analytics, search, dashboards | Planned |

## License

TBD (private home project by default).
