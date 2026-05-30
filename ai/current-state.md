# Current state — Smart VMS

**Last updated:** 2026-05-24 (update after major merges or phase changes)

Living snapshot for AI sessions. **Do not treat chat history as source of truth** — read this + [features.md](../docs/product/features.md).

## What works (operator-visible)

| Area | Status | Notes |
|------|--------|-------|
| Login, admin/viewer | ✅ | Session cookie, rate limit |
| Copilot + workspaces | ✅ | Ollama + keyword intents |
| VAPIX live / snapshot | ✅ | Digest proxy, SSRF guard |
| LAN discovery + onboarding | ✅ | /24 scan, registry in localStorage |
| Snapshot recording + playback | ✅ | 30s JPEG, segments API, quota on server |
| Map + camera placement | ✅ | FOV wedges, auto-center on placed cameras |
| AOA configure via VAPIX | ✅ | Configuration → Cameras |
| Camera rename + vision suggest | ✅ | Ollama vision model auto-detect |
| Settings (VAPIX vault, storage) | ✅ | Quota synced to recording service |
| E2E + unit CI | ✅ | Playwright + Vitest; server job in CI |

## Partial / opt-in

| Area | Status | Gap |
|------|--------|-----|
| Phase 3 server | ⚠️ Optional | Needs `docker compose` + `SMARTVMS_SERVER_URL`; use pipeline smoke to verify |
| Incidents in UI | ⚠️ | Empty without server; poll every 30s |
| Tier-2 alarm narrative | ⚠️ Mock | Client-side rules only |
| Alarm rule persistence | ✅ | localStorage via `alarm-storage.ts` |
| Face workspace | ⚠️ Opt-in | Mock detections |
| Semantic search UI | ✅ | Video workspace + Copilot `q` param; server + VAPIX fallback |

## Known gaps (engineering)

| Priority | Item | Doc |
|----------|------|-----|
| P0 | 24h recording soak not signed off | **In progress** — `npm run soak:start` · [soak-test-24h.md](../docs/engineering/soak-test-24h.md) |
| P0 | TLS for production UI | ✅ Caddy + [tls-production.md](../docs/engineering/tls-production.md) |
| P1 | Live VAPIX event → MQTT/server | ⚠️ Web HTTP ingest + edge MQTT spike; full edge RTSP TBD |
| P1 | Dependabot / secret scan in CI | [security-roadmap.md](../docs/engineering/security-roadmap.md) |
| P1 | `shared/` schema validation in CI | [testing-strategy.md](../docs/engineering/testing-strategy.md) |
| P2 | Edge agent (stub only) | ⚠️ VAPIX poll + MQTT spike in `edge-agent/` |
| P2 | H.264 continuous recorder | Phase 1+ stretch |

## Recent major changes

- Recording quota + capture health wired to Settings API.
- Phase 3 server: Postgres, MQTT, webhook, UI proxy.
- AOA VAPIX proxy + Configuration UI.
- Map auto-center on placed cameras.
- Docs: quality bar, security roadmap, architecture overview sync.
- AI folder: persistent context structure (`ai/`).
- Event search in video workspace + Copilot (`q` param, server + VAPIX fallback).
- Live VAPIX event ingest service (stream/poll → `/api/events/ingest`).
- CI: Dependabot, gitleaks, shared schema validation.
- Alarm definitions persist in localStorage across reloads.
- Pipeline smoke test (CLI + Dashboard) for ingest → incidents → search.
- Edge agent VAPIX poll + MQTT publish spike.

## Next steps (suggested order)

1. **24h soak in progress** — monitor with `npm run soak:monitor`; sign off at T+24h in `docs/validation/`.
2. ~~**VAPIX live event ingest**~~ HTTP path shipped; optional MQTT bridge later.
3. ~~**Dependabot + gitleaks** in CI~~ Done.
4. ~~**`shared/` schema validation** in CI~~ Done.
5. ~~**Alarm persistence**~~ Done — localStorage.
6. ~~Phase 2: edge-agent ingest spike~~ VAPIX poll + MQTT shipped; RTSP/detector next.

## Broken / do not assume

- Root README phase table may lag — trust [roadmap.md](../docs/product/roadmap.md).
- `overview.md` target diagram includes future components; check “Shipped vs open” table.
- Dev server (`npm run dev`) is not a hardened 24/7 production daemon.

## Uncommitted work check

Before large changes, run `git status`. User prefers **explicit ask** before commit/push unless project rules say otherwise.
