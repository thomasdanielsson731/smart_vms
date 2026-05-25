import { test, expect } from '@playwright/test'
import { workspacePanel, workspaceHeading } from './helpers/workspaces'

test.describe('Smart Chat intents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('quick action opens map without Ollama', async ({ page }) => {
    await page.getByRole('button', { name: /Open the map and show the cameras/i }).click()
    await expect(workspaceHeading(page, 'map')).toBeVisible({
      timeout: 15_000,
    })
  })

  test('typed intent opens configuration onboard tab', async ({ page }) => {
    await page.getByPlaceholder(/Ask Smart Chat/i).fill('Onboard all cameras on the network')
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(workspaceHeading(page, 'config')).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText(/Discover Axis cameras/i)).toBeVisible()
  })

  test('typed intent opens dashboard', async ({ page }) => {
    await page.getByPlaceholder(/Ask Smart Chat/i).fill('Open dashboard for alarms from the last week')
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(workspaceHeading(page, 'dashboard')).toBeVisible({
      timeout: 15_000,
    })
  })
})
