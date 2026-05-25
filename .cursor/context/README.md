# Cursor context pointers

Cursor loads rules from `.cursor/rules/` automatically. **Persistent project brain** lives in `ai/`:

| Read first | Path |
|------------|------|
| Project context | [ai/project-context.md](../../ai/project-context.md) |
| Current state | [ai/current-state.md](../../ai/current-state.md) |
| Agent contracts | [ai/agent-contracts.md](../../ai/agent-contracts.md) |
| Session workflow | [ai/workflows/session-start.md](../../ai/workflows/session-start.md) |

## Optional @-mentions in chat

```text
@ai/project-context.md @ai/current-state.md
```

## Rules index

| Rule | Scope |
|------|-------|
| `smart-vms-core.mdc` | Always |
| `architecture-docs.mdc` | `docs/architecture/**`, ADRs |
| `axis-vapix.mdc` | VAPIX paths |
| `auto-commit-github.mdc` | Major feature complete (user may override) |

## Skills index

See [AGENTS.md](../../AGENTS.md#review-agents-skills) and [ai/agents/README.md](../../ai/agents/README.md).
