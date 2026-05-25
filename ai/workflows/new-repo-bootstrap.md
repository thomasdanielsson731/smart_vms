# New repo bootstrap workflow

Use when creating a **new AI-native repo** from Smart VMS patterns.

## Copy skeleton

```text
AGENTS.md
ai/
├── README.md
├── project-context.md      ← rewrite vision/stack
├── current-state.md        ← empty template
├── agent-contracts.md      ← adjust commit rules
├── agents/README.md
├── workflows/
└── feedback/
.cursor/
├── rules/                  ← project-specific .mdc
└── skills/                 ← review personas
docs/
├── product/vision.md
├── product/roadmap.md
├── architecture/overview.md
├── engineering/software-principles.md
├── engineering/quality-and-security-bar.md
└── decisions/README.md
```

## Customize

| File | Action |
|------|--------|
| `project-context.md` | Vision, stack, AI boundaries |
| `quality-and-security-bar.md` | Non-negotiables for domain |
| `.cursor/rules/*.mdc` | Domain globs |
| Skills | Clone 3–6 review skills relevant to domain |

## Do not copy blindly

- VAPIX-specific agents/rules → only for video/Axis repos
- `web/` Vite plugin architecture → only if same stack
- Phase roadmap → rewrite for new product

## Golden template repo (optional)

Maintain a separate `ai-project-template` repo with empty placeholders; Smart VMS remains the **reference implementation** for VMS/analytics.
