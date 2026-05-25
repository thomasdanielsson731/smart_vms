# Code review checklist

**Status:** Decided — for humans and AI review skills

Use this for PRs and significant AI sessions. Severity: **P0** must fix · **P1** should fix · **P2** consider · **P3** nit

## Scope and product

- [ ] Advances **current roadmap phase** only — no silent scope creep
- [ ] User-visible behavior matches product docs or docs updated
- [ ] Mock vs real data paths are obvious to operators

## Architecture

- [ ] **VAPIX-first** — not RTSP-only control paths
- [ ] **Edge detects, server correlates** — no full-time remote 4K upload by default
- [ ] Boundaries respected: web UI ≠ recording service ≠ edge agent
- [ ] ADR linked for broker/DB/breaking API choices

## Security & privacy (home)

- [ ] Meets [quality-and-security-bar.md](quality-and-security-bar.md) for touched areas
- [ ] No secrets in repo or logs (RTSP URLs with passwords, `.env`)
- [ ] Auth required on `/api/*` except login/status
- [ ] Camera proxy SSRF guard (`isAllowedCameraHost`)
- [ ] VAPIX credentials encrypted at rest
- [ ] Face recognition remains **opt-in** with consent gate
- [ ] CRA-relevant changes noted ([cyber-resilience-act.md](cyber-resilience-act.md))

## Contracts & tests

- [ ] Event/API changes have schema or fixture first (`shared/` when exists)
- [ ] VAPIX parsers have golden fixtures (`web/fixtures/vapix/`)
- [ ] Unit tests for parsers, auth, credential crypto, URL rewrite
- [ ] `npm run test` and `npm run build` pass

## Operability

- [ ] Errors actionable for operator (not raw stack traces in UI)
- [ ] Config documented in `.env.example`
- [ ] Degradation path clear (e.g. AI off → recording still works)

## UI / UX

- [ ] English UI strings (home operator language decision)
- [ ] Admin-only actions gated by role
- [ ] Chat intents do not false-positive (e.g. `interface` ≠ `face`)

## Anti-patterns (flag immediately)

| Pattern | Severity |
|---------|----------|
| Passwords in localStorage | P0 |
| Public IP in camera proxy allowlist | P0 |
| Face ID on by default indoors | P0 |
| Breaking API without version/ADR | P1 |
| Duplicate rule engine on edge + server | P1 |
| Snapshot tests on huge unfiltered XML | P2 |

## Review skills (Cursor)

Structured feedback via skills in `AGENTS.md`:

- `architecture-review`, `security-privacy-review`, `vapix-integration-review`, etc.

Invoke: *"Use the security-privacy-review skill on `<path>`."*
