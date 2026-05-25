import { test, expect } from '@playwright/test'
import { openWorkspace } from './helpers/workspaces'

test.describe('Agents workspace', () => {
  test.beforeEach(async ({ page }) => {
    await openWorkspace(page, 'agents')
  })

  test('lists agents tab by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'All agents' })).toBeVisible()
    await expect(page.getByText(/Monitoring agents/i)).toBeVisible()
  })

  test('create agent tab shows form', async ({ page }) => {
    await page.getByRole('button', { name: 'Create agent' }).click()
    await expect(page.getByText(/Create a monitoring agent/i)).toBeVisible()
    await expect(page.getByText('Agent name')).toBeVisible()
  })

  test('list tab shows create action for admin', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Create new agent' })).toBeVisible()
  })
})
