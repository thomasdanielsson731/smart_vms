#!/usr/bin/env node
/**
 * 24h Phase 1 soak — preflight, checkpoints, and monitor.
 *
 * Usage:
 *   node scripts/soak-24h.mjs preflight
 *   node scripts/soak-24h.mjs start          # T+0, writes validation log
 *   node scripts/soak-24h.mjs checkpoint     # append checkpoint (auto milestone)
 *   node scripts/soak-24h.mjs monitor        # loop until T+24h (15 min interval)
 *
 * Env: SOAK_BASE_URL (default http://localhost:5173)
 *      SMARTVMS_ADMIN_USER / SMARTVMS_ADMIN_PASSWORD (or loaded from web/.env)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const VALIDATION_DIR = path.join(REPO_ROOT, 'docs', 'validation')
const WEB_ENV = path.join(REPO_ROOT, 'web', '.env')

const CAPTURE_INTERVAL_SEC = 30
const PASS_FRAME_RATIO = 0.95

const CHECKPOINTS = [
  { id: 'T+0', hours: 0 },
  { id: 'T+1h', hours: 1 },
  { id: 'T+6h', hours: 6 },
  { id: 'T+12h', hours: 12 },
  { id: 'T+24h', hours: 24 },
]

function loadWebEnv() {
  if (!fs.existsSync(WEB_ENV)) return
  for (const line of fs.readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] == null) process.env[key] = value
  }
}

function todayTag() {
  return new Date().toISOString().slice(0, 10)
}

function statePath() {
  return path.join(VALIDATION_DIR, `${todayTag()}-soak-state.json`)
}

function logPath() {
  return path.join(VALIDATION_DIR, `${todayTag()}-soak.md`)
}

function readState() {
  const fp = statePath()
  if (!fs.existsSync(fp)) return null
  return JSON.parse(fs.readFileSync(fp, 'utf8'))
}

function writeState(state) {
  fs.mkdirSync(VALIDATION_DIR, { recursive: true })
  fs.writeFileSync(statePath(), JSON.stringify(state, null, 2), 'utf8')
}

function appendLog(lines) {
  fs.mkdirSync(VALIDATION_DIR, { recursive: true })
  const block = `${lines.join('\n')}\n\n`
  if (!fs.existsSync(logPath())) {
    fs.writeFileSync(
      logPath(),
      `# 24h soak — ${todayTag()}\n\nSee [soak-test-24h.md](../engineering/soak-test-24h.md).\n\n`,
      'utf8',
    )
  }
  fs.appendFileSync(logPath(), block, 'utf8')
}

async function login(baseUrl) {
  const user = process.env.SMARTVMS_ADMIN_USER || 'admin'
  const password = process.env.SMARTVMS_ADMIN_PASSWORD || ''
  if (!password) {
    throw new Error('SMARTVMS_ADMIN_PASSWORD not set (web/.env or env)')
  }
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user, password }),
  })
  if (!res.ok) {
    throw new Error(`Login failed: HTTP ${res.status}`)
  }
  const setCookie = res.headers.get('set-cookie')
  if (!setCookie) throw new Error('Login OK but no session cookie')
  return setCookie.split(';')[0]
}

async function apiGet(baseUrl, cookie, pathname) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    headers: { Cookie: cookie },
  })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    /* ignore */
  }
  return { ok: res.ok, status: res.status, json, text }
}

