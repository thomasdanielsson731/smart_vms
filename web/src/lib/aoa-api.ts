import type {
  AoaApiResponse,
  AoaCapabilities,
  AoaConfiguration,
  AoaInvokeRequest,
  AoaStatusResponse,
} from '@/types/aoa'

async function parseAoaError(res: Response, fallback: string): Promise<never> {
  let message = fallback
  try {
    const data = (await res.json()) as { message?: string; error?: string }
    if (data.message) message = data.message
  } catch {
    /* ignore */
  }
  throw new Error(message)
}

export function cameraAoaUrl(host: string): string {
  return `/api/camera/${encodeURIComponent(host)}/aoa`
}

export async function invokeCameraAoa<T = unknown>(
  host: string,
  request: AoaInvokeRequest,
): Promise<AoaApiResponse<T>> {
  const res = await fetch(cameraAoaUrl(host), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(request),
  })

  const body = (await res.json().catch(() => null)) as
    | (AoaApiResponse<T> & { message?: string })
    | null

  if (!res.ok) {
    throw new Error(body?.message ?? body?.error?.message ?? `AOA request failed (HTTP ${res.status})`)
  }

  if (!body) throw new Error('Empty response from Object Analytics proxy')
  if (body.error) throw new Error(body.error.message)

  return body
}

export async function fetchCameraAoaStatus(host: string): Promise<AoaStatusResponse> {
  const res = await fetch(`${cameraAoaUrl(host)}/status`, { credentials: 'same-origin' })
  const body = (await res.json().catch(() => null)) as AoaStatusResponse | { message?: string } | null
  if (!res.ok) {
    await parseAoaError(res, (body && 'message' in body && body.message) || 'Could not load AOA status')
  }
  return body as AoaStatusResponse
}

export async function loadAoaConfiguration(host: string): Promise<AoaConfiguration> {
  const res = await invokeCameraAoa<AoaConfiguration>(host, { method: 'getConfiguration' })
  if (!res.data) throw new Error('No configuration returned from camera')
  return res.data
}

export async function loadAoaCapabilities(host: string): Promise<AoaCapabilities | undefined> {
  const res = await invokeCameraAoa<{ data?: AoaCapabilities }>(host, {
    method: 'getConfigurationCapabilities',
  })
  return res.data
}

export async function saveAoaConfiguration(host: string, config: AoaConfiguration): Promise<void> {
  await invokeCameraAoa(host, {
    method: 'setConfiguration',
    params: config,
  })
}

export async function testAoaScenarioAlarm(host: string, scenarioId: number): Promise<void> {
  await invokeCameraAoa(host, {
    method: 'sendAlarmEvent',
    params: { scenario: scenarioId },
  })
}
