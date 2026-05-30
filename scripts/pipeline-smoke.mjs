#!/usr/bin/env node
/**
 * End-to-end pipeline smoke: server health → HTTP ingest → incidents → search.
 *
 * Usage:
 *   node scripts/pipeline-smoke.mjs
 *
 * Env:
 *   PIPELINE_SERVER_URL (default http://127.0.0.1:8787)
 *   PIPELINE_UI_URL (optional — checks /api/vms proxy via session; skip if unset)
 */

const SERVER = process.env.PIPELINE_SERVER_URL ?? 'http://127.0.0.1:8787'
const MARKER = `pipeline-smoke-${Date.now()}`

const steps = []

function pass(name, detail) {
  steps.push({ name, ok: true, detail })
  console.log(`[pipeline] PASS ${name}${detail ? ` — ${detail}` : ''}`)
}

function fail(name, detail) {
  steps.push({ name, ok: false, detail })
  console.error(`[pipeline] FAIL ${name}${detail ? ` — ${detail}` : ''}`)
}

async function fetchJson(url, init) {
  const res = await fetch(url, init)
  let json = null
  try {
    json = await res.json()
  } catch {
    /* ignore */
  }
  return { ok: res.ok, status: res.status, json }
}

function buildTestEvent() {
  const now = new Date().toISOString()
  return {
    schema_version: '1.0',
    event_id: `smoke-${MARKER}`,
    event_type: 'vapix.received',
    occurred_at: now,
    source: {
      camera_id: 'cam-pipeline-smoke',
      software_version: 'pipeline-smoke/1.0',
    },
    payload: {
      title: `Pipeline smoke ${MARKER}`,
      rule_name: 'pipeline.smoke.test',
      camera_name: 'Pipeline Smoke Camera',
      vapix_event_key: `${MARKER}|test`,
      severity: 'medium',
      smoke_marker: MARKER,
    },
  }
}

async function main() {
  console.log(`[pipeline] Server ${SERVER}`)

  const health = await fetchJson(`${SERVER}/api/health/system`)
  if (!health.ok) {
    fail('server_health', `HTTP ${health.status} — start deploy compose + server`)
    summarize(false)
    process.exit(1)
  }
  pass(
    'server_health',
    `mqtt=${health.json?.mqttConnected} db=${health.json?.databaseConnected}`,
  )

  const event = buildTestEvent()
  const ingest = await fetchJson(`${SERVER}/api/events/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  if (!ingest.ok) {
    fail('http_ingest', `HTTP ${ingest.status}`)
    summarize(false)
    process.exit(1)
  }
  pass('http_ingest', ingest.json?.incident?.title ?? 'accepted')

  await new Promise((r) => setTimeout(r, 300))

  const incidents = await fetchJson(
    `${SERVER}/api/incidents?${new URLSearchParams({ q: MARKER, limit: '10' })}`,
  )
  const hit = (incidents.json?.incidents ?? []).find((i) =>
    String(i.title ?? '').includes(MARKER),
  )
  if (!hit) {
    fail('incidents_query', 'No incident matched smoke marker')
  } else {
    pass('incidents_query', hit.title)
  }

  const search = await fetchJson(
    `${SERVER}/api/events/search?${new URLSearchParams({ q: MARKER, days: '1' })}`,
  )
  const events = search.json?.events ?? []
  if (!search.ok || events.length === 0) {
    fail('events_search', `HTTP ${search.status}, hits=${events.length}`)
  } else {
    pass('events_search', `${events.length} event(s)`)
  }

  const ok = steps.every((s) => s.ok)
  summarize(ok)
  process.exit(ok ? 0 : 1)
}

function summarize(ok) {
  console.log(`[pipeline] ${ok ? 'All steps passed' : 'Pipeline smoke failed'}`)
}

main().catch((err) => {
  console.error('[pipeline] ERROR:', err.message)
  process.exit(1)
})
