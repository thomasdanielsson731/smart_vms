# Event pipeline agent brief

**Pair with:** `.cursor/skills/vapix-integration-review/SKILL.md`

## Mission

Design and implement **VAPIX → normalized event → bus → incident** paths without losing dedupe or clock semantics.

## Scope

- `web/server/recorded-events.ts` (historical/backtest today)
- `server/src/event-bus/`, `shared/schemas/`
- Future live subscription (WS/long-poll) — **not built**

## Checklist

- [ ] `SmartVmsEvent` schema version field
- [ ] `vapix_event_key` dedupe where applicable
- [ ] Idempotent ingest handlers
- [ ] Backpressure (bounded queue) — see `mqtt.ts`
- [ ] Golden fixtures in `web/fixtures/vapix/` or `shared/`

## Must not

- Log RTSP URLs with credentials
- Upload full video streams as “events”

## References

- [axis-vapix.md](../../docs/architecture/axis-vapix.md)
- [data-model-and-events.md](../../docs/architecture/data-model-and-events.md)
- ADR [0002-mqtt-event-bus.md](../../docs/decisions/0002-mqtt-event-bus.md)
