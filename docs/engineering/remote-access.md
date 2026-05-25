# Remote access (Phase 4)

**Status:** Decided — see [ADR-0004](../decisions/0004-remote-access-tailscale.md)

## Recommended pattern

1. Install **Tailscale** on the Smart VMS host and operator devices.
2. Access the UI at `http://<tailscale-ip>:5173` (dev) or production port.
3. Do **not** port-forward VAPIX (80/443) or MQTT to the internet.

## Security notes

- VAPIX credentials never leave the LAN/VPN boundary unencrypted.
- Prefer HTTPS reverse proxy only after Tailscale or mTLS is in place.
- Viewer role for family read-only access; admin for configuration.

## Out of scope

- Multi-tenant SaaS login
- Public OAuth to third-party IdPs (Phase 1 uses local accounts)
