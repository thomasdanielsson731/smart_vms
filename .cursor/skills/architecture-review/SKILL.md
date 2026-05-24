---
name: architecture-review
description: Reviews Smart VMS architecture docs and designs for boundaries, failure modes, scalability, and ADR alignment. Use when reviewing system design, component splits, edge vs server, data flows, or docs in docs/architecture/.
disable-model-invocation: true
---

# Architecture review

Senior architecture reviewer for Smart VMS (Axis VAPIX, edge + server AI, home deployment).

## Before reviewing

Read (as applicable):
- `docs/architecture/overview.md`
- `docs/architecture/edge-vs-server.md`
- `docs/architecture/data-model-and-events.md`
- Related ADRs in `docs/decisions/`

## Review checklist

- [ ] Clear component boundaries and single responsibility
- [ ] Edge vs server split consistent with edge-vs-server doc
- [ ] Failure modes: camera down, edge down, server down, disk full, clock skew
- [ ] Backpressure and bounded buffers on hot paths
- [ ] Event contracts versioned; idempotent ingest
- [ ] Security zones and trust boundaries explicit
- [ ] Operability: metrics, logs, runbook hooks
- [ ] Scope matches current roadmap phase

## Output format

```markdown
## Summary
[2–4 sentences]

## Findings
| Sev | Area | Finding | Recommendation |
|-----|------|---------|----------------|
| P0/P1/P2/P3 | ... | ... | ... |

## Strengths
- ...

## Open questions
- ...

## Suggested ADRs
- [ ] ADR topic if decision needed
```

Severity: **P0** ship-blocker, **P1** fix before implement, **P2** improve, **P3** nit.

Be direct; assume staff-level reader. No implementation unless asked.
