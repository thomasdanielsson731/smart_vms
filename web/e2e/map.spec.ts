import { test, expect } from '@playwright/test'
import { openWorkspace, workspacePanel } from './helpers/workspaces'

test.describe('Map workspace', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 59.3293, longitude: 18.0686 })
    await context.addInitScript(() => {
      localStorage.removeItem('smart-vms-map-placements')
      localStorage.removeItem('smart-vms-map-site')
    })
    await openWorkspace(page, 'map')
  })

  test('renders OpenStreetMap tiles', async ({ page }) => {
    await expect(workspacePanel(page).locator('.leaflet-container')).toBeVisible()
    await expect(workspacePanel(page).locator('.leaflet-tile-pane img').first()).toBeVisible({
      timeout: 15_000,
    })
  })

  test('Place camera keeps map visible and allows placement click', async ({ page }) => {
    await workspacePanel(page).getByRole('button', { name: 'Place camera' }).click()
    await expect(workspacePanel(page).getByRole('button', { name: /Click on the map/i })).toBeVisible()
    await expect(workspacePanel(page).locator('.leaflet-container')).toBeVisible()
    await expect(workspacePanel(page).locator('.leaflet-tile-pane img').first()).toBeVisible()

    const map = workspacePanel(page).locator('.leaflet-container')
    const box = await map.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return

    const coordsBefore = await workspacePanel(page).getByText(/Lat \d+\.\d+, lng \d+\.\d+/i).textContent()
    await map.click({ position: { x: box.width / 2, y: box.height / 2 } })

    await expect(workspacePanel(page).getByRole('button', { name: 'Place camera' })).toBeVisible()
    await expect(workspacePanel(page).getByText(/Lat \d+\.\d+, lng \d+\.\d+/i)).not.toHaveText(
      coordsBefore ?? '',
    )
    await expect(workspacePanel(page).locator('.leaflet-container')).toBeVisible()
  })

  test('My location centers map without hiding tiles', async ({ page }) => {
    await workspacePanel(page).getByRole('button', { name: 'My location' }).click()
    await expect(workspacePanel(page).locator('.leaflet-container')).toBeVisible()
    await expect(workspacePanel(page).locator('.leaflet-tile-pane img').first()).toBeVisible({
      timeout: 15_000,
    })
  })
})
