# ADR 0001: Record architecture decisions

**Status:** Accepted  
**Date:** 2026-05-24  
**Deciders:** Project owner  

## Context

Smart VMS is a multi-phase system (Axis VAPIX, edge AI, server analytics). Choices will accumulate. We need a durable record that outlives chat sessions and onboarding of future contributors (human or AI).

## Decision

We will use Architecture Decision Records in `docs/decisions/`:

- One file per decision, numbered sequentially
- Status field updated when decisions change
- Supersede rather than silently edit accepted ADRs

Product vision in `docs/product/` remains stable; **implementation forks** are captured in ADRs.

## Consequences

**Positive**

- AI and human agents can read explicit decisions
- Reviews reference ADR instead of re-debating basics

**Negative**

- Small overhead to write ADRs — mitigated by template

## Template for new ADRs

```markdown
# ADR NNNN: Title

**Status:** Proposed | Accepted | Deprecated  
**Date:** YYYY-MM-DD  
**Deciders:** Names  

## Context
What is the issue?

## Decision
What is the change?

## Consequences
Positive and negative outcomes.
```
