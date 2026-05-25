# Privacy & security agent brief

**Pair with:** `.cursor/skills/security-privacy-review/SKILL.md`

## Mission

Enforce home-appropriate security and privacy on every change touching auth, proxy, storage, face, or network.

## P0 checks

- Session required on sensitive `/api/*`
- VAPIX credentials never in client or git
- SSRF allowlist on camera hosts
- Admin vs viewer enforced for discovery, onboarding, camera web, AOA writes
- Face identification remains opt-in

## Track backlog

Update [security-roadmap.md](../../docs/engineering/security-roadmap.md) when closing items.

## References

- [quality-and-security-bar.md](../../docs/engineering/quality-and-security-bar.md)
- [trust-boundaries.md](../../docs/architecture/trust-boundaries.md)
- [cyber-resilience-act.md](../../docs/engineering/cyber-resilience-act.md)
