# ADR-0003: PostgreSQL for incidents and metadata (Phase 3)

**Status:** Decided  
**Date:** 2026-05-25

## Context

Incidents, detection metadata, and audit trails need durable storage beyond browser localStorage and flat files.

## Decision

Use **PostgreSQL 16** for relational metadata in Phase 3. Clips and continuous recording segments stay on **local filesystem or S3-compatible object storage**.

## Schema (initial)

- `cameras`, `edge_nodes`, `incidents`, `events`, `clips`, `recording_segments`
- Partition or index `events.occurred_at` for timeline queries

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| SQLite only | Acceptable for single-user home v1 server; Postgres chosen for concurrent writers (edge + UI) |
| MongoDB | Event envelope is relational; joins with incidents/clips |

## Consequences

- `deploy/docker-compose.yml` includes Postgres
- Phase 1 recording manifest remains file-based until migration script exists
- Server `InMemoryIncidentStore` is replaced by Postgres repository
