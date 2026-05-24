# Development workflow

**Status:** Decided — reflects current `web/` Phase 1 setup

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ (22 in CI) | Vite dev server, tests |
| npm | 10+ | Package management |
| Ollama (optional) | latest | Local Copilot (Qwen) |
| Axis cameras (optional) | LAN | Live video and VAPIX |

## Repository layout

```text
smart-vms/
├── docs/           Product, architecture, engineering, ADRs
├── web/            Phase 1 operator UI + Vite dev server plugins
├── shared/         (future) Event schemas, contracts
├── edge-agent/     (future) Per-site ingest + inference
├── server/         (future) API, recording, analytics
└── deploy/         (future) Compose, configs
```

Work on **one roadmap phase** at a time — see [../product/roadmap.md](../product/roadmap.md).

## First-time setup

```powershell
cd web
copy .env.example .env
# Set SMARTVMS_ADMIN_PASSWORD, optional AXIS_VAPIX_*, Ollama vars
npm install
npm run dev
```

Open http://localhost:5173 — sign in with admin credentials from `.env`.

## Daily commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server + auth + VAPIX + camera proxy |
| `npm run build` | Typecheck + production bundle |
| `npm run test` | Vitest unit + contract tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | ESLint |
| `npm run preview` | Serve `dist/` with same API plugins |

**Important:** Live video and camera web UI require `dev` or `preview` — not opening `dist/index.html` directly.

## Environment variables

Document all new keys in `web/.env.example`. Never commit:

- `web/.env`
- `web/.vapix.credentials.json`

Generate a stable session secret for production-like dev:

```text
SMARTVMS_SESSION_SECRET=<openssl rand -hex 32>
```

## Branching and commits

- `main` — integratable; CI runs test + build
- Commit messages: **why** in 1–2 sentences (English or Swedish)
- One logical change per commit when possible
- No secrets in git; pre-commit hooks must not be skipped without reason

## Definition of Done (implementation)

From [software-principles.md](software-principles.md):

- [ ] Acceptance criteria met
- [ ] Tests added or waiver documented
- [ ] `npm run test` and `npm run build` pass
- [ ] Docs updated if behavior or contracts changed
- [ ] ADR if irreversible choice (broker, DB, breaking API)

## AI-assisted development

1. Read `AGENTS.md` and relevant product/architecture docs
2. Invoke review skills before large merges (see `AGENTS.md`)
3. Mark doc sections **Proposed** vs **Decided**
4. Do not bypass tests or expand scope across roadmap phases

## Ollama + VMS together

Run in **separate terminals**:

```powershell
# Terminal 1 — Ollama (app or `ollama serve`)
# Terminal 2
cd web && npm run dev
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No live video | VAPIX creds in Settings or `.env`; correct camera IP in mock-data |
| Session lost on restart | Set `SMARTVMS_SESSION_SECRET` |
| Copilot offline | Ollama running; `VITE_OLLAMA_BASE_URL` |
| Camera web login form | Re-save VAPIX creds; restart dev server |

See [authentication.md](authentication.md), [axis-live-stream.md](axis-live-stream.md).
