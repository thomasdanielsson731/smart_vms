import { test, expect } from '@playwright/test'
import { openWorkspace, sidebar, workspaceHeading, workspacePanel } from './helpers/workspaces'

const WORKSPACE_SMOKE: {
  id: WorkspaceId
  params?: Record<string, string>
  expectText: string | RegExp
}[] = [
  {
    id: 'video',
    params: { t: '100' },
    expectText: /Live|timeline|No cameras|Camera/i,
  },
  {
    id: 'dashboard',
    expectText: /Open alarms|No alarms yet|Cameras online/i,
  },
  {
    id: 'tracking',
    expectText: /No tracks yet|Cross-camera tracking/i,
  },
  {
    id: 'agents',
    expectText: /Monitoring agents|All agents/i,
  },
  {
    id: 'config',
    params: { tab: 'overview' },
    expectText: /Configuration manager|Features active/i,
  },
  {
    id: 'map',
    expectText: /Map view|My location|Place camera/i,
  },
  {
    id: 'faces',
    params: { tab: 'enroll' },
    expectText: /Face recognition|From video|Manage/i,
  },
  {
    id: 'camera-web',
    expectText: /Proxied with saved VAPIX|Camera web UI/i,
  },
  {
    id: 'settings',
    expectText: /VAPIX|Recording|Signed in as/i,
  },
]

test.describe('Workspace smoke', () => {
  for (const { id, params, expectText } of WORKSPACE_SMOKE) {
    test(`opens ${id} workspace`, async ({ page }) => {
      await openWorkspace(page, id, params)
      await expect(page.getByText(expectText).first()).toBeVisible()
    })
  }

  test('sidebar shortcuts open workspaces', async ({ page }) => {
    await page.goto('/')
    await sidebar(page).getByRole('button', { name: /Map/i }).click()
    await expect(workspaceHeading(page, 'map')).toBeVisible()

    await sidebar(page).getByRole('button', { name: /Smart Chat/i }).click()
    await expect(workspaceHeading(page, 'map')).not.toBeVisible()

    await sidebar(page).getByRole('button', { name: /Dashboard/i }).click()
    await expect(workspaceHeading(page, 'dashboard')).toBeVisible()
  })

  test('close workspace returns to chat-only layout', async ({ page }) => {
    await openWorkspace(page, 'dashboard')
    await page.getByRole('button', { name: 'Close view' }).click()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /Smart Chat/i })).toBeVisible()
  })
})
