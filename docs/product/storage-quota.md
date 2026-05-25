# Recording storage quota

**Status:** Decided — enforced by recording service

## Operator settings

| Field | Meaning |
|-------|---------|
| Max recordings (GiB) | Hard quota for continuous snapshot recording |
| Max event clips (GiB) | Separate cap; 0 = 10% of recording quota |
| Max retention (days) | Time-based purge even when space remains |
| Warn at % | Dashboard warning threshold |
| When quota full | `delete_oldest` \| `stop_recording` \| `warn_only` |

## Where configured

- **Settings** workspace (chat: "storage settings", "open settings")
- Saved to recording service (`recordings/storage-settings.json`) and mirrored in browser `localStorage`

## API

| Method | Path | Role |
|--------|------|------|
| GET | `/api/recording/settings` | Read quota |
| PUT | `/api/recording/settings` | Admin — update quota |
| GET | `/api/recording/usage` | Used bytes + percent |
| GET | `/api/recording/health` | Per-camera capture success/failure |

## Related

- [data-model-and-events.md](../architecture/data-model-and-events.md)
- [runbooks/disk-full.md](../engineering/runbooks/disk-full.md)
