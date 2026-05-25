import { test, expect } from '@playwright/test'

test.describe('Legacy workspace URLs', () => {
  test('?w=forensic opens video workspace', async ({ page }) => {
    await page.goto('/?w=forensic&range=48h')
    await expect(page.getByRole('heading', { name: /Video — live & timeline/i })).toBeVisible()
  })

  test('?w=alarms opens agents workspace', async ({ page }) => {
    await page.goto('/?w=alarms')
    await expect(page.getByRole('heading', { name: 'Agents' })).toBeVisible()
  })

  test('?w=onboarding opens configuration workspace', async ({ page }) => {
    await page.goto('/?w=onboarding')
    await expect(page.getByRole('heading', { name: 'Configuration' })).toBeVisible()
  })
})
