# ADR-0002: MQTT for event bus (Phase 2–3)

**Status:** Decided  
**Date:** 2026-05-25

## Context

Edge agents and the central server need a lightweight pub/sub channel for detection events, rule matches, and health signals on a home LAN.

## Decision

Use **MQTT** (Eclipse Mosquitto) as the Phase 2–3 event bus.

Topic layout: `smart-vms/events/{camera_id}/{event_type}`

## Alternatives considered

| Option | Pros | Cons |
|--------|------|------|
| **MQTT** | Simple, low footprint, good LAN tooling | No persistence by default |
| NATS | Strong ordering, JetStream persistence | Heavier ops for home |
| HTTP push | No broker | No fan-out; edge must know server URL |

## Consequences

- `edge-agent` publishes JSON envelopes matching `shared/schemas/event-envelope.schema.json`
- `server/` subscribes via `mqtt` npm package
- Persistence remains server-side (Postgres) — broker is transport only
- Revisit if multi-site or cloud relay requires NATS/JetStream (new ADR)
