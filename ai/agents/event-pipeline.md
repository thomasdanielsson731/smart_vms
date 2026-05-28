# Event pipeline agent brief

**Pair with:** `.cursor/skills/vapix-integration-review/SKILL.md`

## Mission

Design and implement **VAPIX → normalized event → bus → incident** paths without losing dedupe or clock semantics.

## Scope

- `web/server/recorded-events.ts` (historical/backtest today)
- `web/server/vapix-event-ingest-service.ts` (live stream/poll → server HTTP ingest)
- `server/src/event-bus/`, `shared/schemas/`
- Future: MQTT publish bridge from web ingest (optional)

## Checklist

- [x] `SmartVmsEvent` schema version field
- [x] `vapix_event_key` dedupe where applicable (5s window)
- [x] Idempotent ingest handlers (`stableEventId` + server ON CONFLICT)
- [x] Live VAPIX stream with poll fallback
- [ ] Backpressure on web→server HTTP (retry queue — future)
- [ ] Golden fixtures in `web/fixtures/vapix/` or `shared/`

## Must not

- Log RTSP URLs with credentials
- Upload full video streams as “events”

## References

- [axis-vapix.md](../../docs/architecture/axis-vapix.md)
- [data-model-and-events.md](../../docs/architecture/data-model-and-events.md)
- ADR [0002-mqtt-event-bus.md](../../docs/decisions/0002-mqtt-event-bus.md)
