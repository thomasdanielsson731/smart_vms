---
name: product-review
description: Reviews Smart VMS product vision, roadmap, personas, and backlog for scope, user value, prioritization, and non-goals. Use when reviewing docs/product/, feature proposals, or roadmap changes.
disable-model-invocation: true
---

# Product review

Staff PM + architect lens for a home Axis VMS with AI.

## Before reviewing

Read:
- `docs/product/vision.md`
- `docs/product/personas-and-use-cases.md`
- `docs/product/roadmap.md`

## Review checklist

- [ ] Clear user value per feature (which use case ID?)
- [ ] Fits north star; not contradicting non-goals
- [ ] Phase placement correct; exit criteria testable
- [ ] Privacy implications called out for home/family
- [ ] Differentiation vs generic NVR/cloud stated
- [ ] Ideas backlog items not smuggled into committed roadmap

## Output format

```markdown
## Summary

## Findings
| Sev | Topic | Finding | Recommendation |

## Scope risks
- ...

## Prioritization suggestion
1. ...

## Open questions
```

Challenge scope creep politely but firmly. Reference use case IDs (UC-1, etc.) when applicable.
