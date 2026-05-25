import { expect, type Page } from '@playwright/test'

export type WorkspaceId =
  | 'video'
  | 'dashboard'
  | 'tracking'
  | 'agents'
  | 'config'
  | 'map'
  | 'faces'
  | 'camera-web'
  | 'settings'

export const WORKSPACE_TITLES: Record<WorkspaceId, string | RegExp> = {
  video: /Video — live & timeline/,
  dashboard: 'Dashboard',
  tracking: 'Tracking',
  agents: 'Agents',
  config: 'Configuration',
  map: 'Map',
  faces: 'Face recognition',
  'camera-web': 'Camera web UI',
  settings: 'Settings',
}

/** Right-hand workspace panel (not sidebar). */
export function workspacePanel(page: Page) {
  return page.locator('section.min-w-0.flex-1')
}

/** Workspace chrome title (h2 only — avoids "Alarms on map" h3). */
export function workspaceHeading(page: Page, workspace: WorkspaceId) {
  const title = WORKSPACE_TITLES[workspace]
  const h2 = workspacePanel(page).locator('h2')
  return typeof title === 'string' ? h2.getByText(title, { exact: true }) : h2.filter({ hasText: title })
}

/** Left navigation sidebar. */
export function sidebar(page: Page) {
  return page.locator('aside').first()
}

export async function openWorkspace(
  page: Page,
  workspace: WorkspaceId,
  params: Record<string, string> = {},
): Promise<void> {
  const search = new URLSearchParams({ w: workspace, ...params })
  await page.goto(`/?${search.toString()}`)
  await expect(workspaceHeading(page, workspace)).toBeVisible()
}

export async function openWorkspaceFromSidebar(page: Page, label: string): Promise<void> {
  await sidebar(page).getByRole('button', { name: new RegExp(label, 'i') }).click()
}
