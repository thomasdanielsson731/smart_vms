const PREFIX = 'smart-vms-last-login'

function key(username: string): string {
  return `${PREFIX}:${username}`
}

export function loadLastLoginAt(username: string): string | null {
  try {
    return localStorage.getItem(key(username))
  } catch {
    return null
  }
}

/** Saves login time and returns the previous login timestamp (if any). */
export function saveLastLoginAt(username: string, iso: string): string | null {
  const previous = loadLastLoginAt(username)
  try {
    localStorage.setItem(key(username), iso)
  } catch {
    /* ignore quota errors */
  }
  return previous
}
