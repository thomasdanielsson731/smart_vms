# Product roadmap

Phases are **sequential in intent** but may overlap in implementation. Each phase has exit criteria before expanding scope.

---

## Phase 0 — Foundation

**Status:** Complete

**Deliverables**

- Product and architecture documentation
- ADR process, engineering principles, test strategy
- Cursor rules + review skills for consistent AI feedback
- Vitest unit tests + CI for `web/`

**Exit criteria**

- [x] Architecture overview agreed (edge/server split, event model sketched)
- [x] Axis VAPIX integration approach documented
- [x] Phase 1 scope written as implementable stories

---

## Phase 1 — VMS core + operator UI

**Status:** In progress — `web/` shell shipped; recording backend pending

**Goal:** Trustworthy video operations on Axis cameras with chat-first operator UX.

| Item | Notes | Status |
|------|--------|--------|
| Operator UI (chat-first) | Workspaces, Copilot, sidebar | **Shipped** (mock data) |
| Auth | Session, admin/viewer | **Shipped** |
| VAPIX live view | MJPEG proxy, stream test | **Shipped** |
| VAPIX credential vault | Encrypted file + Settings | **Shipped** |
| Camera web UI proxy | Embedded Axis pages | **Shipped** |
| Camera registry | Host per camera, mock metadata | Partial |
| Recording | Continuous, retention | **Planned** |
| Playback timeline | Seek, export | Mock UI |
| Unit + contract tests | Vitest, VAPIX fixtures | **Shipped** |

**Exit criteria**

- 24h soak: all home Axis cameras record and playback without manual intervention
- Runbook for "camera offline" and "disk full"

---

## Phase 2 — Edge analytics

**Goal:** Useful alerts without shipping full video upstream.

| Item | Notes |
|------|--------|
| Edge agent | RTSP or camera-native stream ingest |
| Detector v1 | Person + vehicle (configurable classes) |
| Zones & schedules | Polygon ROIs; quiet hours |
| Event emission | Normalized detection + incident schema |
| Clip pipeline | Ring buffer; upload on rule match |
| VAPIX complement | Subscribe to native events where they reduce compute |

**Exit criteria**

- UC-1 (zone intrusion) demo on at least two cameras
- False positive rate acceptable on 7-day home trial (qualitative + count)

---

## Phase 3 — Server analytics & operator UX

**Goal:** Correlation, search, and richer automation.

| Item | Notes |
|------|--------|
| Event bus ingress | MQTT or NATS; backpressure |
| Incident store | Postgres + object storage for clips |
| Re-analysis | Heavier models on selected clips |
| Cross-camera rules | Same object track across views (stretch) |
| Web UI backend | Replace mock data with real APIs |
| Notifications | Webhook, email, mobile push (pick one for v1) |

**Exit criteria**

- UC-2 semantic search on 7+ days of metadata
- Dashboard shows system health and AI pipeline lag

---

## Phase 4 — Hardening & optional remote

| Item | Notes |
|------|--------|
| Backup / export | Encrypted offsite optional |
| HA patterns | Single-server acceptable for home; document SPOFs |
| Remote access | Tailscale or reverse proxy pattern (ADR) |
| Model lifecycle | Version pinning, rollback, benchmark set |

---

## Story template (for Phase 1+)

```markdown
### [ID] Title
**Phase:** 1
**User value:** One sentence
**Acceptance:**
- [ ] ...
**Test notes:** contract / e2e / manual
**ADR:** link or N/A
```

---

## Risks register (living)

| Risk | Mitigation |
|------|------------|
| Axis API variance by firmware | Capability matrix; fixture recordings per model |
| Edge GPU unavailable | CPU fallback; degrade to VAPIX-only events |
| Storage growth | Retention tiers; event-only days vs clip days |
| Privacy incident | Defaults off for sensitive zones; audit log |

Update this table when risks materialize; do not hide in chat history.
