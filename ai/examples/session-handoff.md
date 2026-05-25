# Session handoff example

**Scenario:** Agent stops mid Phase 3 wiring; next session must continue without chat history.

## What next agent reads

1. `ai/current-state.md` — “Partial / opt-in” Phase 3 table
2. `ai/project-context.md` — scope gate
3. `git status` — uncommitted files

## Handoff note (paste at top of current-state or PR)

```markdown
### Handoff 2026-05-24
- Done: server package-lock, recording quota API, map auto-center
- In progress: none (clean tree)
- Next: 24h soak OR VAPIX live ingest ADR
- Blocked: none
- Tests: web 214/214, server 4/4, E2E 44/44 (last run)
```

## Anti-pattern

❌ “Continue where we left off” with no file updates  
✅ Update `current-state.md` + checklist in handoff
