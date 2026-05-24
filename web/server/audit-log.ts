import fs from 'node:fs'
import path from 'node:path'

export type AuditEvent =
  | 'auth.login.success'
  | 'auth.login.failed'
  | 'auth.logout'
  | 'vapix.credentials.saved'
  | 'vapix.credentials.cleared'

export function appendAuditLog(
  cwd: string,
  event: AuditEvent,
  actor: string,
  detail?: Record<string, string>,
): void {
  const line =
    JSON.stringify({
      ts: new Date().toISOString(),
      event,
      actor,
      ...detail,
    }) + '\n'
  const filePath = path.join(cwd, '.smartvms-audit.log')
  try {
    fs.appendFileSync(filePath, line, { encoding: 'utf8', flag: 'a' })
  } catch {
    /* audit får inte stoppa huvudflödet */
  }
}
