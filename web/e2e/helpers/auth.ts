import { expect, type Page } from '@playwright/test'

export const E2E_ADMIN = { username: 'admin', password: 'e2e-admin-pass' }
export const E2E_VIEWER = { username: 'viewer', password: 'e2e-viewer-pass' }

export async function login(
  page: Page,
  creds: { username: string; password: string } = E2E_ADMIN,
): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Username').fill(creds.username)
  await page.getByLabel('Password').fill(creds.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('button', { name: /Smart Chat/i })).toBeVisible()
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL('/login')
}
