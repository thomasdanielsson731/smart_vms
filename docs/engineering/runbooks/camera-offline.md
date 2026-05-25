# Runbook: Camera offline

**When:** Live view fails, stream test red, or recording gaps for one camera.

## Symptoms

- Camera card shows **Offline** or **Degraded**
- Stream test: unreachable / auth failed
- Recording manifest missing recent frames for `camera_id`

## Steps

1. **Ping** camera IP from the Smart VMS host.
2. **Browser:** open Camera web workspace — if Axis UI loads, VAPIX creds are OK.
3. **Settings → VAPIX:** run stream test for the camera.
4. **Axis device:** check power, cable/Wi‑Fi, firmware, and that HTTP/HTTPS is enabled.
5. **Credentials:** rotate VAPIX password on camera and update Settings (encrypted vault).
6. **Recording:** gaps are expected while offline; retention policy removes oldest when quota applies.

## Escalation

- Replace cable / PoE injector
- Factory reset only with documented recovery plan (re-onboard via Configuration)
