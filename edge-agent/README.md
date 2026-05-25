# Edge agent (Phase 2)

Per-site ingest, lightweight inference, rule evaluation, and event uplink.

## Responsibilities

- RTSP or camera-native frame sampling
- Person / vehicle detection (configurable classes)
- Zone and schedule rules
- Ring buffer + clip extraction on rule match
- Publish normalized events to MQTT (see ADR-0002)

## Quick start (dev)

```bash
cd edge-agent
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
copy config.example.yaml config.yaml
python -m edge_agent --config config.yaml
```

## Status

**Proposed spike** — detector and ingest are stubs until RTSP fixtures exist.

See [docs/architecture/edge-vs-server.md](../docs/architecture/edge-vs-server.md).
