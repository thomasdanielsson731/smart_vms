# Edge vs server analytics

## Decision frame

**Edge** optimizes for latency, bandwidth, and autonomy.  
**Server** optimizes for correlation, storage, heavy models, and operator UX.

When in doubt: **detect and filter at edge; understand and search at server.**

## Responsibility matrix

| Capability | Edge | Server | Notes |
|------------|:----:|:------:|-------|
| Decode RTSP / sample frames | ✓ | optional | Server may avoid decode if edge sends metadata only |
| Object detection (YOLO-class) | ✓ | re-run | Server re-run for appeals / model upgrade |
| Zone / line rules | ✓ | mirror config | Single source of truth for rules on server; pushed to edge |
| Native VAPIX event handling | ✓ | ingest | Motion, tampering, I/O — often cheaper than CV |
| Clip generation (pre/post roll) | ✓ | store | Edge has ring buffer proximity |
| Continuous 24/7 recording | optional | ✓ | Home v1: server-primary recording |
| Cross-camera tracking | | ✓ | Needs shared clock + correlation |
| Full-text / semantic search | | ✓ | Index on server |
| Model training | | ✓ (offline) | Not in hot path |
| Operator dashboards | | ✓ | |
| Alert notifications | ✓ (fast path) | ✓ (policy) | Edge may fire LAN webhook; server owns escalation |

## Data uplink policy

**Default:** uplink **events + thumbnails + alert clips**, not continuous HD streams.

| Data type | Typical size | Uplink |
|-----------|--------------|--------|
| Detection JSON | bytes–KB | Always |
| Thumbnail JPEG | tens KB | On detection or 1/min heartbeat |
| Alert clip (H.264) | MB | On incident |
| Live view relay | high | Only when user watches |
| Full continuous remote backup | very high | Opt-in only |

## Latency budgets (home LAN)

| Stage | Target (indicative) |
|-------|---------------------|
| Frame to edge inference | &lt; 200 ms (GPU) / &lt; 800 ms (CPU) |
| Rule match to clip start | &lt; 1 s |
| Event on bus to server persist | &lt; 500 ms |
| Server to push notification | &lt; 2 s end-to-end |

Measure in implementation; these are design targets not SLAs.

## Rule configuration flow

```text
Operator edits rules in UI (server)
    → versioned config document
    → signed push to edge agent
    → edge acknowledges version
    → server marks camera "synced"
```

Edge must run **last known good** rules if server unreachable.

## When to use Axis on-camera analytics

Consider **VAPIX events** or **ACAP** when:

- Scene is static and Axis motion/tampering is reliable
- Edge box is unavailable
- Power budget favors camera SoC

Consider **external edge CV** when:

- You need custom classes or zones Axis does not expose
- Multiple cameras share one GPU
- You want unified model versioning across models

**Proposed:** hybrid — subscribe to VAPIX events **and** run CV; dedupe in rule engine.

## Degradation ladder

1. Full edge CV + server incidents  
2. VAPIX-only events + server recording  
3. Recording + live view only (no AI alerts)  
4. Local camera recording (Axis SD) — out of product scope but ops fallback

Document operator-visible state per level in UI.
