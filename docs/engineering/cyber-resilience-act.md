# Cyber Resilience Act (CRA) — alignment

**Status:** Proposed (Phase 0–1) — home VMS; not CE-marked product yet.

Regulation (EU) 2024/2847 ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng)) applies to **products with digital elements**. Smart VMS is security-sensitive software (video, credentials, LAN control). Main obligations apply from **11 December 2027**; vulnerability reporting from **11 September 2026**.

This doc maps CRA essential requirements to current implementation and backlog — not legal advice.

## Scope note

| Deployment | CRA relevance |
|------------|---------------|
| Self-hosted home (this repo) | Good practice; operator is also “manufacturer” of their install |
| Commercial product / CE marking | Full conformity assessment, SBOM, declaration |

## Annex I — product properties (selected)

| CRA requirement | Smart VMS approach | Status |
|-------------------|-------------------|--------|
| Secure by default | Login required; no default admin password; cameras not exposed without auth | **Partial** — admin password must be set in `.env` |
| Access control | Session cookie, roles (`admin` / `viewer`), API auth | **Done** (dev server) |
| Confidentiality of data | VAPIX credentials encrypted at rest (AES-256-GCM); not in git/localStorage | **Done** (Phase 1 dev) |
| Integrity | HMAC session tokens; CSP + security headers | **Partial** |
| Minimize attack surface | Private IP allowlist for camera proxy; no VAPIX creds to client | **Done** |
| No known exploitable vulns | Dependabot + manual review (backlog: CI scan) | **Backlog** |

## Annex I — vulnerability handling (selected)

| CRA requirement | Smart VMS approach | Status |
|-------------------|-------------------|--------|
| Identify vulnerabilities | GitHub Dependabot (backlog) | **Backlog** |
| Security updates | Documented upgrade path; semver lockfiles | **Partial** |
| SBOM | `npm` lockfile; future CycloneDX export | **Backlog** |
| Report exploited vulns (manufacturer) | Process TBD before Sep 2026 | **Backlog** |

## Implementation checklist (Phase 1)

- [x] Authentication before UI and sensitive APIs
- [x] Role-based access (admin vs viewer)
- [x] Rate-limited login
- [x] Security headers (incl. CSP)
- [x] Camera credentials server-side only, encrypted file
- [x] Audit log for auth + credential changes (`.smartvms-audit.log`)
- [x] Secrets gitignored (`.env`, `.vapix.credentials.json`)
- [ ] TLS/HTTPS for production UI (reverse proxy / Tailscale)
- [ ] Dependency scanning in CI
- [ ] SBOM generation in release pipeline
- [ ] Documented security update / incident process for releases

## Operator responsibilities (home)

1. Set strong `SMARTVMS_ADMIN_PASSWORD` and `SMARTVMS_SESSION_SECRET`
2. Do not port-forward UI to internet without TLS + hardening
3. Use dedicated low-privilege VAPIX user on cameras
4. Rotate passwords after suspected compromise (see [security-and-privacy.md](security-and-privacy.md))

## Related docs

- [security-and-privacy.md](security-and-privacy.md) — threat model
- [authentication.md](authentication.md) — sessions and roles
- [axis-live-stream.md](axis-live-stream.md) — camera proxy

## References

- [EU Cyber Resilience Act policy page](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)
- [CRA essential requirements FAQ (ORC WG)](https://cra.orcwg.org/faq/official/manufacturers/essential-requirements/)
