import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type FullConfig } from '@playwright/test'
import { E2E_ADMIN, login } from './helpers/auth'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL ?? 'http://127.0.0.1:5173'
  const authDir = path.join(__dirname, '.auth')
  fs.mkdirSync(authDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({ baseURL })
  const page = await context.newPage()
  await login(page, E2E_ADMIN)
  await context.storageState({ path: path.join(authDir, 'admin.json') })
  await browser.close()
}
