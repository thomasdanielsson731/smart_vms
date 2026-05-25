import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let pool: pg.Pool | null = null

export function getDatabaseUrl(): string | null {
  return process.env.DATABASE_URL ?? null
}

export async function getPool(): Promise<pg.Pool | null> {
  const url = getDatabaseUrl()
  if (!url) return null
  if (!pool) {
    pool = new pg.Pool({ connectionString: url, max: 10 })
  }
  return pool
}

export async function runMigrations(): Promise<void> {
  const p = await getPool()
  if (!p) return
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await p.query(schema)
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

export async function pingDatabase(): Promise<boolean> {
  try {
    const p = await getPool()
    if (!p) return false
    await p.query('SELECT 1')
    return true
  } catch {
    return false
  }
}
