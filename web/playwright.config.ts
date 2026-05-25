import { defineConfig, devices } from '@playwright/test'

const E2E_PORT = 5173
const baseURL = `http://127.0.0.1:${E2E_PORT}`

const e2eServerEnv = {
  SMARTVMS_SESSION_SECRET: 'e2e-test-session-secret-32-chars-min',
  SMARTVMS_ADMIN_USER: 'admin',
  SMARTVMS_ADMIN_PASSWORD: 'e2e-admin-pass',
  SMARTVMS_VIEWER_USER: 'viewer',
  SMARTVMS_VIEWER_PASSWORD: 'e2e-viewer-pass',
  SMARTVMS_COOKIE_SECURE: 'false',
  SMARTVMS_DISABLE_LOGIN_RATE_LIMIT: 'true',
  VITE_FACE_RECOGNITION_ENABLED: 'true',
  VITE_CAMERA_STREAM_ENABLED: 'false',
  VITE_CAMERA_HOSTS: '192.168.68.200',
}

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    storageState: 'e2e/.auth/admin.json',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${E2E_PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      ...e2eServerEnv,
    },
  },
})
