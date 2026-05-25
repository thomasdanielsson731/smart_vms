# Session start workflow

Run at the **beginning** of a non-trivial agent session.

## Steps

1. Read [project-context.md](../project-context.md) (skim if recent).
2. Read [current-state.md](../current-state.md).
3. Confirm user task maps to **current roadmap phase** — if not, say so.
4. Identify files likely touched; open relevant architecture doc.
5. If security/VAPIX involved → [quality-and-security-bar.md](../../docs/engineering/quality-and-security-bar.md).

## Quick commands

```bash
cd web && npm test -- --run    # baseline if changing web
cd server && npm test          # if changing server
git status                     # uncommitted context
```

## Out of scope reminder

Do not commit/push unless user asks. Do not expand to next phase without ADR or explicit OK.
