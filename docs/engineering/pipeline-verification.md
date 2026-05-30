# Pipeline verification

**Status:** Decided — smoke tests for Phase 3 ingest → incidents → search.

## CLI (server direct)

Requires Phase 3 stack (`deploy/docker-compose.yml`) and `server` running on port 8787:

```bash
npm run pipeline:smoke
# or
node scripts/pipeline-smoke.mjs
```

Steps:

1. `GET /api/health/system`
2. `POST /api/events/ingest` (synthetic `vapix.received`)
3. `GET /api/incidents?q=<marker>`
4. `GET /api/events/search?q=<marker>`

## UI (via Vite proxy)

1. Set `SMARTVMS_SERVER_URL=http://127.0.0.1:8787` in `web/.env`
2. Open **Dashboard** as admin
3. Click **Run smoke test** in the Event pipeline panel

## Edge agent → MQTT → server

```bash
cd deploy && docker compose up -d
cd ../edge-agent
pip install -e .
set AXIS_VAPIX_PASSWORD=...
python -m edge_agent.cli --config config.example.yaml --smoke-publish
npm run pipeline:smoke
```

VAPIX poll mode: set `features.vapix_events: true` in `config.yaml` and run the agent.

## Related

- [deploy/README.md](../../deploy/README.md)
- [edge-vs-server.md](../architecture/edge-vs-server.md)
