import { test, expect } from '@playwright/test'
import { openWorkspace, workspacePanel } from './helpers/workspaces'

test.describe('Face recognition workspace', () => {
  test.beforeEach(async ({ page }) => {
    await openWorkspace(page, 'faces', { tab: 'enroll' })
  })

  test('shows enroll tab', async ({ page }) => {
    await expect(
      workspacePanel(page).getByRole('button', { name: 'From video', exact: true }),
    ).toBeVisible()
    await expect(page.getByText(/Face recognition|consent/i).first()).toBeVisible()
  })

  test('manage tab lists profiles', async ({ page }) => {
    await workspacePanel(page).getByRole('button', { name: 'Manage', exact: true }).click()
    await expect(workspacePanel(page).getByText('No people yet')).toBeVisible()
  })

  test('activity tab shows events section', async ({ page }) => {
    await workspacePanel(page).getByRole('button', { name: 'Events', exact: true }).click()
    await expect(page.getByText(/Enable face recognition to see events|No face matches/i)).toBeVisible()
  })

  test('settings tab shows privacy controls', async ({ page }) => {
    await workspacePanel(page).getByRole('button', { name: 'Settings', exact: true }).click()
    await expect(workspacePanel(page).getByRole('button', { name: 'Enable face recognition' })).toBeVisible()
  })
})
