# 24-hour soak test checklist (Phase 1 exit)

**Goal:** All home Axis cameras record and playback without manual intervention for 24 h.

## Preconditions

- VAPIX password configured in Settings
- Cameras onboarded; `recordingEnabled: true`
- `SMARTVMS_RECORDING_DIR` on a disk with ≥2× quota free space

## Procedure

| Time | Check |
|------|--------|
| T+0 | Note camera count; open Video workspace playback at T−1 h (empty OK) |
| T+1 h | `GET /api/recording/segments` returns segments for each camera |
| T+6 h | No auth session expiry blocking UI (re-login if TTL exceeded) |
| T+12 h | Disk usage stable under quota; no runaway growth |
| T+24 h | Timeline scrub shows continuous segments; live view still works |

## Pass criteria

- [ ] ≥95 % expected frames (30 s interval) per online camera
- [ ] No unhandled server crashes in dev/preview logs
- [ ] Runbooks linked from ops docs suffice for single-camera failure

## Fail actions

- Capture logs + manifest.json snapshot
- File issue with camera model, firmware, and gap timestamps
