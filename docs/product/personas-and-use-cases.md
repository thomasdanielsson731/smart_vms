# Personas and use cases

## Primary persona: Owner-operator (you)

**Profile:** Senior engineering leader; runs Axis cameras at home via VAPIX; values architecture quality, test discipline, and maintainability.

**Goals**

- Reliable coverage of property (driveway, entry, garden)
- Actionable alerts with minimal false positives
- Fast answers: “Was that a person or a cat?” without 20 minutes of scrubbing
- Full control of data location and retention

**Frustrations**

- Motion-based alerts that fire on trees and shadows
- Black-box cloud analytics
- Fragile home-lab setups without documentation or tests

---

## Secondary persona: Household member (read-only)

**Profile:** Family member who checks live view or recent events on phone; does not configure system.

**Goals:** Simple app/UI, clear “nothing to worry about” vs “look at this clip.”

**Constraints:** No admin APIs; minimal exposure of historical search across private areas.

---

## Tertiary persona: Future contributor (human or AI)

**Profile:** Developer extending integrations or analytics.

**Goals:** Clear contracts, ADRs, reproducible dev environment.

---

## Use cases (prioritized)

### UC-1 — Zone intrusion with clip

**Trigger:** Person enters defined zone after quiet hours.  
**Flow:** Edge detects → rule engine → 10s pre / 20s post clip → push notification → timeline marker.  
**Success:** Correct object class; clip starts before entry; &lt; 5s notification latency on LAN.

### UC-2 — Semantic search on timeline

**Trigger:** “Show vehicles at front gate last Tuesday afternoon.”  
**Flow:** Server index on detection metadata → filtered timeline → playback.  
**Success:** Results match manual review sample; p95 query &lt; 2s on home hardware.

### UC-3 — Package / object at door (stretch)

**Trigger:** Stationary object appears in porch zone.  
**Depends on:** Model quality and stable camera angle.

### UC-4 — Camera health and drift

**Trigger:** Stream lost, focus night/day failure, clock skew.  
**Flow:** VAPIX + stream probes → operator alert → runbook link.

### UC-5 — Privacy-safe guest mode (future)

**Trigger:** Guests visiting; reduce retention in interior-facing cameras or disable recording by schedule.

---

## Anti-use-cases (do not optimize for)

- Continuous facial identification of neighbors
- Covert audio recording without local legal review
- Sharing clips to social platforms (export is fine; product is not “social”)

---

## Acceptance themes (cross-cutting)

| Theme | Example acceptance cue |
|-------|-------------------------|
| Explainability | Alert shows rule name + threshold + model version |
| Idempotency | Same VAPIX event id does not create duplicate incidents |
| Degradation | If AI offline, recording and live view still work |
| Audit | Export list of retained clips per camera per week |
