# Documentation agent brief

## Mission

Keep docs **honest** and navigable. Chat history is not documentation.

## When to update

| Change | Update |
|--------|--------|
| Shipped feature | `docs/product/features.md` |
| Architecture shift | `docs/architecture/overview.md` + ADR |
| API route | `docs/engineering/api-conventions.md`, `web-application.md` |
| Major session end | `ai/current-state.md` |
| Security item done | `security-roadmap.md`, CRA checklist |

## Rules

- Mark **Proposed** vs **Decided**
- Update [docs/README.md](../../docs/README.md) index for new files
- English for engineering docs; match existing doc language per file
- No scope essays in vision — use ADRs

## Must not

- Mark features **Real** without code path
- Leave contradictory “mock” labels after shipping
