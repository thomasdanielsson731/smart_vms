# Code review & drift detection

**Status:** Decided — use after significant AI sessions or before merge

Fill this when **not** invoking a formal `.cursor/skills/*` review, or as a supplement.

## Session metadata

| Field | Value |
|-------|-------|
| Date | |
| Scope (files/phase) | |
| Agent / human | |

## Architectural drift

| Check | OK? | Notes |
|-------|:---:|-------|
| Still VAPIX-first (not RTSP-only control) | | |
| Edge/server split respected | | |
| Phase scope only — no silent Phase N+1 | | |
| New external integration has fixture or ADR | | |
| `shared/` schema updated if events changed | | |
| Docs match code ([features.md](../../docs/product/features.md)) | | |

## Complexity & duplication

| Check | OK? | Notes |
|-------|:---:|-------|
| No drive-by refactors unrelated to task | | |
| Duplicated logic could be shared (justify if not) | | |
| New dependencies justified and pinned | | |
| File size still navigable (< ~400 lines per module?) | | |

## Performance regressions

| Check | OK? | Notes |
|-------|:---:|-------|
| Recording interval not blocked by sync work | | |
| No unbounded in-memory queues | | |
| Map/camera layers not re-init unnecessarily | | |
| Polling intervals reasonable (incidents 30s, usage 60s) | | |

## Security & privacy

| Check | OK? | Notes |
|-------|:---:|-------|
| [quality-and-security-bar.md](../../docs/engineering/quality-and-security-bar.md) for touched areas | | |
| No secrets in diff | | |
| Auth on new `/api/*` routes | | |

## Gameplay / operator feel (VMS)

| Check | OK? | Notes |
|-------|:---:|-------|
| Errors actionable in UI (not raw JSON) | | |
| Admin-only actions gated | | |
| Mock features labeled in UI/docs | | |

## Prompt / AI drift

| Check | OK? | Notes |
|-------|:---:|-------|
| `ai/current-state.md` still accurate | | |
| Copilot system prompt matches shipped features | | |
| New feature documented in `features.md` | | |
| Agent contracts still followed | | |

## Findings summary

| Sev | Finding | Action |
|-----|---------|--------|
| P0 | | |
| P1 | | |
| P2 | | |

## Sign-off

- [ ] Tests run (`npm test` web/server as applicable)
- [ ] Ready to merge / commit (human decision)
