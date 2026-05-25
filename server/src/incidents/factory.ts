import { getDatabaseUrl, pingDatabase } from '../db/pool.js'
import { InMemoryIncidentRepository } from './memory-store.js'
import { PostgresIncidentRepository } from './postgres-store.js'
import type { IncidentRepository } from './repository.js'

export async function createIncidentRepository(): Promise<IncidentRepository> {
  if (getDatabaseUrl()) {
    const ok = await pingDatabase()
    if (ok) return new PostgresIncidentRepository()
    console.warn('[server] DATABASE_URL set but ping failed — using in-memory store')
  }
  return new InMemoryIncidentRepository()
}
