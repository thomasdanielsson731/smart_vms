# Product vision — Smart VMS

## North star

**An AI-native video system you trust at home:** Axis cameras stay the source of truth for video, while Smart VMS adds **understanding** (what happened, where, when) without turning your network into a surveillance product you do not control.

## Problem statement

Traditional NVR/VMS software optimizes for **recording and playback**. Operators still spend time scrubbing timelines. Cloud cameras optimize for **vendor lock-in and subscription analytics**. Home power users with **Axis + VAPIX** want:

- Local-first control and retention
- Meaningful alerts (not motion spam)
- Search by **semantics** (person, vehicle, package, zone breach)
- Clear **privacy boundaries** (what never leaves the house)

## What Smart VMS is

| Pillar | Description |
|--------|-------------|
| **AI operator (Copilot)** | Chat-first UI; opens video, stats, tracking, monitoring agents on intent |
| **VMS core** | Discovery, live view, recording, timeline, export |
| **Edge intelligence** | Per-camera inference, zones, clip-on-event, offline tolerance |
| **Server intelligence** | Correlation, re-analysis, search, dashboards, automation |
| **Axis-native** | VAPIX events, parameters, streams — not generic RTSP-only |

## Differentiation (why build this)

1. **VAPIX-first** — use Axis event subscriptions, I/O, parameters; RTSP is transport, not the product API.
2. **Edge + server split by design** — metadata uplink, not mandatory full-time cloud ingest.
3. **Engineering-grade** — testable contracts, ADRs, operability for a senior owner-operator.
4. **Home-appropriate privacy** — defaults that assume family, guests, and legal sensitivity.

## Success metrics (home deployment)

| Metric | Target direction |
|--------|------------------|
| Alert precision | Few false positives per day per camera |
| Time-to-answer | &lt; 30s from notification to relevant clip |
| Uplink usage | Metadata + clips only; no full-time offsite 4K |
| Recovery | Survive edge box reboot without manual re-pairing |
| Trust | Clear audit of what is stored, for how long, and where |

## Non-goals (explicit)

- Competing with Axis Camera Station as a generic VMS SKU
- Multi-tenant commercial SaaS (may reuse patterns later; not v1)
- Covert monitoring features or “hidden” recording modes
- Automated **identification** of individuals by face (detection/aggregation may be in scope; see security doc)
- Supporting every camera OEM in v1 (Axis first; abstractions later)

## Product principles

1. **Local by default** — cloud optional, never required for core safety.
2. **Explainable alerts** — every notification links to clip, rule, and confidence.
3. **Progressive enhancement** — recording works without AI; AI deepens value.
4. **Operator respect** — no dark patterns; retention and privacy are visible settings.

## Relationship to roadmap

Phased delivery is in [roadmap.md](roadmap.md). Vision stays stable; roadmap items move.

## Open strategic questions

- Live view in browser: WebRTC vs HLS-only for v1?
- Single home server vs optional remote access (Tailscale, etc.)?
- Use Axis on-camera analytics (ACAP) vs external edge box only?

Record decisions in `docs/decisions/` when resolved.
