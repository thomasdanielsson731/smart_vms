# Data model and events

**Status:** Decided — schemas in `shared/`; see [shared/README.md](../../shared/README.md).

## Design goals

- **Versioned** schemas (`schema_version` field)
- **Immutable events** — corrections append new facts; do not mutate history
- **Correlation** — `incident_id`, `camera_id`, `trace_id` across edge and server
- **Privacy** — no raw face embeddings in v1; bbox optional per policy

## Entity relationships

```text
Site (1) ──< Camera (N)
Camera (1) ──< RecordingSegment (N)
Camera (1) ──< DetectionEvent (N)
DetectionEvent (*) ──> Incident (0..1)
Incident (1) ──< Clip (N)
Rule (N) ──< Camera (N)   [many-to-many via assignment]
```

## Identifiers

| Field | Format | Owner |
|-------|--------|-------|
| `camera_id` | UUID | Server registry |
| `edge_node_id` | UUID | Server registry |
| `event_id` | UUID v7 (time-sortable) | Originator |
| `vapix_event_key` | string | Axis dedupe |
| `incident_id` | UUID | Server |
| `clip_id` | UUID | Server |

## Event envelope (all messages)

```json
{
  "schema_version": "1.0",
  "event_id": "01J...",
  "event_type": "detection.created",
  "occurred_at": "2026-05-24T12:00:00.000Z",
  "ingested_at": "2026-05-24T12:00:00.050Z",
  "source": {
    "camera_id": "uuid",
    "edge_node_id": "uuid",
    "software_version": "edge-agent/0.1.0"
  },
  "trace_id": "optional-correlation",
  "payload": {}
}
```

## Event types (v1 set)

| event_type | Producer | Purpose |
|------------|----------|---------|
| `vapix.received` | Edge or server | Normalized Axis event |
| `detection.created` | Edge | CV detection frame summary |
| `rule.matched` | Edge | Rule fired (may precede incident) |
| `incident.opened` | Server | Operator-facing alert |
| `incident.updated` | Server | Ack, comment, severity change |
| `incident.closed` | Server | Resolved |
| `clip.available` | Server | Object stored; playback ready |
| `camera.health.changed` | Edge/server | Up/down/degraded |
| `config.rules.applied` | Edge | Ack rule version |

## Detection payload (example)

```json
{
  "frame_ts": "2026-05-24T12:00:00.000Z",
  "model": { "name": "yolov8n", "version": "2026.05.1" },
  "objects": [
    {
      "class": "person",
      "confidence": 0.91,
      "bbox_norm": [0.12, 0.34, 0.08, 0.22],
      "track_id": "optional-short-lived"
    }
  ],
  "zone_ids": ["driveway"]
}
```

`bbox_norm` is relative 0–1 to reduce resolution coupling.

## Incident payload (example)

```json
{
  "title": "Person in driveway (after hours)",
  "severity": "medium",
  "rule_id": "uuid",
  "rule_version": 3,
  "status": "open",
  "linked_event_ids": ["01J...", "01K..."],
  "clip_ids": ["uuid"]
}
```

## Clip metadata

```json
{
  "clip_id": "uuid",
  "camera_id": "uuid",
  "start_ts": "...",
  "end_ts": "...",
  "storage_uri": "s3://smart-vms/clips/...",
  "sha256": "...",
  "bytes": 1234567,
  "codec": "h264"
}
```

## Ordering and deduplication

- Bus partition key: `camera_id` (per-camera ordering)
- Dedupe window for `vapix_event_key`: propose 5s (ADR)
- `event_id` uniqueness enforced at ingest (idempotent consumers)

## Retention (policy-driven)

| Entity | Default home policy (proposed) |
|--------|--------------------------------|
| DetectionEvent | 30 days metadata |
| Incident + Clip | 14 days unless pinned |
| RecordingSegment | 7–30 days per camera tier |
| Audit log | 90 days |

Operator overrides per camera; legal hold flag future.

## Indexing for search

Minimum index fields:

- `occurred_at`, `camera_id`, `class`, `zone_id`, `incident.status`

Full-text on `incident.title` and operator notes optional.

## Schema evolution

- Minor: add optional fields, same `schema_version`
- Major: bump version; consumers support N and N-1 during migration

Record breaking changes in ADR + migration script plan.
