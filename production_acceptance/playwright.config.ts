import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [['html', { open: 'never', outputFolder: '../release_candidate/Production_Validation/playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://sentinelx-ai-8rnk.onrender.com',
    trace: 'off',
    video: 'on',
    screenshot: 'on',
    ignoreHTTPSErrors: true,
    har: {
      path: '../release_candidate/Production_Validation/har/traffic.har',
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

