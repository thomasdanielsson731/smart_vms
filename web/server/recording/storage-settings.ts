import fs from 'node:fs'
import path from 'node:path'
import type { RecordingStorageSettings } from '../../src/types/storage'
import { ensureRecordingDir } from './store'

const SETTINGS_FILE = 'storage-settings.json'

export function defaultRecordingStorageSettings(): RecordingStorageSettings {
  return {
    maxRecordingGiB: 100,
    maxClipsGiB: 50,
    maxRetentionDays: 30,
    warnAtPercent: 85,
    onLimitReached: 'delete_oldest',
  }
}

export function loadRecordingStorageSettings(root: string): RecordingStorageSettings {
  try {
    const raw = fs.readFileSync(path.join(root, SETTINGS_FILE), 'utf8')
    const parsed = JSON.parse(raw) as Partial<RecordingStorageSettings>
    return { ...defaultRecordingStorageSettings(), ...parsed }
  } catch {
    return defaultRecordingStorageSettings()
  }
}

export function saveRecordingStorageSettings(
  root: string,
  settings: RecordingStorageSettings,
): void {
  ensureRecordingDir(root)
  fs.writeFileSync(path.join(root, SETTINGS_FILE), JSON.stringify(settings, null, 2), 'utf8')
}
