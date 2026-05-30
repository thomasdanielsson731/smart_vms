# Edge agent (Phase 2)

Per-site ingest, lightweight inference, rule evaluation, and event uplink.

## Responsibilities

- VAPIX event poll (Phase 2 spike) → MQTT `vapix.received`
- RTSP frame sampling (stub until wired)
- Person / vehicle detection (stub)
- Ring buffer + clip extraction on rule match (future)
- Publish normalized events to MQTT (see ADR-0002)

## Quick start (dev)

```bash
cd deploy && docker compose up -d

cd edge-agent
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
copy config.example.yaml config.yaml

set AXIS_VAPIX_PASSWORD=your-camera-password
python -m edge_agent.cli --config config.yaml --smoke-publish
npm run pipeline:smoke --prefix ..
```

### VAPIX poll mode

In `config.yaml`:

```yaml
features:
  vapix_events: true
poll_interval_sec: 15
```

Set `AXIS_VAPIX_USER` / `AXIS_VAPIX_PASSWORD` (or `vapix.user` / env password in config).

```bash
python -m edge_agent.cli --config config.yaml
```

Events publish to `smart-vms/events/<camera_id>/vapix.received`. Phase 3 server subscribes and opens incidents.

## Tests

```bash
pip install -e ".[dev]"
pytest
```

## Status

**Phase 2 spike** — VAPIX poll + MQTT publish implemented; RTSP/detector remain stubs.

See [docs/engineering/pipeline-verification.md](../docs/engineering/pipeline-verification.md).
