# Smart VMS — Web UI

**AI-first:** the main interface is a **Copilot chat**. Video, dashboard, tracking, and monitoring open as **workspace panels** beside the chat.

## Run locally

From the **repo root**:

```bash
npm install --prefix web
npm run dev
```

Or from this folder:

```bash
cd web
npm install
cp .env.example .env   # set SMARTVMS_ADMIN_PASSWORD, AXIS_VAPIX_*, etc.
npm run dev
```

Open http://localhost:5173 — **sign in** with the admin account from `.env`.

See [docs/engineering/authentication.md](../docs/engineering/authentication.md) for roles and sessions.

## Required `.env` (minimum)

```env
SMARTVMS_ADMIN_PASSWORD=your-admin-password
SMARTVMS_SESSION_SECRET=openssl-rand-hex-32
AXIS_VAPIX_USER=root
AXIS_VAPIX_PASSWORD=your-camera-password
```

Without `SMARTVMS_SESSION_SECRET`, sessions are lost on every dev server restart.  
Without VAPIX credentials, live video and Camera web UI will not authenticate to cameras.

## Experience

```text
[icon rail] | CHAT (always) | WORKSPACE (on demand)
            | Copilot       | Video / Dashboard / Forensic / Map / …
```

**Example prompts:**

- "Show live from the driveway" → video panel
- "Open dashboard" → statistics
- "Open forensic timeline" → alarms + recordings
- "Discover cameras on the network" → onboarding wizard
- "Create a new alarm for the garage after 22:00" → alarm form
- "Open camera web interface" → embedded Axis UI

**Copilot** uses **Ollama** locally (default: `qwen2.5-coder:7b`). See [docs/engineering/ollama-copilot.md](../docs/engineering/ollama-copilot.md).

```bash
ollama serve          # or the Ollama desktop app
ollama pull qwen2.5-coder:7b
npm run dev
```

If Ollama is offline, keyword intent matching is used as fallback.

## Live video (Axis)

Requires `AXIS_VAPIX_USER` / `AXIS_VAPIX_PASSWORD` in `web/.env` (or saved under Settings → Cameras) and correct camera IPs in Settings or mock data.

See [docs/engineering/axis-live-stream.md](../docs/engineering/axis-live-stream.md).

**Must run `npm run dev`** — live video uses the dev-server proxy (`/api/camera/...`).

## Sidebar workspaces

| Icon | Workspace |
|------|-----------|
| Radar | **Onboarding** — discover and register cameras |
| Alarm | **Create alarm** — rules for one or many cameras |
| Map | **Map** — camera placement and field of view |
| Forensic | **Forensic** — timeline of alarms and clips |
| Video | Live / playback |
| Dashboard | Alarms and system stats |
| Tracking | Cross-camera tracks (mock) |
| Agents | Monitoring policies |
| Faces | Face recognition (opt-in) |
| Globe | **Camera web** — embedded Axis device UI |
| Settings | Auth, VAPIX, storage |

## Stack

React 19 · TypeScript · Vite · React Router · Tailwind v4 · Lucide · Vitest

## Tests

```bash
npm run test          # from web/ or repo root
```

## Documentation

- [docs/product/overview.md](../docs/product/overview.md)
- [docs/product/features.md](../docs/product/features.md)
- [docs/product/ux-ai-first.md](../docs/product/ux-ai-first.md)
- [docs/architecture/web-application.md](../docs/architecture/web-application.md)
- [docs/engineering/development-workflow.md](../docs/engineering/development-workflow.md)
