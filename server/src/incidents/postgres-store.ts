import type { IncidentDto, IncidentQuery, SmartVmsEvent } from '../types.js'
import { getPool } from '../db/pool.js'
import {
  buildSearchText,
  incidentFromEvent,
  shouldOpenIncident,
  type IncidentRepository,
} from './repository.js'

export class PostgresIncidentRepository implements IncidentRepository {
  async ingestEvent(event: SmartVmsEvent): Promise<IncidentDto | null> {
    const pool = await getPool()
    if (!pool) throw new Error('database_unavailable')

    const ingestedAt = new Date().toISOString()
    const searchText = buildSearchText(event)

    await pool.query(
      `INSERT INTO events (event_id, event_type, occurred_at, ingested_at, camera_id, edge_node_id, trace_id, payload, search_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (event_id) DO NOTHING`,
      [
        event.event_id,
        event.event_type,
        event.occurred_at,
        ingestedAt,
        event.source.camera_id,
        event.source.edge_node_id ?? null,
        event.trace_id ?? null,
        JSON.stringify(event.payload),
        searchText,
      ],
    )

    const lag = Math.max(0, Date.parse(ingestedAt) - Date.parse(event.occurred_at))
    await pool.query(
      `UPDATE pipeline_stats SET
         events_ingested_total = events_ingested_total + 1,
         last_event_at = $1,
         avg_pipeline_lag_ms = (avg_pipeline_lag_ms * GREATEST(events_ingested_total, 1) + $2) / (GREATEST(events_ingested_total, 1) + 1)
       WHERE id = 1`,
      [ingestedAt, lag],
    )

    if (!shouldOpenIncident(event)) return null

    const incident = incidentFromEvent(event)
    await pool.query(
      `INSERT INTO incidents (id, title, camera_id, camera_name, severity, status, occurred_at, rule_name, clip_start_at, clip_end_at, duration_sec, linked_event_ids)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        incident.id,
        incident.title,
        incident.cameraId,
        incident.cameraName,
        incident.severity,
        incident.status,
        incident.occurredAt,
        incident.ruleName ?? null,
        incident.clipStartAt,
        incident.clipEndAt,
        incident.durationSec,
        JSON.stringify([event.event_id]),
      ],
    )
    return incident
  }

  async listIncidents(query: IncidentQuery): Promise<IncidentDto[]> {
    const pool = await getPool()
    if (!pool) return []

    const clauses: string[] = ['1=1']
    const params: unknown[] = []
    let idx = 1

    if (query.from) {
      clauses.push(`occurred_at >= $${idx++}`)
      params.push(query.from.toISOString())
    }
    if (query.to) {
      clauses.push(`occurred_at <= $${idx++}`)
      params.push(query.to.toISOString())
    }
    if (query.cameraId) {
      clauses.push(`camera_id = $${idx++}`)
      params.push(query.cameraId)
    }
    if (query.q) {
      clauses.push(
        `(title ILIKE $${idx} OR rule_name ILIKE $${idx} OR camera_name ILIKE $${idx})`,
      )
      params.push(`%${query.q}%`)
      idx++
    }

    params.push(query.limit ?? 200)
    const sql = `SELECT id, title, camera_id, camera_name, severity, status, occurred_at, rule_name, clip_start_at, clip_end_at, duration_sec
                 FROM incidents WHERE ${clauses.join(' AND ')}
                 ORDER BY occurred_at DESC LIMIT $${idx}`

    const result = await pool.query(sql, params)
    return result.rows.map(rowToDto)
  }

  async countOpen(): Promise<number> {
    const pool = await getPool()
    if (!pool) return 0
    const result = await pool.query(`SELECT COUNT(*)::int AS c FROM incidents WHERE status = 'open'`)
    return result.rows[0]?.c ?? 0
  }

  async searchEvents(q: string, days: number): Promise<SmartVmsEvent[]> {
    const pool = await getPool()
    if (!pool) return []
    const since = new Date(Date.now() - days * 24 * 3600_000).toISOString()
    const result = await pool.query(
      `SELECT event_id, event_type, occurred_at, ingested_at, camera_id, edge_node_id, trace_id, payload
       FROM events
       WHERE occurred_at >= $1 AND search_text ILIKE $2
       ORDER BY occurred_at DESC LIMIT 100`,
      [since, `%${q.toLowerCase()}%`],
    )
    return result.rows.map((row) => ({
      schema_version: '1.0',
      event_id: row.event_id,
      event_type: row.event_type,
      occurred_at: row.occurred_at.toISOString?.() ?? row.occurred_at,
      ingested_at: row.ingested_at?.toISOString?.() ?? row.ingested_at,
      source: { camera_id: row.camera_id, edge_node_id: row.edge_node_id ?? undefined },
      trace_id: row.trace_id ?? undefined,
      payload: row.payload ?? {},
    }))
  }

  async getPipelineStats() {
    const pool = await getPool()
    if (!pool) {
      return {
        eventsIngestedTotal: 0,
        eventsDroppedTotal: 0,
        avgPipelineLagMs: 0,
        lastEventAt: null,
      }
    }
    const result = await pool.query(
      `SELECT events_ingested_total, events_dropped_total, avg_pipeline_lag_ms, last_event_at FROM pipeline_stats WHERE id = 1`,
    )
    const row = result.rows[0]
    return {
      eventsIngestedTotal: Number(row?.events_ingested_total ?? 0),
      eventsDroppedTotal: Number(row?.events_dropped_total ?? 0),
      avgPipelineLagMs: Number(row?.avg_pipeline_lag_ms ?? 0),
      lastEventAt: row?.last_event_at ? new Date(row.last_event_at).toISOString() : null,
    }
  }

  async recordDropped(count: number): Promise<void> {
    const pool = await getPool()
    if (!pool) return
    await pool.query(
      `UPDATE pipeline_stats SET events_dropped_total = events_dropped_total + $1 WHERE id = 1`,
      [count],
    )
  }
}

function rowToDto(row: Record<string, unknown>): IncidentDto {
  return {
    id: String(row.id),
    title: String(row.title),
    cameraId: String(row.camera_id),
    cameraName: String(row.camera_name),
    severity: row.severity as IncidentDto['severity'],
    status: row.status as IncidentDto['status'],
    occurredAt: new Date(String(row.occurred_at)).toISOString(),
    ruleName: row.rule_name ? String(row.rule_name) : undefined,
    clipStartAt: new Date(String(row.clip_start_at)).toISOString(),
    clipEndAt: new Date(String(row.clip_end_at)).toISOString(),
    durationSec: Number(row.duration_sec),
  }
}
