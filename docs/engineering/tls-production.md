# TLS for production operator UI

**Status:** Decided — HTTPS via reverse proxy; session cookies require `SMARTVMS_COOKIE_SECURE=true`.

## Goal

Serve Smart VMS over **HTTPS** on the home LAN (or Tailscale) so session cookies use the `Secure` flag and browsers treat the origin as trustworthy.

## Quick start (Caddy + Docker)

1. Build and run the UI on port **5173** (dev or preview):

```bash
cd web
npm run build
npm run preview -- --host 127.0.0.1 --port 5173
```

Or keep `npm run dev` for Phase 1 soak (not hardened for 24/7 — use preview for long runs behind TLS).

2. Set production env in `web/.env`:

```env
SMARTVMS_COOKIE_SECURE=true
SMARTVMS_SESSION_SECRET=<openssl rand -hex 32>
```

3. Start TLS reverse proxy:

```bash
cd deploy
docker compose -f docker-compose.yml -f docker-compose.tls.yml up -d caddy
```

4. Open **`https://localhost`** (or `https://smart-vms.local` after hosts entry).

Caddy uses an **internal CA** (`tls internal`) — trust the cert in your OS/browser for local use, or replace with Let's Encrypt / your own certs (see below).

## Architecture

```text
Browser ──HTTPS──► Caddy (:443)
                      │
                      └── HTTP ──► Vite preview/dev (:5173)
```

Smart VMS auth sets `Secure` cookies when `SMARTVMS_COOKIE_SECURE=true`. Caddy forwards `X-Forwarded-Proto: https`.

## Tailscale (recommended remote)

Per [ADR-0004](../decisions/0004-remote-access-tailscale.md):

1. Install Tailscale on VMS host and operator devices.
2. Run Caddy bound to Tailscale IP or `0.0.0.0:443` on LAN only.
3. Access `https://<tailscale-ip>` — do **not** port-forward VAPIX or MQTT.

## Custom certificates

Edit [deploy/Caddyfile](../deploy/Caddyfile):

```caddy
smart-vms.example.com {
    tls /path/to/fullchain.pem /path/to/privkey.pem
    reverse_proxy 127.0.0.1:5173
}
```

## Verification checklist

- [ ] Login works over `https://`
- [ ] DevTools → Application → Cookies → `smartvms_session` has **Secure**
- [ ] Response includes `Strict-Transport-Security` when secure mode enabled
- [ ] Live video and recording APIs work through proxy (no mixed content)

## Related

- [authentication.md](authentication.md)
- [security-roadmap.md](security-roadmap.md)
- [remote-access.md](remote-access.md)
- [runbooks/camera-offline.md](runbooks/camera-offline.md)
