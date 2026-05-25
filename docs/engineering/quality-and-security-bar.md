# Quality and security bar

**Status:** Decided — non-negotiables for Smart VMS (home deployment, production-grade discipline)

Smart VMS is a **local-first security product**. Even on a home LAN we hold the same engineering bar as a small commercial VMS: **trust in recording**, **correct alerts**, and **no silent security regressions**.

This document states what is **non-negotiable**. Implementation details live in linked docs; waivers require a written reason in the PR (see [testing-strategy.md](testing-strategy.md)).

---

## Quality — non-negotiables

| # | Bar | Rationale |
|---|-----|-----------|
| Q1 | **Recording path is P0** — regressions block release | Operators trust the system with property safety |
| Q2 | **Contract-first** for events and breaking APIs (`shared/`, ADRs) | Safe evolution across edge, server, web |
| Q3 | **Tests where failure hurts** — parsers, auth, retention, VAPIX fixtures | See [testing-strategy.md](testing-strategy.md) |
| Q4 | **CI green** — `web/` unit + E2E; `server/` unit + build on PR | `.github/workflows/ci.yml` |
| Q5 | **Definition of Done** on every shipped story | [software-principles.md](software-principles.md) §10 |
| Q6 | **Docs honest** — **Proposed** vs **Decided**; no stale “mock” labels | [features.md](../product/features.md) |
| Q7 | **One roadmap slice per merge** — no scope creep without ADR | [roadmap.md](../product/roadmap.md) |
| Q8 | **Operability** — actionable errors, runbooks for disk/offline | [runbooks/](runbooks/) |

### Recording-specific

- Retention must respect operator quota ([storage-quota.md](../product/storage-quota.md)).
- Capture failures must surface as camera health (not silent drop).
- Phase 1 exit: [soak-test-24h.md](soak-test-24h.md) on real hardware.

---

## Security — non-negotiables

| # | Bar | Rationale |
|---|-----|-----------|
| S1 | **Login required** for UI and sensitive APIs | No anonymous operator surface |
| S2 | **Least privilege** — admin vs viewer; dedicated VAPIX service account | [authentication.md](authentication.md) |
| S3 | **No secrets in git** — `.env`, vault files gitignored; `.env.example` only keys | CRA + basic hygiene |
| S4 | **VAPIX credentials server-side only** — encrypted at rest (AES-256-GCM) | Never in localStorage or client |
| S5 | **SSRF guard** on camera proxy — RFC1918 allowlist; localhost dev-only flag | [trust-boundaries.md](../architecture/trust-boundaries.md) |
| S6 | **No credentials in logs** — especially RTSP URLs with user/password | [security-and-privacy.md](security-and-privacy.md) |
| S7 | **Privacy by default** — face identification opt-in; indoor bbox off by default (target) | [face-recognition.md](../product/face-recognition.md) |
| S8 | **Audit trail** for credential and auth events | `.smartvms-audit.log` |
| S9 | **Cameras not on public internet** — remote access opt-in only (Tailscale ADR) | [0004-remote-access-tailscale.md](../decisions/0004-remote-access-tailscale.md) |
| S10 | **Dependency hygiene** — lockfiles; known vulns tracked | [security-roadmap.md](security-roadmap.md) |

---

## What “top quality” means here

Not 100% line coverage or gold-plated abstractions. It means:

1. **Evidence over video** — clips + structured events, not 24/7 offsite 4K.
2. **Measured trade-offs** — ADRs for irreversible choices; tables over debate prose.
3. **Fail visibly** — operator knows when recording, auth, or a camera is wrong.
4. **AI assists, humans own** — agents read `AGENTS.md`; no bypassing tests or hooks.

---

## Review gates

| Gate | When | Checklist |
|------|------|-----------|
| PR | Every merge | [code-review.md](code-review.md) |
| Architecture | Broker, DB, breaking API | ADR in [decisions/](../decisions/) |
| Security-sensitive | Auth, proxy, credentials, face | [security-privacy-review skill](../../.cursor/skills/security-privacy-review/) or manual § Security |
| Phase exit | Roadmap milestone | Exit criteria in [roadmap.md](../product/roadmap.md) + soak/validation |

---

## Related

- [software-principles.md](software-principles.md) — how we build
- [security-and-privacy.md](security-and-privacy.md) — threat model
- [cyber-resilience-act.md](cyber-resilience-act.md) — EU CRA mapping
- [security-roadmap.md](security-roadmap.md) — prioritized backlog to full bar
