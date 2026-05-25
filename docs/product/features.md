# Feature catalog

**Status:** Living document — update when a feature moves from mock → real.

Legend: **Real** = production path exists · **Mock** = UI/types only · **Planned** = on roadmap

## Workspaces (operator surfaces)

| Workspace | ID | Description | Status |
|-----------|-----|-------------|--------|
| Copilot chat | (home) | Main interface; opens other workspaces | **Real** LLM + intent routing |
| Video | `video` | Live and playback per camera | **Real** live · **Mock** playback |
| Dashboard | `dashboard` | Stats, storage, recent alarms | **Mock** metrics |
| Forensic | `forensic` | Timeline of recordings + alarms | **Mock** data |
| Map | `map` | Camera placement, FOV, alarm pins | **Real** map · **Mock** alarm geo |
| Face recognition | `faces` | Enroll, manage, events, settings | **Mock** detect · opt-in |
| Camera web | `camera-web` | Embedded Axis device UI | **Real** proxied |
| Onboarding | `onboarding` | LAN discovery, bulk register | **Mock** discovery |
| Create alarm | `alarms` | Monitoring rules, bulk per camera | **Mock** persistence |
| Agents | `agents` | List/pause monitoring policies | **Mock** |
| Tracking | `tracking` | Cross-camera re-id | **Planned** Phase 3 |
| Settings | `settings` | Auth, cameras, storage | **Real** partial |

## VMS core

| Feature | Status | Doc |
|---------|--------|-----|
| Camera registry (name, host, status) | Mock + editable IP | [multi-config.md](multi-config.md) |
| Shared VAPIX credentials | **Real** (encrypted file) | [../engineering/authentication.md](../engineering/authentication.md) |
| Live view (MJPEG / snapshot fallback) | **Real** | [../engineering/axis-live-stream.md](../engineering/axis-live-stream.md) |
| Stream connectivity test | **Real** | — |
| Recording storage quota UI | Mock usage | [storage-quota.md](storage-quota.md) |
| Continuous recording | **Planned** | [roadmap.md](roadmap.md) Phase 1 |
| Timeline playback | **Mock** | [forensic.md](forensic.md) |
| Clip export | **Planned** | [forensic.md](forensic.md) |

## Analytics & alarms

| Feature | Status | Doc |
|---------|--------|-----|
| Alarm list + thumbnails | **Mock** | — |
| Tier-2 post-alarm analysis | **Mock** | [alarm-tier2-analytics.md](alarm-tier2-analytics.md) |
| Face match on incidents | **Mock** | [face-recognition.md](face-recognition.md) |
| Zone / schedule rules | UI only | — |
| VAPIX event ingest | **Planned** | [../architecture/axis-vapix.md](../architecture/axis-vapix.md) |
| Edge person/vehicle detect | **Planned** | [../architecture/edge-vs-server.md](../architecture/edge-vs-server.md) |

## AI & Copilot

| Feature | Status | Doc |
|---------|--------|-----|
| Local LLM (Ollama / Qwen) | **Real** | [../engineering/ollama-copilot.md](../engineering/ollama-copilot.md) |
| Keyword intent routing | **Real** | [ux-ai-first.md](ux-ai-first.md) |
| LLM tool calling to APIs | **Planned** | — |
| Monitoring agents (runtime) | **Mock** | [ux-ai-first.md](ux-ai-first.md) |

## Security & privacy

| Feature | Status | Doc |
|---------|--------|-----|
| Login required | **Real** | [../engineering/authentication.md](../engineering/authentication.md) |
| Admin vs viewer roles | **Real** | — |
| Encrypted VAPIX storage | **Real** | [../engineering/security-and-privacy.md](../engineering/security-and-privacy.md) |
| Audit log (credential events) | **Real** | [../engineering/cyber-resilience-act.md](../engineering/cyber-resilience-act.md) |
| Face recognition opt-in + consent | **Real** UI gate | [face-recognition.md](face-recognition.md) |

## Integrations

| Feature | Status | Doc |
|---------|--------|-----|
| Axis VAPIX (digest) | **Real** | [../architecture/axis-vapix.md](../architecture/axis-vapix.md) |
| OpenStreetMap (map workspace) | **Real** | [map-view.md](map-view.md) |
| MQTT / event bus | **Planned** | [../architecture/data-model-and-events.md](../architecture/data-model-and-events.md) |

## Quality

| Feature | Status | Doc |
|---------|--------|-----|
| Vitest unit + contract tests | **Real** | [../engineering/testing-strategy.md](../engineering/testing-strategy.md) |
| CI (test + build) | **Real** | `.github/workflows/ci.yml` |
| E2E smoke (Playwright) | **Planned** | [../engineering/testing-strategy.md](../engineering/testing-strategy.md) |
