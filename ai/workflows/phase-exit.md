# Phase exit workflow

Use when closing a **roadmap phase** (see [roadmap.md](../../docs/product/roadmap.md)).

## Phase 1 exit (current)

### Evidence

- [ ] [soak-test-24h.md](../../docs/engineering/soak-test-24h.md) completed — log in `docs/validation/`
- [ ] Runbooks: [camera-offline](../../docs/engineering/runbooks/camera-offline.md), [disk-full](../../docs/engineering/runbooks/disk-full.md)
- [ ] CI green: web + server + E2E
- [ ] [features.md](../../docs/product/features.md) accurate

### Reviews

- [ ] `program-delivery-review` skill on exit criteria
- [ ] `security-privacy-review` on auth + proxy + vault
- [ ] Fill [release-retro.md](../feedback/release-retro.md)

### Docs

- [ ] Update [current-state.md](../current-state.md)
- [ ] Mark phase **Complete** in roadmap
- [ ] Update root [README.md](../../README.md) status table

## Phase 2+ 

Extend checklist from roadmap exit criteria + ADRs before starting implementation.
