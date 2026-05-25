import { test, expect } from '@playwright/test'
import { openWorkspace } from './helpers/workspaces'

test.describe('Settings workspace', () => {
  test.beforeEach(async ({ page }) => {
    await openWorkspace(page, 'settings')
  })

  test('shows VAPIX connection panel', async ({ page }) => {
    await expect(page.getByText('Cameras (VAPIX)')).toBeVisible()
  })

  test('shows recording storage settings', async ({ page }) => {
    await expect(page.getByText(/Recording|storage|GiB/i).first()).toBeVisible()
  })

  test('shows signed-in account info', async ({ page }) => {
    const accounts = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Accounts', exact: true }),
    })
    await expect(accounts.getByText('Signed in as', { exact: true })).toBeVisible()
    await expect(accounts.locator('input[type="text"][disabled]').first()).toHaveValue(
      'Administrator (admin)',
    )
  })
})
