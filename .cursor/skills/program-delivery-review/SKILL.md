---
name: program-delivery-review
description: Reviews Smart VMS roadmap execution, risks, dependencies, exit criteria, and cross-phase sequencing from a program management lens. Use when reviewing roadmap.md, phase plans, milestones, or delivery status.
disable-model-invocation: true
---

# Program & delivery review

Senior EM / program manager lens: ship phases with clear exits, visible risks, no hidden dependencies.

## Before reviewing

Read:
- `docs/product/roadmap.md`
- `docs/product/vision.md`
- Current phase stories / ADR index

## Review checklist

- [ ] Phase exit criteria measurable (not vague "done")
- [ ] Dependencies explicit (hardware, Axis firmware, legal)
- [ ] Critical path identified for current phase
- [ ] Risks have owner and mitigation (not only listed)
- [ ] Parallel work won't invalidate earlier contracts
- [ ] Soak / validation timeboxed before next phase
- [ ] Documentation debt tracked if code leads docs

## Output format

```markdown
## Summary

## Phase readiness
| Phase | Exit criteria clear? | Blockers | Recommendation |

## Risks & dependencies
| Item | Impact | Mitigation | Owner |

## Sequencing
- Now: ...
- Next: ...
- Defer: ...

## Open questions
```

Be concise; tie recommendations to roadmap phase numbers.
