# Face recognition

**Status:** Proposed — UI + mock (Phase 2 edge inference)

## Overview

Opt-in **face recognition** identifies enrolled household members, guests, and recurring service visitors. Unknown faces can trigger elevated alarms when enabled.

Distinct from **face detection** (bbox only, no identity) which remains the default for indoor cameras.

## Privacy & CRA

| Control | Behavior |
|---------|----------|
| Default | **Off** until admin enables |
| Consent | Checkbox required before activation |
| Storage | Profiles in browser localStorage (Phase 1 mock); embeddings on edge/server in Phase 2 |
| Viewer role | Can see matches; only admin enrolls/removes profiles |
| Audit | Credential/auth events logged; face enroll backlog |

See [security-and-privacy.md](../engineering/security-and-privacy.md) and [cyber-resilience-act.md](../engineering/cyber-resilience-act.md).

## Operator UX

| Surface | Purpose |
|---------|---------|
| **Ansikten** workspace | Fyra flikar: **Från video**, Hantera, Händelser, Inställningar |
| **Från video** | Live eller inspelat klipp → skanna → klicka ansikte → namnge |
| **Forensic** | `faceMatch` badge on incidents |
| **Chat** | «Namnge person från video», «ansiktsigenkänning» |

## Data model

```typescript
FaceProfile { id, name, role, enrolledAt, color, notes? }
FaceRecognitionSettings { enabled, minConfidence, alertOnUnknown, cameraIds, consentAcknowledgedAt }
FaceMatch { profileId?, displayName, confidence, unknown }
```

Events emit as `face.recognized` (Phase 2) linked to `incident_id` when applicable.

## Per-camera memory

Each enrolled face is stored in **`rememberedByCameras`** — the camera that taught the profile keeps a local memory index (Phase 2: edge agent per camera).

- Enroll from **Uppfart** → only **Uppfart** recognizes that person by default
- Same person can be taught on another camera with a second enrollment
- Live video shows green name tags for remembered faces on that camera

```mermaid
flowchart LR
  CAM[Camera frame] --> DET[Face detect]
  DET --> EMB[Embedding]
  EMB --> MATCH[Match registry]
  MATCH --> EVT[face.recognized event]
  EVT --> INC[Incident enrich]
```

- Embeddings stored **on-prem only**; never in cloud by default
- Minimum confidence threshold configurable (default 75 %)
- Unknown-face alerts optional

## Non-goals (v1 mock)

- No cloud face database
- No enrollment from uploaded photos yet (name-only mock register)
- No real-time overlay on live video

## Related

- [data-model-and-events.md](../architecture/data-model-and-events.md)
- [forensic.md](forensic.md)
