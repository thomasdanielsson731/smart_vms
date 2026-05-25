-- Smart VMS Phase 3 — initial schema (ADR-0003)

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  camera_id TEXT NOT NULL,
  edge_node_id TEXT,
  trace_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  search_text TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_camera_id ON events (camera_id);
CREATE INDEX IF NOT EXISTS idx_events_search_text ON events USING gin (to_tsvector('english', search_text));

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  camera_id TEXT NOT NULL,
  camera_name TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  occurred_at TIMESTAMPTZ NOT NULL,
  rule_name TEXT,
  clip_start_at TIMESTAMPTZ NOT NULL,
  clip_end_at TIMESTAMPTZ NOT NULL,
  duration_sec INT NOT NULL DEFAULT 30,
  linked_event_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_occurred_at ON incidents (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_camera_id ON incidents (camera_id);

CREATE TABLE IF NOT EXISTS pipeline_stats (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  events_ingested_total BIGINT NOT NULL DEFAULT 0,
  events_dropped_total BIGINT NOT NULL DEFAULT 0,
  last_event_at TIMESTAMPTZ,
  avg_pipeline_lag_ms INT NOT NULL DEFAULT 0
);

INSERT INTO pipeline_stats (id) VALUES (1) ON CONFLICT DO NOTHING;
