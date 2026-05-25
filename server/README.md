# Smart VMS server (Phase 3)

Central API, event bus ingress, incident store, and recording orchestration.

Phase 1 recording still runs in the Vite dev/preview plugins (`web/server/recording/`). This package is the migration target for Phase 3.

## Quick start (dev)

```bash
cd server
npm install
npm run dev
```

Default port: **8787**. Health: `GET /health`.

## Modules

| Module | Status |
|--------|--------|
| `event-bus/` | MQTT subscriber stub |
| `incidents/` | In-memory store + Postgres interface |
| `notifications/` | Webhook stub (Phase 3) |

See [docs/architecture/overview.md](../docs/architecture/overview.md).
