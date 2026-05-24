# Architecture Decision Records (ADRs)

We document significant decisions here using a lightweight ADR format. Inspired by Michael Nygard's ADR process.

## When to write an ADR

- Choosing message broker, database, or object store
- Breaking event schema or public API
- Security model change (auth, remote access)
- Using ACAP vs external edge for primary analytics
- Anything you'd debate in an architecture review

## Status values

| Status | Meaning |
|--------|---------|
| Proposed | Under discussion |
| Accepted | Implement against this |
| Deprecated | Superseded |
| Superseded by ADR-NNNN | Link to replacement |

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| — | *(add next ADR as 0002-...)* | |

## Template

Copy [0001-record-architecture-decisions.md](0001-record-architecture-decisions.md) structure for new files:

`NNNN-short-title.md`

## Naming

- `0002-event-bus-mqtt.md`
- `0003-live-view-webrtc.md`

Keep titles short; debate belongs in the body.
