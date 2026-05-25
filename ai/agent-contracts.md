# Agent contracts — Smart VMS

**Status:** Decided — rules of engagement for AI agents (Cursor, Copilot, future autonomous runners)

Violating these contracts wastes maintainer time and erodes trust in the repo.

## Roles

| Role | May implement code | May commit | Typical invocation |
|------|:------------------:|:----------:|-------------------|
| **Implementer** (default Cursor agent) | ✅ | Only if user asks | User story / bug fix |
| **Review skill** (`.cursor/skills/*`) | ❌ unless asked | ❌ | *"Use architecture-review on …"* |
| **Role brief** (`ai/agents/*`) | ✅ per brief | Only if user asks | See [agents/README.md](agents/README.md) |

Review skills output: **Summary → Findings (severity) → Recommendations → Open questions**.

## Session start contract

Every new agent session **must read** (in order):

1. [project-context.md](project-context.md)
2. [current-state.md](current-state.md)
3. [AGENTS.md](../AGENTS.md)
4. Relevant roadmap phase in [roadmap.md](../docs/product/roadmap.md)

If the task touches security or VAPIX, also read [quality-and-security-bar.md](../docs/engineering/quality-and-security-bar.md).

## Scope contract

- Advance **one roadmap slice** per session when possible.
- No Phase 2 edge ML scope while Phase 1 exit criteria are open — unless user explicitly redirects.
- Propose ADR before: new broker, DB swap, breaking `shared/` schema, auth model change.

## Code change contract

| Rule | Detail |
|------|--------|
| Minimal diff | No drive-by refactors |
| Match conventions | Existing patterns in surrounding files |
| Tests | Add/update when behavior changes; recording + auth paths are P0 |
| Docs | Update `features.md` / ADR when shipping user-visible or contractual change |
| Secrets | Never commit `.env`, credentials, or log passwords |
| `current-state.md` | Update after major feature batches (same PR or follow-up) |

## Commit & push contract

**Default: do not commit or push** unless the user explicitly requests it.

When asked to commit:

1. `git status`, `git diff`, `git log -3`
2. Stage only relevant files — never secrets
3. Concise message (why, not what laundry list)
4. Push only when user asks

Repo also has `.cursor/rules/auto-commit-github.mdc` for major completed work — **user rules override** when they conflict.

## Review contract

Before merging large or risky changes:

1. Run `npm test` in `web/` (and `server/` if touched).
2. Invoke matching review skill OR fill [feedback/code-review.md](feedback/code-review.md).
3. Fix **P0/P1** findings or document waiver in PR/session notes.

## Feedback loop contract

After a **major feature** or **phase milestone**:

1. Fill [feedback/release-retro.md](feedback/release-retro.md) (AI can draft; human approves).
2. Update [current-state.md](current-state.md).
3. Sync stale docs flagged in retro.

## Autonomous work (future)

When running unattended agents:

- Max blast radius: one directory or one API surface per run.
- Must leave `current-state.md` note if stopping mid-task.
- Must not force-push, amend pushed commits, or change git config.
- Stop and report if tests fail after two fix attempts.

## Escalation to human

Stop and ask when:

- Requirements contradict [vision.md](../docs/product/vision.md) or privacy doc.
- Two valid architectures need a product decision.
- Camera/hardware behavior cannot be verified without lab device.
- CI or tests fail for unclear environmental reasons.

## Related

- [workflows/session-start.md](workflows/session-start.md)
- [workflows/phase-exit.md](workflows/phase-exit.md)
- [feedback/code-review.md](feedback/code-review.md)
