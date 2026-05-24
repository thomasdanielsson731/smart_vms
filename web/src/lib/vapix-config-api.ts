import type { VapixConfigStatus, VapixConnectionSettings } from '@/types/vapix'

async function parseError(res: Response): Promise<never> {
  let message = 'Kunde inte spara kameruppgifter'
  try {
    const data = (await res.json()) as { message?: string }
    if (data.message) message = data.message
  } catch {
    /* ignore */
  }
  throw new Error(message)
}

export async function fetchVapixConfig(): Promise<VapixConfigStatus> {
  const res = await fetch('/api/config/vapix', { credentials: 'same-origin' })
  if (!res.ok) throw new Error('Kunde inte hämta kameruppgifter')
  return (await res.json()) as VapixConfigStatus
}

export async function saveVapixConfig(settings: VapixConnectionSettings): Promise<VapixConfigStatus> {
  const res = await fetch('/api/config/vapix', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(settings),
  })
  if (!res.ok) await parseError(res)
  return (await res.json()) as VapixConfigStatus
}

export async function syncVapixConfigIfNeeded(
  local: VapixConnectionSettings | null,
): Promise<VapixConfigStatus | null> {
  if (!local?.user || !local.password) return null
  try {
    const remote = await fetchVapixConfig()
    if (remote.configured) return remote
    return saveVapixConfig(local)
  } catch {
    return null
  }
}
