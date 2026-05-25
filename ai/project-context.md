# Project context — Smart VMS

**Status:** Decided — update only when vision, stack, or AI boundaries change (not every feature)

> Persistent context for AI agents. If this file and code disagree, **fix the drift** — do not guess from chat history.

## Vision (one paragraph)

Home/small-site **AI-native VMS** on **Axis (VAPIX)**. Edge detects; server correlates. Operators use a **chat-first UI** (Copilot) to open live video, forensic timeline, map, and config. Ship **event + clip**, not 24/7 offsite 4K. Full vision: [docs/product/vision.md](../docs/product/vision.md).

## Tech stack (current)

| Layer | Technology | Location |
|-------|------------|----------|
| Operator UI | React 19, Vite, TypeScript | `web/` |
| Dev “backend” | Vite plugins (auth, VAPIX, recording, proxies) | `web/vite.*.ts`, `web/server/` |
| Phase 3 server | Node, Postgres, MQTT | `server/`, `deploy/docker-compose.yml` |
| Edge (future) | Python stub | `edge-agent/` |
| Contracts | JSON Schema + TS | `shared/` |
| LLM (local) | Ollama / Qwen, vision for naming | `web/src/lib/ollama/` |
| Maps | Leaflet + OpenStreetMap | `web/src/components/map/` |
| Tests | Vitest, Playwright | `web/`, `server/` |
| CI | GitHub Actions | `.github/workflows/ci.yml` |

## Architecture principles

1. **VAPIX-first** — control plane on Axis APIs; RTSP is media only ([axis-vapix.md](../docs/architecture/axis-vapix.md)).
2. **Edge detects, server correlates** — uplink metadata + clips, not full-time remote 4K.
3. **Contract-first** — schemas in `shared/` before services; ADRs for irreversible choices.
4. **Privacy-by-default** — home deployment; face ID opt-in; indoor bbox off by default (target).
5. **Operability** — runbooks, soak tests, capture health, quota enforcement.

Diagram: [docs/architecture/overview.md](../docs/architecture/overview.md).

## Design & coding style

- Match [software-principles.md](../docs/engineering/software-principles.md).
- **Minimal diff** — smallest change for current roadmap phase.
- **English UI** — operator-facing strings in English.
- **Senior EM audience** — trade-off tables over tutorials; ADRs over long debates.
- Errors on ingest paths: **never silent swallow**.
- No secrets in repo; `.env.example` documents keys only.

## Quality & security bar (non-negotiable)

Read [quality-and-security-bar.md](../docs/engineering/quality-and-security-bar.md). Highlights:

- Recording path is **P0**.
- Auth on sensitive APIs; VAPIX vault server-side encrypted.
- SSRF allowlist on camera proxy.
- CI must pass before merge.

## Roadmap phase (scope gate)

**Current focus:** Phase 1 exit (24h soak) + Phase 3 integration hardening.

| Phase | Goal | Do not start without ADR / explicit ask |
|-------|------|----------------------------------------|
| 1 | VMS core + UI + snapshot recording | — |
| 2 | Edge detection + clip pipeline | Full CV on all cameras 24/7 |
| 3 | Server correlation, search, webhooks | Multi-tenant SaaS |
| 4 | HA, remote access, backup | Exposing UI on raw port-forward |

Full table: [roadmap.md](../docs/product/roadmap.md).

## What AI may change

| Allowed without asking | Requires explicit user request |
|------------------------|--------------------------------|
| Code/docs for current phase story | Commit / push to GitHub |
| Tests for changed behavior | Breaking API or schema |
| Fix bugs in touched files | New roadmap phase scope |
| Update `ai/current-state.md` after major work | Facial **identification** features |
| Mark doc sections Proposed vs Decided | `.env` or credential files |

## What AI must not do

- Commit secrets (`.env`, `.vapix.credentials.json`, camera passwords).
- Log RTSP URLs with credentials.
- Bypass tests or git hooks.
- Scope creep across roadmap phases in one PR/session.
- Replace Axis firmware or invent large backends without docs/ADR.

## Key entry points in code

| Area | Path |
|------|------|
| App config / cameras | `web/src/context/AppConfigContext.tsx` |
| VAPIX proxy | `web/vite.axis-proxy.ts`, `web/server/camera-proxy-shared.ts` |
| Recording | `web/vite.recording-plugin.ts`, `web/server/recording/` |
| AOA | `web/server/object-analytics.ts`, `CameraAoaSection.tsx` |
| Phase 3 proxy | `web/vite.server-proxy.ts`, `server/src/` |
| Copilot | `web/src/lib/chat-intents.ts`, `ollama/` |

## Maintainer

Senior software engineering manager — expects architecture literacy, explicit risks, and honest doc status.
