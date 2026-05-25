# Smart VMS server (Phase 3)

Central API, MQTT ingress, Postgres incident store, metadata search, and webhooks.

Phase 1 snapshot recording still runs in Vite plugins (`web/server/recording/`).

## Quick start (dev)

With Docker stack:

```bash
cd deploy && docker compose up -d
cd ../server && npm install && npm run dev
```

In `web/.env`:

```env
SMARTVMS_SERVER_URL=http://127.0.0.1:8787
```

Default port: **8787**. Health: `GET /health`.

## Modules

| Module | Status |
|--------|--------|
| `event-bus/` | MQTT subscriber with bounded queue |
| `incidents/` | Postgres store + in-memory fallback |
| `notifications/` | Webhook on new incident |
| `http/` | Incidents, search, ingest, health |

See [deploy/README.md](../deploy/README.md) and [docs/decisions/0003-postgres-incident-store.md](../docs/decisions/0003-postgres-incident-store.md).
