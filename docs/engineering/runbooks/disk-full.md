# Runbook: Disk full / recording quota

**When:** Storage warning in Settings, or recording stops per policy.

## Symptoms

- Dashboard / Settings shows recording usage ≥ warn threshold (default 85 %)
- Policy `stop_recording` — no new frames captured
- Policy `delete_oldest` — oldest segments removed automatically

## Steps

1. **Settings → Recording storage:** note used GiB vs quota.
2. **Reduce retention:** lower `maxRetentionDays` or `maxRecordingGiB`.
3. **Free space:** archive `recordings/` to external disk if needed (Phase 1 path: `web/recordings/` or `SMARTVMS_RECORDING_DIR`).
4. **Disable recording** on non-critical cameras (Configuration → Cameras).
5. **Verify** usage API: `GET /api/recording/usage` (admin/viewer session).

## Prevention

- Set quota below physical disk free space (leave ≥20 % headroom for OS)
- Monitor weekly via Dashboard (Phase 3 automation)
