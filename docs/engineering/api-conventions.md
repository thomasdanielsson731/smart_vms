# API conventions (Phase 1 web server)

**Status:** Decided — implemented in Vite middleware plugins (`web/vite.*.ts`)

Phase 1 exposes APIs from the **Vite dev/preview server**, not a separate backend process. Phase 3+ may extract to `server/` with the same contracts.

## Base rules

| Rule | Detail |
|------|--------|
| Prefix | All APIs under `/api/` |
| Auth | Session cookie except `/api/auth/login`, `/api/auth/status` |
| Format | JSON bodies; `Content-Type: application/json` |
| Errors | `{ "error": "<code>", "message": "<human text>" }` |
| Cache | `Cache-Control: no-store` on auth and camera routes |

## Authentication API

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/login` | No | Username/password → session cookie |
| POST | `/api/auth/logout` | Yes | Clear session |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/auth/status` | No | Whether auth is configured |

Roles: `admin` (full write) · `viewer` (read-only, no onboarding/alarm create)

See [authentication.md](authentication.md).

## VAPIX configuration API

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/api/config/vapix` | Any authenticated | Public view (user, configured, source) |
| PUT | `/api/config/vapix` | Admin | Save shared camera credentials |
| DELETE | `/api/config/vapix` | Admin | Clear stored credentials |

Password never returned in GET. Stored encrypted in `.vapix.credentials.json`.

## Camera proxy API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/camera/:host/mjpg` | MJPEG live stream |
| GET | `/api/camera/:host/snapshot` | JPEG snapshot |
| GET | `/api/camera/:host/stream-test` | Connectivity + auth test |
| GET | `/api/camera/:host/device-info` | Model, firmware, serial (JSON) |
| * | `/api/camera/:host/web/**` | Embedded Axis web UI proxy |

`:host` must be a **private LAN IPv4** address (SSRF guard).

Digest authentication uses shared VAPIX credentials server-side.

## Ollama proxy

| Path | Purpose |
|------|---------|
| `/api/ollama/*` | Proxied to local Ollama (default `127.0.0.1:11434`) |

Requires Smart VMS session. Configured via `VITE_OLLAMA_*` in `.env`.

## Error codes (common)

| Code | HTTP | Meaning |
|------|------|---------|
| `unauthenticated` | 401 | Missing or expired session |
| `forbidden` | 403 | Viewer on admin route |
| `host_not_allowed` | 403 | Camera IP outside LAN allowlist |
| `missing_credentials` | 503 | No VAPIX user/password configured |
| `auth_failed` | 200* | Camera rejected digest (*stream-test body) |

## Future (Phase 3)

When `server/` exists:

- OpenAPI spec in `shared/openapi/`
- Version prefix `/api/v1/` if breaking changes
- WebSocket for live events and tier-2 streaming
- Idempotent event ingest with `event_id` dedupe

See [../architecture/data-model-and-events.md](../architecture/data-model-and-events.md).

## Client usage

- Always `credentials: 'same-origin'` on `fetch`
- Do not store VAPIX passwords in browser storage
- Camera hosts in app config (localStorage) — IPs only, not secrets
