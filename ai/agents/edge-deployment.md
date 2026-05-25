# Edge deployment agent brief

## Mission

Phase 2 edge agent and deploy paths — ingest, inference, MQTT publish — without breaking Phase 1 Vite operator path.

## Today

- `edge-agent/` stub (ingest/detector return empty)
- `deploy/docker-compose.yml` for Phase 3 server stack

## Checklist for new edge work

- [ ] Config via `edge-agent/config.example.yaml` only — no secrets in repo
- [ ] Events match `shared/schemas/event-envelope.schema.json`
- [ ] Backpressure documented
- [ ] Operator can still use UI if edge box down

## References

- [edge-vs-server.md](../../docs/architecture/edge-vs-server.md)
- [deploy/README.md](../../deploy/README.md)
