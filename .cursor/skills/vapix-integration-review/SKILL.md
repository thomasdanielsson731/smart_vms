---
name: vapix-integration-review
description: Reviews Axis VAPIX integration designs and code for capability discovery, events, streams, auth, deduplication, and firmware variance. Use before implementing VAPIX clients, event subscriptions, or camera registry.
disable-model-invocation: true
---

# VAPIX integration review

Axis-specific integration reviewer.

## Before reviewing

Read `docs/architecture/axis-vapix.md` and event model for `vapix.received` / dedupe fields.

## Review checklist

- [ ] Capability probe before subscribe (no one-model assumptions)
- [ ] Service account isolation; auth scheme appropriate
- [ ] Event normalization + `vapix_event_key` dedupe
- [ ] Stream profile selection documented (main vs sub)
- [ ] Connection/subscription limits respected
- [ ] Clock skew handling
- [ ] TLS/trust documented for local HTTPS
- [ ] Golden fixtures + contract tests planned
- [ ] Hybrid CV + VAPIX fusion rules clear

## Output format

```markdown
## Summary

## Findings
| Sev | Area | Finding | Recommendation |

## Firmware / model risks
- ...

## Test plan (VAPIX)
- Fixtures: ...
- Manual on hardware: ...

## Open questions
```

Reference Axis API surfaces by name (Parameter, Event, etc.) without inventing unsupported endpoints.
