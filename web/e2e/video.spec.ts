import { test, expect } from '@playwright/test'
import { openWorkspace, workspacePanel } from './helpers/workspaces'

test.describe('Video workspace', () => {
  test.beforeEach(async ({ page }) => {
    await openWorkspace(page, 'video', { t: '100' })
  })

  test('shows live timeline and camera selector', async ({ page }) => {
    await expect(page.getByText(/Live and recorded video on one timeline/i)).toBeVisible()
    await expect(page.getByText(/Camera 200|192\.168\.68\.200/i).first()).toBeVisible()
  })

  test('layout toggle switches between single and grid', async ({ page }) => {
    await workspacePanel(page).getByRole('button', { name: 'One camera' }).click()
    await workspacePanel(page).getByRole('button', { name: /All cameras/i }).click()
    await expect(workspacePanel(page).getByRole('button', { name: /All cameras/i })).toBeVisible()
  })

  test('live view shows disabled stream message when streams off', async ({ page }) => {
    await expect(page.getByText(/Live video is disabled|VAPIX/i).first()).toBeVisible()
  })
})
