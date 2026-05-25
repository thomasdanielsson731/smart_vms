# Product overview — Smart VMS

**Status:** Decided (vision) · Phase 1 UI **shipped as mock-backed shell** in `web/`

## One sentence

Smart VMS is a **local-first, AI-native video management system** for home and small sites, built around **Axis cameras (VAPIX)**, with **edge detection** and **server correlation** — operated primarily through a **Copilot chat** that opens video, dashboards, and monitoring workspaces on intent.

## Who it is for

| Audience | Need |
|----------|------|
| **Owner-operator** | Reliable Axis coverage, meaningful alerts, full data control |
| **Household viewer** | Simple live view and recent events without admin access |
| **Contributors (human/AI)** | Clear contracts, tests, ADRs |

See [personas-and-use-cases.md](personas-and-use-cases.md).

## Problem we solve

Traditional NVR software optimizes for **recording and scrubbing**. Cloud cameras optimize for **subscriptions and lock-in**. Home operators with Axis + VAPIX want:

- Local control of video and retention
- Alerts that explain *what* happened, not just motion
- Semantic search and correlation across cameras
- Privacy boundaries the household understands

## Product pillars

```text
┌─────────────────────────────────────────────────────────┐
│  Copilot (chat-first)                                   │
│  Intent → workspace (video, forensic, map, agents, …)   │
├─────────────────────────────────────────────────────────┤
│  VMS core          │  Edge analytics  │  Server analytics│
│  Live · record ·   │  Detect · zone · │  Correlate ·     │
│  playback · export │  clip-on-event   │  search · tier-2 │
├─────────────────────────────────────────────────────────┤
│  Axis-native (VAPIX control plane · RTSP media plane)   │
└─────────────────────────────────────────────────────────┘
```

| Pillar | Description | Phase 1 today |
|--------|-------------|-----------------|
| **Copilot** | Natural-language operator interface | Ollama (Qwen) + keyword intent fallback |
| **VMS core** | Cameras, live, timeline, retention | Live via VAPIX proxy; snapshot recording + playback |
| **Edge analytics** | Low-latency detect + clip | Mock / planned |
| **Server analytics** | Correlation, tier-2 enrichment | Mock tier-2 + face registry |
| **Axis-native** | VAPIX-first integration | Digest auth, MJPEG, device info, web UI proxy |

## Operator journeys (high level)

### Daily check

1. Open Smart VMS → sign in
2. Ask Copilot: *"Show live from driveway"* or use sidebar
3. Glance at dashboard for open alarms and storage usage

### Incident review

1. Notification or Copilot: *"Open forensic timeline"*
2. Scrub shared timeline of recordings + alarms
3. Tier-2 panel explains rule, persons, priority
4. Export evidence package (future: real clip export)

### Configuration

1. **Settings → Cameras (VAPIX)** — shared credentials + IP per camera
2. **Onboarding** — discover and bulk-register cameras on LAN
3. **Create alarm** — multi-camera rules with schedules
4. **Map** — place cameras, field of view, alarm pins

## What is shipped vs mock

| Area | Shipped (real) | Mock / Phase 2+ |
|------|----------------|-----------------|
| Auth (session, roles) | ✓ | — |
| Axis live (MJPEG/snapshot) | ✓ | RTSP audio, WebRTC |
| VAPIX credential vault | ✓ | Central secrets manager |
| Camera web UI proxy | ✓ | — |
| Copilot (Ollama) | ✓ | Tool calling to real APIs |
| Recording / playback | ✓ (30 s JPEG snapshots) | RTSP / WebRTC |
| Edge detection | — | Person/vehicle models |
| Face recognition | Opt-in UI + mock | Edge ML enrollment |
| Notifications | Webhook when Phase 3 server runs | Push |
| Object Analytics (AOA) | ✓ configure via VAPIX | Event ingest to server |

Full matrix: [features.md](features.md).

## Non-goals

- Multi-tenant commercial SaaS (v1)
- Covert or hidden recording modes
- Automated **identification** of strangers by face (detection + household registry only; see [face-recognition.md](face-recognition.md))
- Every camera OEM in v1 (Axis first)

## Success metrics (home)

| Metric | Direction |
|--------|-----------|
| Alert precision | Few false positives per camera per day |
| Time-to-answer | < 30s from alert to relevant clip |
| Uplink | Metadata + clips; no 24/7 offsite 4K |
| Trust | Visible retention, audit, CRA-aligned security |

## Related documents

- [vision.md](vision.md) — north star and principles
- [roadmap.md](roadmap.md) — phased delivery
- [ux-ai-first.md](ux-ai-first.md) — chat-first UX
- [features.md](features.md) — feature catalog
- [../architecture/overview.md](../architecture/overview.md) — system architecture
