# Smart VMS

AI-native video management for home and small-site deployments, built around **Axis cameras (VAPIX)** with **edge analytics** and **central server analytics**.

This repository combines **documentation** and a **Phase 1 operator UI** in `web/`, aligned with [docs/product/roadmap.md](docs/product/roadmap.md).

## Who this is for

- **Operator (you):** configure cameras, zones, alerts, retention, privacy.
- **Contributors (human or AI):** implement services against documented architecture and principles.

## Documentation map

| Area | Start here |
|------|------------|
| **Product overview** | [docs/product/overview.md](docs/product/overview.md) |
| Product vision | [docs/product/vision.md](docs/product/vision.md) |
| Feature catalog | [docs/product/features.md](docs/product/features.md) |
| Roadmap | [docs/product/roadmap.md](docs/product/roadmap.md) |
| Architecture (full system) | [docs/architecture/overview.md](docs/architecture/overview.md) |
| Web app (Phase 1) | [docs/architecture/web-application.md](docs/architecture/web-application.md) |
| Engineering practices | [docs/engineering/README.md](docs/engineering/README.md) |
| Development workflow | [docs/engineering/development-workflow.md](docs/engineering/development-workflow.md) |
| Testing | [docs/engineering/testing-strategy.md](docs/engineering/testing-strategy.md) |
| Security & privacy | [docs/engineering/security-and-privacy.md](docs/engineering/security-and-privacy.md) |
| ADRs | [docs/decisions/README.md](docs/decisions/README.md) |

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
# From repo root (recommended)
npm install --prefix web
npm run dev

# Or from web/
cd web && npm install && npm run dev
```

See [web/README.md](web/README.md) — **AI-first** Copilot UI (chat + workspaces) with mock data.

## Status

| Phase | Focus | Status |
|-------|--------|--------|
| 0 | Product & architecture docs, agent tooling | **Done** |
| 1 | Stream ingest, recording, playback (no AI) | Planned (UI shell in `web/`) |
| 2 | Edge detection & event pipeline | Planned |
| 3 | Server analytics, search, dashboards | Planned |

## License

TBD (private home project by default).
