# Observability and operations

Home-scale SRE practices: enough telemetry to debug at 2 AM without running Datadog cost.

## Three pillars (proportionate)

| Pillar | Home implementation |
|--------|---------------------|
| **Logs** | Structured JSON to files; optional Loki later |
| **Metrics** | Prometheus exposition; Grafana dashboard optional |
| **Traces** | `trace_id` in logs first; OpenTelemetry when multi-service |

## Required log fields (implementation)

- `timestamp`, `level`, `service`, `message`
- `camera_id`, `edge_node_id`, `incident_id`, `event_id` when applicable
- `trace_id` across edge → bus → server

## Key metrics

| Metric | Why |
|--------|-----|
| `camera_stream_up` | Recording health |
| `vapix_last_event_age_seconds` | Event pipeline stall |
| `inference_latency_ms` | AI degradation |
| `event_bus_lag_seconds` | Backpressure |
| `clip_upload_failures_total` | Evidence loss |
| `disk_free_bytes` | Retention enforcement |

## Alerts (operator-facing)

Alert on **symptoms**, not every error log:

- Camera down &gt; 5 min
- Disk &lt; 10% free
- No detections on active camera &gt; 24h (configurable — may be expected)
- Edge config drift (rule version mismatch)

## Runbooks (starter list)

Create in `docs/runbooks/` when implementing:

| Runbook | Trigger |
|---------|---------|
| `camera-offline.md` | stream_up == 0 |
| `disk-full.md` | low disk |
| `edge-agent-restart.md` | high inference errors |
| `vapix-auth-failure.md` | 401 from camera |

Template:

```markdown
# Runbook: Title
## Symptoms
## Immediate actions
## Diagnostics (commands)
## Recovery
## Escalation (if any)
```

## Backups

- Config export (cameras, rules) — small, frequent
- Clip/segment backup — operator opt-in; document restore drill yearly

## Upgrades

- Pin versions in compose/k8s manifests
- Pre-upgrade: export config; snapshot DB
- Post-upgrade: smoke test checklist from testing strategy

## Capacity planning (rough)

Estimate per camera:

- Recording: Mbps × retention days → TB
- Events: KB/day × cameras → negligible
- Clips: incidents/day × avg clip MB → dominant variable

Spreadsheet optional; formula in roadmap risks.
