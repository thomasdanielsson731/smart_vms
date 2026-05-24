import type { VapixConfigStatus, VapixConnectionSettings } from '@/types/vapix'



async function parseError(res: Response, fallback: string): Promise<never> {

  let message = fallback

  try {

    const data = (await res.json()) as { message?: string; error?: string }

    if (data.message) message = data.message

    else if (data.error === 'unauthenticated') message = 'Session expired — sign in again.'

    else if (data.error === 'forbidden') message = 'Only administrators can change camera credentials.'

    else if (res.status === 404) message = 'API not found. Restart with npm run dev (not static preview).'

  } catch {

    if (res.status === 404) message = 'API not found. Restart with npm run dev.'

  }

  throw new Error(message)

}



export async function fetchVapixConfig(): Promise<VapixConfigStatus> {

  const res = await fetch('/api/config/vapix', { credentials: 'same-origin' })

  if (!res.ok) await parseError(res, 'Could not fetch camera credentials')

  return (await res.json()) as VapixConfigStatus

}



export async function saveVapixConfig(settings: VapixConnectionSettings): Promise<VapixConfigStatus> {

  const res = await fetch('/api/config/vapix', {

    method: 'PUT',

    headers: { 'Content-Type': 'application/json' },

    credentials: 'same-origin',

    body: JSON.stringify(settings),

  })

  if (!res.ok) await parseError(res, 'Could not save camera credentials')

  return (await res.json()) as VapixConfigStatus

}

