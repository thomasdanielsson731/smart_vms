import { test, expect } from '@playwright/test'
import { openWorkspace, workspacePanel } from './helpers/workspaces'

test.describe('Configuration workspace', () => {
  test('overview tab lists system features', async ({ page }) => {
    await openWorkspace(page, 'config', { tab: 'overview' })
    await expect(page.getByText(/Features active/i)).toBeVisible()
    await expect(page.getByText('OpenStreetMap')).toBeVisible()
    await expect(page.getByText('VAPIX credentials')).toBeVisible()
  })

  test('cameras tab lists seeded cameras', async ({ page }) => {
    await openWorkspace(page, 'config', { tab: 'overview' })
    await workspacePanel(page).getByRole('button', { name: 'Cameras', exact: true }).click()
    await expect(page.getByText(/Camera 200|192\.168\.68\.200/i).first()).toBeVisible()
  })

  test('onboard tab shows LAN discovery UI', async ({ page }) => {
    await openWorkspace(page, 'config', { tab: 'overview' })
    await workspacePanel(page).getByRole('button', { name: 'Onboard', exact: true }).click()
    await expect(page.getByText(/Discover Axis cameras/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Search for cameras on network/i })).toBeVisible()
  })
})
