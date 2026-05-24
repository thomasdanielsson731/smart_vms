# Agent guide — Smart VMS

Instructions for AI agents (and humans pairing with them) working in this repository.

## Project in one paragraph

Smart VMS is a home/small-site VMS using **Axis cameras via VAPIX**, with **edge analytics** (low latency, bandwidth-efficient) and **server analytics** (correlation, search, heavier models). Favor **event + clip** over raw 24/7 cloud upload. Read [docs/product/vision.md](docs/product/vision.md) and [docs/architecture/overview.md](docs/architecture/overview.md) before proposing code.

## Audience

The maintainer is a **senior software engineering manager** (architecture, test, program management). Assume strong engineering literacy. Prefer:

- Clear trade-offs and risks over tutorials
- ADRs for irreversible choices ([docs/decisions/](docs/decisions/))
- Testability and operability called out explicitly
- No scope creep — smallest change that advances the current roadmap phase

## Default behaviors

1. **Docs before code** when requirements or boundaries are unclear.
2. **Match** [docs/engineering/software-principles.md](docs/engineering/software-principles.md).
3. **Axis-specific** work must align with [docs/architecture/axis-vapix.md](docs/architecture/axis-vapix.md).
4. **Privacy-by-default** per [docs/engineering/security-and-privacy.md](docs/engineering/security-and-privacy.md) (home deployment).
5. Propose **ADRs** when choosing brokers, databases, or breaking API contracts.
6. Do not commit secrets (`.env`, camera passwords, certs).

## Repository layout (target)

```
smart-vms/
├── docs/                 # product, architecture, engineering, ADRs
├── edge-agent/           # (future) per-site ingest + inference
├── server/               # (future) API, recording, analytics
├── web/                  # (future) operator UI
├── shared/               # (future) schemas, contracts
├── deploy/               # (future) compose, configs
├── .cursor/rules/        # automatic conventions
└── .cursor/skills/       # on-demand review personas
```

Until directories exist, do not invent large codebases — extend docs and thin spikes only when asked.

## Review agents (skills)

Invoke these for **structured feedback** (not implementation unless asked):

| Skill | Use when |
|-------|----------|
| `architecture-review` | System design, boundaries, failure modes, ADRs |
| `product-review` | Vision, roadmap, personas, scope creep |
| `test-strategy-review` | Test plans, CI, quality gates, automation |
| `security-privacy-review` | Threat model, home privacy, credentials, retention |
| `vapix-integration-review` | Axis API usage, events, streams, device limits |
| `program-delivery-review` | Roadmap phases, risks, exit criteria, sequencing |

**How to invoke:** *"Use the &lt;skill-name&gt; skill on &lt;path or topic&gt;."*

Each skill returns: **Summary → Findings (severity) → Recommendations → Open questions**.

Severity legend: **P0** must fix, **P1** should fix, **P2** consider, **P3** nit.

## Rules (auto-applied)

| Rule | Scope |
|------|--------|
| `smart-vms-core.mdc` | Always — project-wide norms |
| `architecture-docs.mdc` | `docs/architecture/**`, `docs/decisions/**` |
| `axis-vapix.mdc` | VAPIX, Axis, camera integration paths |

## When editing documentation

- Keep headings stable; use ADRs for decisions, not long debates in vision docs.
- Link related docs; update [docs/README.md](docs/README.md) index when adding files.
- Mark speculative sections **Proposed** vs **Decided** (link ADR if decided).

## When implementation begins

- Contract-first: event schemas in `shared/` before services.
- Every external integration (VAPIX, RTSP, MQTT) gets contract tests or recorded fixtures.
- Prefer idempotent handlers and explicit backpressure on event ingress.

## Out of scope unless requested

- Commercial multi-tenant SaaS
- Facial recognition for identification (detection/blur may be in scope; see privacy doc)
- Replacing Axis firmware or embedded ACAP unless explicitly planned
