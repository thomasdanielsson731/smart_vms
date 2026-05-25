# Smart VMS — home deployment (Phase 2–4 dev stack)

**Status:** Proposed — for integration testing, not production hardening.

## Phase 3 stack (optional)

```bash
cd deploy
docker compose up -d
```

| Service | Port | Purpose |
|---------|------|---------|
| `mosquitto` | 1883 | MQTT event bus (ADR-0002) |
| `postgres` | 5432 | Incident metadata (ADR-0003) |
| `server` | 8787 | Incidents, search, health, webhook |

Enable the UI proxy in `web/.env`:

```env
SMARTVMS_SERVER_URL=http://127.0.0.1:8787
```

Restart `npm run dev` in `web/`. Dashboard **System health** and **Incidents** populate when the stack is up.

Publish test events:

```bash
mosquitto_pub -h 127.0.0.1 -t smart-vms/events/test -m '{"schema_version":"1.0","event_id":"evt-1","event_type":"rule.matched","occurred_at":"2026-05-24T12:00:00Z","source":{"camera_id":"cam-1"},"payload":{"title":"Test"}}'
```

## Phase 1 UI (always)

```bash
cd web && npm run dev
```

Recording, VAPIX proxy, and AOA configuration run in the Vite dev server. Optional: `SMARTVMS_RECORDING_DIR` for snapshot storage path.

## Backup (Phase 4)

- Postgres: `pg_dump` nightly to encrypted volume
- Recordings: rsync `recordings/` + manifest
- VAPIX vault: backup `.vapix.credentials.json` separately (encrypted)

See [../docs/engineering/runbooks/disk-full.md](../docs/engineering/runbooks/disk-full.md).
