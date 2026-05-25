# Agent roster — Smart VMS

Maps **specialized roles** to Cursor skills and `ai/agents` briefs. Invoke review skills explicitly; implementer agent reads role briefs when doing that kind of work.

## Core agents (all project types)

| Role | Skill (review) | Brief (implement) | Use when |
|------|----------------|-----------------|----------|
| **Architect** | `architecture-review` | [architect.md](architect.md) | Boundaries, ADRs, failure modes |
| **Documentation** | — | [documentation.md](documentation.md) | Docs drift, indexes, Proposed/Decided |
| **Debug** | — | [debug.md](debug.md) | Repro, root cause, minimal fix |
| **Refactor** | — | [refactor.md](refactor.md) | Safe structural cleanup in scope |
| **Test strategy** | `test-strategy-review` | [test-strategy.md](test-strategy.md) | CI, pyramid, soak plans |

## VMS / video analytics agents

| Role | Skill (review) | Brief (implement) | Use when |
|------|----------------|-----------------|----------|
| **Event pipeline** | `vapix-integration-review` | [event-pipeline.md](event-pipeline.md) | VAPIX events, MQTT, dedupe |
| **AI analytics (tier-2)** | `product-review` | [ai-analytics.md](ai-analytics.md) | Post-alarm narrative, Ollama tools |
| **Edge deployment** | `architecture-review` | [edge-deployment.md](edge-deployment.md) | edge-agent, compose, soak |
| **Privacy / security** | `security-privacy-review` | [privacy-security.md](privacy-security.md) | Auth, vault, CRA, face opt-in |
| **Program delivery** | `program-delivery-review` | [program-delivery.md](program-delivery.md) | Phase exit, sequencing, risks |
| **Product** | `product-review` | — | Scope, vision, mock vs real |

## Not separate agents (use workflows)

- **Performance** — fold into Debug + architect review for this repo size.
- **Cloud cost** — N/A (home LAN first); revisit if cloud egress added.
- **Asset pipeline** — N/A (VMS); game repos would add `Asset Pipeline Agent`.

## Invocation examples

```text
Use the security-privacy-review skill on web/vite.axis-proxy.ts

Read ai/agents/event-pipeline.md and design VAPIX WS subscription stub

Use program-delivery-review on Phase 1 exit criteria
```
