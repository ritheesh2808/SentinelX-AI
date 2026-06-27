import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never', outputFolder: '../PAT_Final/playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    video: 'on',
    screenshot: 'on',
    ignoreHTTPSErrors: true,
    har: {
      path: '../PAT_Final/har/traffic.har',
      updateContent: 'embed',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
