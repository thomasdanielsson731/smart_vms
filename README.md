# Smart VMS

AI-native video management for home and small-site deployments, built around **Axis cameras (VAPIX)** with **edge analytics** and **central server analytics**.

This repository combines **documentation**, an **AI-native engineering layout** (`ai/`), and a **Phase 1 operator UI** in `web/`.

## Who this is for

- **Operator (you):** configure cameras, zones, alerts, retention, privacy.
- **Contributors (human or AI):** implement services against documented architecture and principles.

## AI-native structure

| Start | Path |
|-------|------|
| **Persistent context** | [ai/project-context.md](ai/project-context.md) |
| **Current state** | [ai/current-state.md](ai/current-state.md) |
| **Agent rules** | [ai/agent-contracts.md](ai/agent-contracts.md) |
| **Agent roster** | [ai/agents/README.md](ai/agents/README.md) |
| **Cursor entry** | [AGENTS.md](AGENTS.md) |

## Documentation map

| Area | Start here |
|------|------------|
| **Product overview** | [docs/product/overview.md](docs/product/overview.md) |
| Product vision | [docs/product/vision.md](docs/product/vision.md) |
| Feature catalog | [docs/product/features.md](docs/product/features.md) |
| Roadmap | [docs/product/roadmap.md](docs/product/roadmap.md) |
| Architecture (full system) | [docs/architecture/overview.md](docs/architecture/overview.md) |
| Quality & security bar | [docs/engineering/quality-and-security-bar.md](docs/engineering/quality-and-security-bar.md) |
| Web app (Phase 1) | [docs/architecture/web-application.md](docs/architecture/web-application.md) |
| Engineering practices | [docs/engineering/README.md](docs/engineering/README.md) |
| ADRs | [docs/decisions/README.md](docs/decisions/README.md) |

Full index: [docs/README.md](docs/README.md).

## Working with AI agents (Cursor)

**Session start:** read [ai/workflows/session-start.md](ai/workflows/session-start.md).

**Auto-applied rules:** `.cursor/rules/` — coding and doc conventions.

**Review skills:** `.cursor/skills/` — invoke explicitly, e.g. *"Use the `architecture-review` skill on …"*.

**After major work:** update [ai/current-state.md](ai/current-state.md) and optionally [ai/feedback/release-retro.md](ai/feedback/release-retro.md).

## Web UI

```bash
npm install --prefix web
npm run dev
```

See [web/README.md](web/README.md).

Optional Phase 3 stack: [deploy/README.md](deploy/README.md).

## Status

| Phase | Focus | Status |
|-------|--------|--------|
| 0 | Docs, ADRs, agent tooling, CI | **Done** |
| 1 | VMS core, UI, snapshot recording | **In progress** — 24h soak pending |
| 2 | Edge detection & event pipeline | Skeleton |
| 3 | Server analytics, incidents, search | Partial (optional compose) |

Details: [ai/current-state.md](ai/current-state.md), [docs/product/roadmap.md](docs/product/roadmap.md).

## License

TBD (private home project by default).
