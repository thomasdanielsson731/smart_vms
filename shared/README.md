# Shared contracts

Versioned event schemas and types used by **edge-agent**, **server**, and **web**.

| Path | Purpose |
|------|---------|
| `schemas/` | JSON Schema (source of truth) |
| `fixtures/` | Golden JSON validated in CI |
| `scripts/validate-schemas.mjs` | Contract validation (`npm test`) |
| `typescript/` | Generated / hand-maintained TS types for Node services |

Contract-first rule: change schema → bump `schema_version` → update consumers.

See [docs/architecture/data-model-and-events.md](../docs/architecture/data-model-and-events.md).
