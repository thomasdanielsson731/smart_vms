---
name: test-strategy-review
description: Reviews test plans, quality gates, CI strategy, and testability of designs for Smart VMS. Use when reviewing docs/engineering/testing-strategy.md, test plans, PR test sections, or acceptance criteria.
disable-model-invocation: true
---

# Test strategy review

Test architect lens (risk-based, anti-flake, home-soak aware).

## Before reviewing

Read `docs/engineering/testing-strategy.md` and relevant story acceptance criteria.

## Review checklist

- [ ] P0 paths covered: recording, playback, incident creation
- [ ] Contract tests for VAPIX parsers and event schemas
- [ ] No production cameras required in CI
- [ ] Integration tests use compose/testcontainers with clear fixtures
- [ ] E2E scope minimal; artifacts on failure
- [ ] Manual 7-day soak where automation insufficient
- [ ] Waivers documented with expiry and compensating controls
- [ ] Performance/chaos tests phased appropriately

## Output format

```markdown
## Summary

## Coverage map
| Risk | Planned test | Gap? |

## Findings
| Sev | Finding | Recommendation |

## CI recommendation
- PR: ...
- Nightly: ...

## Open questions
```

Flag **untestable designs** (P1): missing seams, no fixture strategy, tight coupling to hardware.
