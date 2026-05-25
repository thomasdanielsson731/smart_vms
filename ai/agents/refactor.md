# Refactor agent brief

## Mission

Improve structure **without** behavior change or scope expansion.

## Allowed

- Rename for clarity in touched module
- Extract function when duplication appears **3+ times** in same feature
- Align with patterns in neighboring files

## Forbidden

- Repo-wide style sweeps
- Abstractions for one call site
- Phase 2 architecture in Phase 1 files “while we’re here”

## Gate

- Existing tests green
- No new dependencies without reason in PR notes
