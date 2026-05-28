# Smart VMS — documentation index

Start with [product/overview.md](product/overview.md) for a product summary, [architecture/overview.md](architecture/overview.md) for system design, and [engineering/README.md](engineering/README.md) for how we build.

## Agent guide

- [../AGENTS.md](../AGENTS.md) — Cursor / AI entry point
- [../ai/README.md](../ai/README.md) — persistent context, agents, workflows, feedback

## Product

| Index | [product/README.md](product/README.md) |
|-------|----------------------------------------|

- [overview.md](product/overview.md) — product summary, pillars, journeys
- [vision.md](product/vision.md) — north star, differentiation, non-goals
- [features.md](product/features.md) — feature catalog (real vs mock)
- [personas-and-use-cases.md](product/personas-and-use-cases.md) — who and what problems
- [roadmap.md](product/roadmap.md) — phased delivery
- [ui-phase1.md](product/ui-phase1.md) — operator UI scope (Phase 1)
- [ux-ai-first.md](product/ux-ai-first.md) — chat-first UX, workspaces, agents
- [storage-quota.md](product/storage-quota.md) — recording disk limits
- [forensic.md](product/forensic.md) — forensic timeline and alarm review
- [map-view.md](product/map-view.md) — map, camera placement, field of view
- [face-recognition.md](product/face-recognition.md) — face recognition (opt-in)
- [alarm-tier2-analytics.md](product/alarm-tier2-analytics.md) — tier-2 post-alarm analysis
- [camera-web-ui.md](product/camera-web-ui.md) — embedded Axis web interface
- [multi-config.md](product/multi-config.md) — bulk onboarding and alarms
- [ideas-backlog.md](product/ideas-backlog.md) — unprioritized ideas

## Architecture

| Index | [architecture/README.md](architecture/README.md) |
|-------|-----------------------------------------------------|

- [overview.md](architecture/overview.md) — full-system components and flows
- [web-application.md](architecture/web-application.md) — Phase 1 React + Vite app
- [edge-vs-server.md](architecture/edge-vs-server.md) — analytics responsibility split
- [axis-vapix.md](architecture/axis-vapix.md) — Axis VAPIX integration
- [data-model-and-events.md](architecture/data-model-and-events.md) — events, clips, metadata
- [trust-boundaries.md](architecture/trust-boundaries.md) — security zones (home)
- [deployment-home.md](architecture/deployment-home.md) — home LAN topology by phase

## Engineering

| Index | [engineering/README.md](engineering/README.md) |
|-------|-----------------------------------------------|

- [quality-and-security-bar.md](engineering/quality-and-security-bar.md) — non-negotiable quality & security bar
- [software-principles.md](engineering/software-principles.md) — how we build
- [security-roadmap.md](engineering/security-roadmap.md) — prioritized security backlog
- [development-workflow.md](engineering/development-workflow.md) — setup, commands, DoD
- [testing-strategy.md](engineering/testing-strategy.md) — quality bars and layers
- [code-review.md](engineering/code-review.md) — PR review checklist
- [api-conventions.md](engineering/api-conventions.md) — Phase 1 `/api/*` contracts
- [security-and-privacy.md](engineering/security-and-privacy.md) — home threat model
- [soak-test-24h.md](engineering/soak-test-24h.md) — Phase 1 exit soak checklist
- [tls-production.md](engineering/tls-production.md) — HTTPS reverse proxy (Caddy)
- [remote-access.md](engineering/remote-access.md) — Tailscale pattern (Phase 4)
- [runbooks/camera-offline.md](engineering/runbooks/camera-offline.md)
- [runbooks/disk-full.md](engineering/runbooks/disk-full.md)
- [cyber-resilience-act.md](engineering/cyber-resilience-act.md) — EU CRA alignment
- [observability-and-ops.md](engineering/observability-and-ops.md) — logs, metrics, runbooks
- [axis-live-stream.md](engineering/axis-live-stream.md) — MJPEG proxy
- [ollama-copilot.md](engineering/ollama-copilot.md) — local Qwen via Ollama

## Decisions (ADRs)

- [decisions/README.md](decisions/README.md) — index and template
- [0001-record-architecture-decisions.md](decisions/0001-record-architecture-decisions.md) — ADR process

## Agent guide

- [../AGENTS.md](../AGENTS.md) — instructions for AI and human contributors
