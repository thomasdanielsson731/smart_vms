# Home deployment topology

**Status:** Proposed — Phase 1 collapsed; Phase 2+ split optional

## Phase 1 (today): single workstation

Everything runs on one PC on the home LAN:

```text
┌─────────────────────────────────────────┐
│  Windows / Linux PC                     │
│  ┌─────────────┐  ┌─────────────────┐ │
│  │ npm run dev │  │ Ollama (optional)│ │
│  │  :5173      │  │  :11434          │ │
│  └──────┬──────┘  └────────┬─────────┘ │
└─────────┼──────────────────┼───────────┘
          │                  │
     HTTP │                  │ loopback
          ▼                  ▼
   Operator browser    Copilot LLM
          │
          └──────────► Axis cameras (192.168.x.x)
                       digest VAPIX + MJPEG
```

**Requirements**

- PC on same subnet as cameras
- Firewall allows outbound to camera IPs
- No inbound ports required from internet

**Not suitable for 24/7 production yet** — dev server is not a hardened daemon. Phase 1 goal is functional validation at home.

## Phase 1 production-like (interim)

```text
┌──────────────────────────────────┐
│  Linux host / NAS                │
│  Docker Compose (future deploy/) │
│  · web (preview or static+API)   │
│  · Ollama sidecar (optional)     │
└──────────────┬───────────────────┘
               │ LAN
               ▼
         Axis cameras
```

Exit criteria before calling this "production":

- [ ] Process supervisor (systemd / container restart)
- [ ] Persistent `SMARTVMS_SESSION_SECRET`
- [ ] Backup of config + credential encryption key
- [ ] Recording service with disk monitoring

## Phase 2–3 target: edge + server split

See [overview.md](overview.md) and [edge-vs-server.md](edge-vs-server.md).

```text
        ┌─────────────┐
        │   Cameras   │
        └──────┬──────┘
               │ RTSP + VAPIX
        ┌──────▼──────┐         ┌─────────────┐
        │ Edge agent  │  MQTT   │   Server    │
        │ (NUC/Jetson)├────────►│  Postgres   │
        └─────────────┘         │  MinIO      │
                                │  Web UI     │
                                └──────┬──────┘
                                       │
                                Operator LAN/W VPN
```

| Mode | When |
|------|------|
| **Collapsed** | Dev, small site, single host |
| **Split** | GPU at camera cluster; storage on NAS |

## Network checklist

| Check | Action |
|-------|--------|
| Camera IPs static or DHCP reservation | Router config |
| NTP on cameras and host | Reduce event skew |
| VAPIX user dedicated | Not personal admin |
| mDNS (optional) | Onboarding discovery Phase 2 |

## Storage layout (target)

| Path | Content |
|------|---------|
| `/data/recordings/` | HLS/fMP4 segments |
| `/data/clips/` | Incident clips |
| `/data/db/` | Postgres |
| `/config/smartvms/` | Env, encrypted secrets |

Phase 1: browser localStorage + `.vapix.credentials.json` only.

## Remote access (Phase 4 — ADR required)

**Default:** no exposed ports.

Options under evaluation:

- Tailscale mesh VPN
- Reverse proxy with MFA
- Axis AVHS (not preferred — vendor cloud)

## Hardware guidance (indicative)

| Phase | CPU | RAM | GPU | Disk |
|-------|-----|-----|-----|------|
| 1 UI only | 4 cores | 8 GB | — | SSD |
| 2 edge CV | 6+ cores | 16 GB | Optional iGPU/Coral | NVMe buffer |
| 3 server | 4 cores | 16 GB | — | NAS bulk storage |

Measure before buying; home camera count drives decode load.

## Related

- [web-application.md](web-application.md)
- [../engineering/observability-and-ops.md](../engineering/observability-and-ops.md)
- [../product/roadmap.md](../product/roadmap.md)
