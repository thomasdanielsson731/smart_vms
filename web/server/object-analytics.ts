import type DigestClient from 'digest-fetch'

export const AOA_DEFAULT_API_VERSION = '1.2'
export const AOA_CONTEXT = 'smart-vms'
export const AOA_CONTROL_PATH = '/local/objectanalytics/control.cgi'

export const AOA_READ_METHODS = new Set([
  'getSupportedVersions',
  'getConfigurationCapabilities',
  'getConfiguration',
  'getAccumulatedCounts',
  'getOccupancy',
])

export const AOA_WRITE_METHODS = new Set([
  'setConfiguration',
  'sendAlarmEvent',
  'sendAlarm',
  'resetAccumulatedCounts',
  'resetPassthrough',
])

export interface AoaRequestBody {
  apiVersion?: string
  context?: string
  method: string
  params?: unknown
}

export interface AoaResponseBody {
  apiVersion?: string
  context?: string
  method: string
  data?: unknown
  error?: { code: number; message: string }
}

export function isAllowedAoaMethod(method: string): boolean {
  return AOA_READ_METHODS.has(method) || AOA_WRITE_METHODS.has(method)
}

export function aoaMethodRequiresAdmin(method: string): boolean {
  return AOA_WRITE_METHODS.has(method)
}

export function aoaErrorMessage(response: AoaResponseBody): string | null {
  return response.error?.message?.trim() || null
}

export function pickLatestAoaApiVersion(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const versions = (data as { apiVersions?: unknown }).apiVersions
  if (!Array.isArray(versions) || versions.length === 0) return undefined
  const parsed = versions
    .map((v) => String(v))
    .filter((v) => /^\d+\.\d+$/.test(v))
    .sort((a, b) => {
      const [am, an] = a.split('.').map(Number)
      const [bm, bn] = b.split('.').map(Number)
      return am !== bm ? bm - am : bn - an
    })
  return parsed[0]
}

export async function callObjectAnalyticsApi(
  client: DigestClient,
  host: string,
  request: AoaRequestBody,
  timeoutMs = 15000,
): Promise<{ ok: boolean; status: number; body: AoaResponseBody | null; transportError?: string }> {
  const payload: AoaRequestBody = {
    apiVersion: request.apiVersion ?? AOA_DEFAULT_API_VERSION,
    context: request.context ?? AOA_CONTEXT,
    method: request.method,
  }
  if (request.params !== undefined) payload.params = request.params

  let lastTransportError: string | undefined

  for (const scheme of ['http', 'https'] as const) {
    try {
      const response = await client.fetch(`${scheme}://${host}${AOA_CONTROL_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      })

      const text = await response.text()
      let body: AoaResponseBody | null = null
      if (text.trim()) {
        try {
          body = JSON.parse(text) as AoaResponseBody
        } catch {
          lastTransportError = 'Camera returned invalid JSON from Object Analytics.'
          if (scheme === 'http') continue
          return { ok: false, status: response.status, body: null, transportError: lastTransportError }
        }
      }

      if (response.status === 404 && scheme === 'http') continue
      return { ok: response.ok, status: response.status, body }
    } catch (err) {
      lastTransportError = err instanceof Error ? err.message : 'Object Analytics request failed'
      if (scheme === 'http') continue
    }
  }

  return { ok: false, status: 502, body: null, transportError: lastTransportError }
}