async function collectMetrics(baseUrl, cookie) {
  const now = new Date()
  const from1h = new Date(now.getTime() - 3600_000)
  const from24h = new Date(now.getTime() - 24 * 3600_000)

  const [health, usage, segments1h, segments24h, authStatus] = await Promise.all([
    apiGet(baseUrl, cookie, '/api/recording/health'),
    apiGet(baseUrl, cookie, '/api/recording/usage'),
    apiGet(
      baseUrl,
      cookie,
      `/api/recording/segments?from=${encodeURIComponent(from1h.toISOString())}&to=${encodeURIComponent(now.toISOString())}`,
    ),
    apiGet(
      baseUrl,
      cookie,
      `/api/recording/segments?from=${encodeURIComponent(from24h.toISOString())}&to=${encodeURIComponent(now.toISOString())}`,
    ),
    apiGet(baseUrl, cookie, '/api/auth/status'),
  ])

  const healthMap = health.json?.health ?? {}
  const cameraIds = Object.keys(healthMap)
  const segments = segments1h.json?.segments ?? []
  const frames1h = segments.reduce((sum, s) => sum + (s.frameCount ?? 0), 0)
  const expectedFrames1h = cameraIds.length * (3600 / CAPTURE_INTERVAL_SEC)
  const frameRatio =
    expectedFrames1h > 0 ? frames1h / expectedFrames1h : cameraIds.length === 0 ? 0 : 1

  const offline = cameraIds.filter((id) => (healthMap[id]?.consecutiveFailures ?? 0) > 0)

  return {
    now: now.toISOString(),
    cameraCount: cameraIds.length,
    cameraIds,
    offlineCameras: offline,
    frames1h,
    expectedFrames1h,
    frameRatio,
    segmentCount1h: segments.length,
    segmentCount24h: (segments24h.json?.segments ?? []).length,
    usage: usage.json,
    authConfigured: authStatus.json?.configured ?? false,
    errors: [
      !health.ok && `health HTTP ${health.status}`,
      !usage.ok && `usage HTTP ${usage.status}`,
      !segments1h.ok && `segments HTTP ${segments1h.status}`,
    ].filter(Boolean),
  }
}

function evaluateCheckpoint(checkpointId, metrics, elapsedHours) {
  const notes = []
  let pass = metrics.errors.length === 0

  if (metrics.cameraCount === 0) {
    pass = false
    notes.push('No cameras in recording health map — sync cameras and enable recording.')
  }

  if (checkpointId === 'T+0') {
    notes.push(`Started with ${metrics.cameraCount} camera(s).`)
    if (!metrics.authConfigured) notes.push('Auth not fully configured.')
  }

  if (checkpointId === 'T+1h' || checkpointId === 'T+24h') {
    if (metrics.frameRatio < PASS_FRAME_RATIO) {
      pass = false
      notes.push(
        `Frame ratio ${(metrics.frameRatio * 100).toFixed(1)}% < ${PASS_FRAME_RATIO * 100}% target.`,
      )
    } else {
      notes.push(`Frame ratio ${(metrics.frameRatio * 100).toFixed(1)}% OK.`)
    }
  }

  if (metrics.offlineCameras.length > 0) {
    notes.push(`Offline/degraded: ${metrics.offlineCameras.join(', ')}`)
  }

  if (metrics.usage?.isOverQuota) {
    pass = false
    notes.push('Recording over quota.')
  }

  if (checkpointId === 'T+24h' && elapsedHours < 23.5) {
    notes.push('Final sign-off requires ~24h elapsed.')
  }

  return { pass, notes }
}

async function runCheckpoint(label, state) {
  loadWebEnv()
  const baseUrl = process.env.SOAK_BASE_URL || 'http://localhost:5173'
  const cookie = await login(baseUrl)
  const metrics = await collectMetrics(baseUrl, cookie)
  const elapsedHours = (Date.now() - Date.parse(state.startedAt)) / 3600_000
  const { pass, notes } = evaluateCheckpoint(label, metrics, elapsedHours)

  const entry = {
    checkpoint: label,
    at: metrics.now,
    elapsedHours: Number(elapsedHours.toFixed(2)),
    pass,
    metrics,
    notes,
  }

  state.checkpoints = state.checkpoints || []
  state.checkpoints.push(entry)
  state.lastCheckpointAt = metrics.now
  writeState(state)

  appendLog([
    `## ${label} — ${metrics.now}`,
    '',
    `**Result:** ${pass ? 'PASS' : 'FAIL'}`,
    '',
    `- Cameras: ${metrics.cameraCount}`,
    `- Frames (1h window): ${metrics.frames1h} / ~${Math.round(metrics.expectedFrames1h)} expected`,
    `- Segments (1h): ${metrics.segmentCount1h}`,
    `- Segments (24h): ${metrics.segmentCount24h}`,
    ...(notes.length ? notes.map((n) => `- ${n}`) : []),
  ])

  console.log(`[soak] ${label}: ${pass ? 'PASS' : 'FAIL'}`)
  for (const n of notes) console.log(`  - ${n}`)
  return entry
}

