# Smart VMS — home deployment (Phase 2–4 dev stack)

**Status:** Proposed — for integration testing, not production hardening.

```bash
cd deploy
docker compose up -d
```

Services:

| Service | Port | Purpose |
|---------|------|---------|
| `mosquitto` | 1883 | MQTT event bus (ADR-0002) |
| `postgres` | 5432 | Incident metadata (ADR-0003) |
| `server` | 8787 | Central API stub |

Phase 1 UI still runs via `cd web && npm run dev`. Point edge agent MQTT at `127.0.0.1:1883`.

## Backup (Phase 4)

- Postgres: `pg_dump` nightly to encrypted volume
- Recordings: rsync `recordings/` + manifest
- VAPIX vault: backup `.vapix.credentials.json` separately (encrypted)

See [../docs/engineering/runbooks/disk-full.md](../docs/engineering/runbooks/disk-full.md).
