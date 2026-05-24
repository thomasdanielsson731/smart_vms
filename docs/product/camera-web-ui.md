# Camera web UI (embedded Axis interface)

**Status:** Decided — Phase 1 UI in `web/` via Vite proxy

## Purpose

Each Axis camera runs a **built-in web server** at its IP address (setup, live view, parameters, firmware). Smart VMS embeds that UI inside the **Camera web** workspace so operators can configure devices without leaving the app.

## Operator flow

1. Open **Camera web** from sidebar or Copilot (*"open camera web interface"*)
2. Select camera from list
3. Browse via quick links (Home, Web UI, Live view, Parameters) or in-frame navigation
4. **Open in tab** — direct `http://<camera-ip>/` when embedded view fails

## Authentication model

Operators do **not** log in again inside the iframe when VAPIX credentials are configured:

- Smart VMS dev server performs **digest authentication** to the camera
- HTML/JS URLs are rewritten to stay on `/api/camera/<host>/web/...`
- Session cookies from the camera are scoped to the proxy path

Credentials source (priority):

1. Encrypted `.vapix.credentials.json` (Settings → Cameras)
2. `AXIS_VAPIX_USER` / `AXIS_VAPIX_PASSWORD` in `web/.env`

Requires `npm run dev` or `npm run preview` — not static `dist/` alone.

## Limitations (known)

| Limitation | Mitigation |
|------------|------------|
| Axis JS may assume camera hostname | URL rewrite + fetch/XHR shim |
| HTTPS-only cameras | Proxy tries HTTP then HTTPS |
| WebSocket-heavy UI pages | Not proxied in v1 — use Open in tab |
| Cross-origin device features | Same as any reverse proxy |

## Privacy & security

- Camera admin UI is **admin-only** in Smart VMS (viewer role cannot change Settings)
- Proxy restricted to **private LAN IPs** (SSRF guard)
- All proxy routes require Smart VMS session

See [../architecture/web-application.md](../architecture/web-application.md) and [../architecture/trust-boundaries.md](../architecture/trust-boundaries.md).

## Acceptance (Phase 1)

- [x] Embedded home page loads without manual camera login when VAPIX creds valid
- [x] Device info (model, firmware, serial) shown above iframe
- [x] Open in tab fallback documented in UI footer
- [ ] Contract test against recorded Axis HTML fixtures (stretch)
