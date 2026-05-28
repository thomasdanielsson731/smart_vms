# Security roadmap

**Status:** Decided — prioritized backlog to reach full [quality-and-security-bar.md](quality-and-security-bar.md)

Tracks gaps between **policy** (docs) and **implementation** (repo). Update when items ship or priorities change.

Legend: **P0** before home production · **P1** next quarter · **P2** planned · **Done**

---

## P0 — before trusting production at home

| Item | Status | Notes |
|------|--------|-------|
| Strong admin password + session secret required | **Done** | `.env` / Settings |
| Session auth on `/api/*` | **Done** | [authentication.md](authentication.md) |
| VAPIX vault encrypted, server-side | **Done** | [credential-store](../../web/server/credential-store.ts) |
| SSRF allowlist on camera proxy | **Done** | [camera-proxy-shared.ts](../../web/server/camera-proxy-shared.ts) |
| Audit log (auth + credential changes) | **Done** | [audit-log.ts](../../web/server/audit-log.ts) |
| Recording quota enforced server-side | **Done** | `/api/recording/settings` |
| **24h recording soak** on real cameras | **In progress** | [soak-test-24h.md](soak-test-24h.md) · `node scripts/soak-24h.mjs` |
| TLS for operator UI (HTTPS) | **Done** (proxy + docs) | [tls-production.md](tls-production.md) · set `SMARTVMS_COOKIE_SECURE=true` |

---

## P1 — high security value, next slices

| Item | Status | Notes |
|------|--------|-------|
| Dependency scan in CI (Dependabot or `npm audit` gate) | **Done** | `.github/dependabot.yml` |
| Secret scan in CI (`gitleaks` or equivalent) | **Done** | `.github/workflows/ci.yml` · `.gitleaks.toml` |
| JSON Schema validation for `shared/` in CI | **Done** | `shared/scripts/validate-schemas.mjs` |
| Live VAPIX event ingest (signed/normalized) | **Open** | No ad-hoc MQTT topics; `vapix_event_key` dedupe |
| `automation` API key role (scoped read/write) | **Open** | Documented in security doc, not implemented |
| Per-camera indoor face bbox default off | **Open** | Policy in [security-and-privacy.md](security-and-privacy.md) |
| Server integration tests (Postgres + MQTT) | **Open** | `deploy/docker-compose.yml` in CI optional job |
| Production CSP hardening (Smart VMS shell) | **Open** | Camera iframe exception documented |

---

## P2 — Phase 3–4 hardening

| Item | Status | Notes |
|------|--------|-------|
| mTLS edge ↔ server | **Open** | ADR when edge ships |
| Webhook HMAC signing | **Partial** | Server webhook exists; signing TBD |
| SBOM export (CycloneDX) on release | **Open** | CRA Annex I |
| Documented security update process | **Open** | Release notes + CVE response |
| Clip encryption at rest | **Open** | ADR candidate |
| Rate limits on all public APIs | **Partial** | Login rate limit only |
| Penetration test / threat model review | **Open** | Annual or major release |

---

## P3 — consider

| Item | Status | Notes |
|------|--------|-------|
| OIDC / SSO for household | **Open** | Local accounts sufficient v1 |
| Hardware security module for vault | **Open** | File permissions OK for home v1 |
| Signed container images | **Open** | Docker Compose dev stack |

---

## CRA alignment snapshot

Full mapping: [cyber-resilience-act.md](cyber-resilience-act.md).

| CRA theme | Roadmap items |
|-----------|---------------|
| Secure by default | P0 TLS, P1 automation keys |
| Vulnerability handling | P1 Dependabot, SBOM (P2) |
| Minimize attack surface | Done SSRF; P1 CSP |
| Report exploited vulns | P2 process doc |

---

## How to use this doc

1. Pick the **highest open P0/P1** item when planning security work.
2. Mark **Done** in this file when merged; link PR or ADR.
3. Do not close CRA checklist items here without updating [cyber-resilience-act.md](cyber-resilience-act.md).

---

## Related

- [quality-and-security-bar.md](quality-and-security-bar.md)
- [security-and-privacy.md](security-and-privacy.md)
- [trust-boundaries.md](../architecture/trust-boundaries.md)
