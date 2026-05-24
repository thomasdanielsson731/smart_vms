# Security and privacy

Home deployment threat model and product constraints. **Not a corporate compliance doc** — practical controls for family context.

## Assets

| Asset | Sensitivity |
|-------|-------------|
| Live video | High |
| Recorded clips | High |
| Detection metadata (person present) | Medium–High |
| Camera credentials | Critical |
| Operator account credentials | Critical |
| System topology (what you own) | Medium |

## Threat actors (realistic)

| Actor | Risk |
|-------|------|
| Internet opportunist | Scans open ports, default passwords |
| Compromised LAN device | Lateral movement to cameras/server |
| Guest on Wi‑Fi | Curious access to HTTP APIs |
| Vendor/cloud (if used) | Data egress policy |
| Physical theft | Disk extraction |

## Principles

1. **Cameras not on public internet**
2. **Segmentation** — IoT VLAN or firewall rules camera ↔ server only
3. **Least privilege** — dedicated VAPIX user per integration
4. **Encryption in transit** — TLS to UI and APIs; HTTPS to cameras where supported
5. **Encryption at rest** — optional LUKS/disk encryption on server (operator choice)
6. **Minimal retention** — defaults in [data-model](../architecture/data-model-and-events.md)

## Privacy (home-specific)

| Topic | Policy (proposed) |
|-------|-------------------|
| Face **identification** | Opt-in via workspace **Ansikten**; see [face-recognition.md](../product/face-recognition.md) |
| Face **detection** (bbox) | Configurable per camera; off indoors by default |
| License plates | Detection optional; no public LPR database |
| Audio | Off unless explicit ADR + legal review |
| Neighbors in frame | Use ROI masks; avoid cameras pointed beyond property line |
| Remote access | Opt-in; Tailscale preferred over port forward |
| Household members | Role-based UI; no silent admin |

## Authentication & authorization

- Local accounts v1; OIDC future optional
- Roles: `admin`, `viewer`, `automation` (API key scoped)
- API keys: scoped read vs write; rotation documented
- **Implementation (Phase 1):** [authentication.md](authentication.md) — session cookie, login, API-skydd

## Secrets management

- Development: `.env` (gitignored)
- Production home: env file with restrictive permissions or OS secret store
- Never log RTSP URLs with credentials

## Secure development

- Dependabot or equivalent
- `gitleaks` or secret scan in CI
- Signed container images optional for home
- **CRA alignment:** [cyber-resilience-act.md](cyber-resilience-act.md) — EU Cyber Resilience Act mapping

## Incident response (home scale)

1. Disable remote access
2. Rotate camera and API passwords
3. Review audit log for exports and new users
4. Preserve clips if legal need; else purge per retention

## Open decisions (ADR)

- End-to-end encryption for clips at rest in object store
- Whether edge stores unencrypted pre-roll on disk
- Biometric-adjacent features (explicit opt-in only)

## Regulatory awareness

Laws vary by country/region (CCTV signage, audio recording, neighbor privacy). **Operator responsibility** — product provides toggles and documentation, not legal advice.
