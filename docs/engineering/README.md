# Engineering practices — index

**Status:** Decided — norms for humans and AI contributors

This folder defines **how** Smart VMS is built. Product docs define **what**; architecture docs define **structure**.

## Core documents

| Document | Purpose |
|----------|---------|
| [software-principles.md](software-principles.md) | Design values, Definition of Done, anti-patterns |
| [development-workflow.md](development-workflow.md) | Setup, commands, env, daily dev |
| [testing-strategy.md](testing-strategy.md) | Test pyramid, CI, fixtures |
| [code-review.md](code-review.md) | PR / AI review checklist |
| [api-conventions.md](api-conventions.md) | Phase 1 `/api/*` contracts |

## Security & compliance

| Document | Purpose |
|----------|---------|
| [security-and-privacy.md](security-and-privacy.md) | Home threat model, defaults |
| [authentication.md](authentication.md) | Sessions, roles, login |
| [cyber-resilience-act.md](cyber-resilience-act.md) | EU CRA alignment |

## Integrations

| Document | Purpose |
|----------|---------|
| [axis-live-stream.md](axis-live-stream.md) | MJPEG proxy, troubleshooting |
| [ollama-copilot.md](ollama-copilot.md) | Local LLM setup |

## Operations

| Document | Purpose |
|----------|---------|
| [observability-and-ops.md](observability-and-ops.md) | Logs, metrics, runbooks (target) |

## Decision records

Irreversible choices → [../decisions/](../decisions/) (ADRs), not long debates in principles docs.

## AI contributors

1. Read [../../AGENTS.md](../../AGENTS.md) first
2. Follow [software-principles.md](software-principles.md) §9
3. Invoke review skills before large changes
4. Mark speculative doc sections **Proposed** vs **Decided**

## Quality gates (current)

| Gate | Command / location |
|------|-------------------|
| Unit + contract tests | `npm run test` in `web/` |
| Typecheck + build | `npm run build` |
| CI | `.github/workflows/ci.yml` |
| Lint | `npm run lint` (informational until clean) |
