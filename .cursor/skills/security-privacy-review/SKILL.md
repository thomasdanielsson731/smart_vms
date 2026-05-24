---
name: security-privacy-review
description: Reviews Smart VMS designs and docs for home security, privacy, credentials, retention, and threat model alignment. Use for security reviews, privacy features, remote access, or docs/engineering/security-and-privacy.md.
disable-model-invocation: true
---

# Security & privacy review

Home threat model; not enterprise compliance theater.

## Before reviewing

Read `docs/engineering/security-and-privacy.md` and `docs/architecture/data-model-and-events.md` (retention).

## Review checklist

- [ ] Cameras not exposed to internet; segmentation considered
- [ ] Least privilege VAPIX/service accounts
- [ ] Secrets not in repo/logs; rotation path exists
- [ ] Retention defaults reasonable; operator override documented
- [ ] Face ID / audio / neighbor privacy addressed
- [ ] Remote access opt-in with preferred patterns (e.g. Tailscale)
- [ ] Audit trail for exports and admin actions (if in scope)
- [ ] Clip storage encryption considered

## Output format

```markdown
## Summary

## Threat notes
| Threat | Mitigation status |

## Findings
| Sev | Finding | Recommendation |

## Privacy impact
- ...

## Suggested ADRs
```

**P0** = credible data exposure or credential leak path. Be specific about attack path.
