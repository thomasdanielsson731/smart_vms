import type { IncidentDto } from '../types.js'

export async function notifyWebhook(incident: IncidentDto): Promise<void> {
  const url = process.env.SMARTVMS_WEBHOOK_URL
  if (!url) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'incident.opened',
        incident,
        sentAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    console.warn('[notifications] webhook failed', err instanceof Error ? err.message : err)
  }
}
