# ADR-0004: Remote access via Tailscale (Phase 4)

**Status:** Decided  
**Date:** 2026-05-25

## Context

Home operators may want phone/laptop access away from LAN without exposing VAPIX or the VMS UI to the public internet.

## Decision

Document and support **Tailscale** (or equivalent WireGuard mesh) as the Phase 4 remote access pattern. No built-in reverse proxy or port-forward wizard in v1.

## Consequences

- No UPnP / DDNS in product scope
- Session cookies remain `SameSite=Lax`; remote access uses VPN L3 reachability
- See [../engineering/remote-access.md](../engineering/remote-access.md)
