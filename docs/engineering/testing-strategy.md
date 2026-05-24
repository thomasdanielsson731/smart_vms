# Testing strategy

Aligned with a senior EM background: **risk-based testing**, clear quality gates, automation where it earns its keep.

## Quality objectives

1. **Never lose trust in recording** — regressions here are P0.
2. **Correct incident semantics** — wrong alert is worse than no alert.
3. **Safe evolution** — schema and VAPIX parser changes are contract-tested.
4. **Sustainable CI** — fast PR feedback; heavy jobs nightly.

## Test pyramid (target)

```text
        ┌─────────────┐
        │  Manual /   │  Home soak, visual review of clips
        │  exploratory│
        ├─────────────┤
        │  E2E smoke  │  Playwright: login, live, one playback
        ├─────────────┤
        │ Integration │  API + DB + bus + MinIO testcontainers
        ├─────────────┤
        │  Contract   │  VAPIX fixtures, event schema validation
        ├─────────────┤
        │    Unit     │  Rules, parsers, pure logic
        └─────────────┘
```

## Layers in detail

### Unit tests

- Rule engine: zones, schedules, debounce, quiet hours
- Event normalization: Axis XML/JSON → `SmartVmsEvent`
- Time handling: UTC, DST edges (use explicit instants in tables)

### Contract tests

- JSON Schema or protobuf for `shared/` events
- Breaking change = version bump + consumer dual-read period
- Golden files for VAPIX responses per camera model label (e.g. `axis-p1465le-v1`)

### Integration tests

- Docker Compose: Postgres, MQTT/NATS, MinIO
- Ingest synthetic RTSP (short MP4 loop) or test stream server
- Verify: event persisted, clip object exists, incident created

### E2E smoke (minimal)

- Admin login → camera list → open live → play last hour segment
- Run on release tag and weekly schedule

### Non-functional (phase 4+)

- Load: sustained detections/sec on edge hardware profile
- Chaos: kill edge agent; assert recording continues
- Security: dependency scan, secret scan in CI

## Test data

| Asset | Location (future) | Notes |
|-------|-------------------|-------|
| VAPIX fixtures | `fixtures/vapix/` | Sanitized; no real IPs |
| Short video loops | `fixtures/video/` | Git LFS or download script |
| Synthetic detections | generated in tests | Don't commit large tensors |

## CI pipeline (proposed)

| Stage | On PR | Nightly |
|-------|:-----:|:-------:|
| Lint + unit | ✓ | ✓ |
| Contract | ✓ | ✓ |
| Integration | optional (label) | ✓ |
| E2E smoke | | ✓ |
| Model benchmark | | ✓ (when models exist) |

**Decided (Phase 1 UI):** Vitest unit and contract tests live in `web/` — `npm run test` (see `.github/workflows/ci.yml`). Golden VAPIX fixture: `web/fixtures/vapix/param-list.txt`.

## Manual home validation

**7-day soak checklist** (per phase):

- [ ] All cameras recorded without gap &gt; X minutes
- [ ] Alert sample reviewed (precision/recall notes)
- [ ] Disk usage within forecast
- [ ] Reboot edge + server; system self-heals

Keep results in `docs/validation/` as dated markdown (optional).

## Test expert lens: what to avoid

- 100% coverage targets on UI boilerplate
- Flaky e2e without retry policy and artifact capture (screenshot, HAR)
- Tests that hit production cameras from CI
- Snapshot tests of huge XML blobs without filtering

## Waivers

Waiving tests requires:

- Story ID / link
- Reason and expiration date
- Compensating control (manual checklist)

Record in PR description; not in silent comments.
