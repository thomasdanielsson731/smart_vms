import { test, expect } from '@playwright/test'
import { E2E_VIEWER, login } from './helpers/auth'
import { openWorkspace, sidebar } from './helpers/workspaces'

test.describe('Viewer permissions', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    await login(page, E2E_VIEWER)
  })

  test('viewer can open map and video', async ({ page }) => {
    await openWorkspace(page, 'map')
    await openWorkspace(page, 'video')
  })

  test('viewer is denied configuration workspace', async ({ page }) => {
    await page.goto('/?w=config')
    await expect(page.getByText('Access denied')).toBeVisible()
    await expect(page.getByText('config', { exact: true })).toBeVisible()
  })

  test('viewer is denied camera web workspace', async ({ page }) => {
    await page.goto('/?w=camera-web')
    await expect(page.getByText('Access denied')).toBeVisible()
  })

  test('configuration shortcut hidden for viewer', async ({ page }) => {
    await page.goto('/')
    await expect(sidebar(page).getByRole('button', { name: /Configuration/i })).not.toBeVisible()
    await expect(sidebar(page).getByRole('button', { name: /Map/i })).toBeVisible()
  })
})
