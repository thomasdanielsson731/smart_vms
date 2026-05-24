# Ideas backlog

Unprioritized product and technical ideas. **Do not treat as committed.** Promote to roadmap with explicit prioritization.

## Analytics & AI

- Loitering detection (dwell time in zone)
- Line crossing with direction (in/out)
- PPE or helmet (unlikely for home v1)
- Audio anomaly (glass break) — legal review required
- Scene change / camera tamper via frame statistics
- “Same event” clustering across cameras (correlation id)
- Model A/B on server with shadow mode (no user alert)
- Use Axis **ACAP** apps where they outperform external edge box

## Operator experience

- Natural language search (“red car yesterday”) — server LLM on metadata only
- Weekly digest email: incident counts, camera uptime
- Floor plan map view with camera icons and live status
- One-click “export evidence package” (clip + metadata JSON + hashes)
- Maintenance mode: suppress alerts during known work (gardening, delivery)

## Integrations

- Home Assistant: entities for person-in-zone, camera state
- MQTT topics for automations (lights, siren — use carefully)
- ONVIF for non-Axis cameras (later; keep VAPIX path clean)
- Frigate/NVR migration import tool

## Platform

- Plugin interface for custom rules (WASM or sandboxed Python)
- Multi-site (vacation home) under one account
- Read-only API keys for family apps

## Engineering experiments

- Record/replay VAPIX event streams for CI
- Synthetic video fixtures for detector regression
- eBPF or kernel tap for stream metrics (probably overkill)

---

## How to promote an idea

1. Name the **user value** and **phase** it fits.
2. List **dependencies** (hardware, legal, Axis feature).
3. Add **acceptance sketch** or spike timebox.
4. Move to [roadmap.md](roadmap.md) or create an ADR if architectural.
