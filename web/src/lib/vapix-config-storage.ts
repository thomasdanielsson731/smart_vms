/** Endast användarnamn i webbläsaren — lösenord lagras aldrig client-side (CRA). */
const STORAGE_KEY = 'smart-vms-vapix-user'

export function loadLocalVapixUser(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveLocalVapixUser(user: string): void {
  localStorage.setItem(STORAGE_KEY, user)
}

export const defaultVapixUser = 'root'
