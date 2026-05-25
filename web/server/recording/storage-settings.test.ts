import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  defaultRecordingStorageSettings,
  loadRecordingStorageSettings,
  saveRecordingStorageSettings,
} from './storage-settings'

describe('recording storage settings', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'svms-rec-'))

  afterEach(() => {
    try {
      fs.rmSync(tmp, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
  })

  it('returns defaults when file missing', () => {
    expect(loadRecordingStorageSettings(tmp).maxRecordingGiB).toBe(100)
  })

  it('round-trips saved settings', () => {
    const settings = { ...defaultRecordingStorageSettings(), maxRecordingGiB: 250, maxRetentionDays: 14 }
    saveRecordingStorageSettings(tmp, settings)
    expect(loadRecordingStorageSettings(tmp).maxRecordingGiB).toBe(250)
    expect(loadRecordingStorageSettings(tmp).maxRetentionDays).toBe(14)
  })
})