async function preflight() {
  loadWebEnv()
  const baseUrl = process.env.SOAK_BASE_URL || 'http://localhost:5173'
  console.log(`[soak] Preflight → ${baseUrl}`)

  try {
    const status = await fetch(`${baseUrl}/api/auth/status`)
    if (!status.ok) throw new Error(`HTTP ${status.status}`)
  } catch {
    console.error('[soak] FAIL: UI not reachable. Start: cd web && npm run dev')
    process.exit(1)
  }

  if (!process.env.SMARTVMS_ADMIN_PASSWORD) {
    console.error('[soak] FAIL: SMARTVMS_ADMIN_PASSWORD missing in web/.env')
    process.exit(1)
  }

  const cookie = await login(baseUrl)
  const metrics = await collectMetrics(baseUrl, cookie)

  if (metrics.cameraCount === 0) {
    console.warn('[soak] WARN: No cameras in recording health — onboard and enable recording.')
  }

  console.log(`[soak] PASS preflight — ${metrics.cameraCount} camera(s), auth OK`)
  return metrics
}

async function startSoak() {
  await preflight()
  const state = {
    startedAt: new Date().toISOString(),
    baseUrl: process.env.SOAK_BASE_URL || 'http://127.0.0.1:5173',
    checkpoints: [],
  }
  writeState(state)
  appendLog([`## Soak started`, '', `**Started at:** ${state.startedAt}`, ''])
  await runCheckpoint('T+0', state)
  console.log(`[soak] Log: ${logPath()}`)
  console.log('[soak] Run monitor: node scripts/soak-24h.mjs monitor')
}

async function checkpoint() {
  const state = readState()
  if (!state) {
    console.error('[soak] No active soak. Run: node scripts/soak-24h.mjs start')
    process.exit(1)
  }
  const elapsedHours = (Date.now() - Date.parse(state.startedAt)) / 3600_000
  let label = 'T+manual'
  for (const cp of CHECKPOINTS) {
    if (elapsedHours >= cp.hours - 0.1) label = cp.id
  }
  await runCheckpoint(label, state)
}

async function monitor() {
  const state = readState()
  if (!state) {
    console.error('[soak] No active soak. Run: node scripts/soak-24h.mjs start')
    process.exit(1)
  }

  const intervalMs = Number(process.env.SOAK_MONITOR_INTERVAL_MS || 15 * 60_000)
  console.log(`[soak] Monitoring every ${intervalMs / 60000} min until T+24h`)

  while (true) {
    const elapsedHours = (Date.now() - Date.parse(state.startedAt)) / 3600_000
    const done = state.checkpoints?.some((c) => c.checkpoint === 'T+24h')
    if (elapsedHours >= 24 || done) {
      await runCheckpoint('T+24h', readState())
      console.log('[soak] Complete. Review log and check pass criteria in soak-test-24h.md')
      break
    }

    for (const cp of CHECKPOINTS) {
      const already = state.checkpoints?.some((c) => c.checkpoint === cp.id)
      if (!already && elapsedHours >= cp.hours) {
        await runCheckpoint(cp.id, readState())
        Object.assign(state, readState())
      }
    }

    await new Promise((r) => setTimeout(r, intervalMs))
    Object.assign(state, readState())
  }
}

const cmd = process.argv[2] || 'preflight'
const handlers = { preflight, start: startSoak, checkpoint, monitor }
const fn = handlers[cmd]
if (!fn) {
  console.error(`Unknown command: ${cmd}. Use: ${Object.keys(handlers).join(', ')}`)
  process.exit(1)
}

fn().catch((err) => {
  console.error('[soak] ERROR:', err.message)
  process.exit(1)
})
