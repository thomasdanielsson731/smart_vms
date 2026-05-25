# AI-native project structure — Smart VMS

**Status:** Decided — persistent context for humans and agents (Cursor, Copilot, future autonomous workflows)

This folder holds **knowledge that must survive chat sessions**. Code and product specs live in `docs/`; this folder holds **how AI should work on this repo**.

## Start here (every session)

| Order | File | Purpose |
|-------|------|---------|
| 1 | [project-context.md](project-context.md) | Vision, stack, principles, AI boundaries |
| 2 | [current-state.md](current-state.md) | What works, gaps, next steps **today** |
| 3 | [agent-contracts.md](agent-contracts.md) | How agents may act, commit, review |
| 4 | [../AGENTS.md](../AGENTS.md) | Entry point + skill roster |

## Folder map

```text
ai/
├── README.md                 ← you are here
├── project-context.md        ← persistent “what is this project”
├── current-state.md          ← living snapshot (update after major work)
├── agent-contracts.md        ← rules of engagement
├── system-prompts/           ← operator / Copilot context snippets
├── agents/                   ← role briefs (+ map to .cursor/skills)
├── workflows/                ← repeatable agent workflows
├── feedback/                 ← drift detection + retros
└── examples/                 ← handoff patterns
```

## Cursor integration

| Location | Role |
|----------|------|
| `.cursor/rules/` | Auto-applied conventions (always or by glob) |
| `.cursor/skills/` | On-demand **review** personas (structured output) |
| `ai/agents/` | **Implementation** role briefs + when to invoke skills |
| `ai/workflows/` | Step lists for phase exit, feature done, retro |

**Do not duplicate** full skill bodies in `ai/agents/` — link to `.cursor/skills/*/SKILL.md`.

## Golden template note

Smart VMS is the reference layout for **AI-native infrastructure / VMS** repos. When spinning a new project (game, analytics, etc.), copy:

- `ai/` skeleton (this structure)
- `AGENTS.md` pattern
- `.cursor/rules/` + `.cursor/skills/` pattern
- `docs/decisions/` ADR template

See [workflows/new-repo-bootstrap.md](workflows/new-repo-bootstrap.md).

## Related

- [docs/README.md](../docs/README.md) — product & architecture index
- [docs/engineering/quality-and-security-bar.md](../docs/engineering/quality-and-security-bar.md)
