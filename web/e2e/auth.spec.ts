import { test, expect } from '@playwright/test'
import { E2E_ADMIN, E2E_VIEWER, login, logout } from './helpers/auth'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })

  test('admin can sign in and sign out', async ({ page }) => {
    await login(page, E2E_ADMIN)
    await expect(page.locator('header').getByText('Administrator').first()).toBeVisible()
    await logout(page)
  })

  test('viewer can sign in', async ({ page }) => {
    await login(page, E2E_VIEWER)
    await expect(page.locator('header').getByText('Read-only').first()).toBeVisible()
  })

  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Username').fill('admin')
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText(/Invalid username or password/i)).toBeVisible()
    await expect(page).toHaveURL('/login')
  })
})
