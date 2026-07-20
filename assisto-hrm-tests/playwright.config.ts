import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from .env file
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Assisto HRM Test Configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if test.only is left in source */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list'],
  ],

  /* Shared settings */
  use: {
    /* Base URL from environment variable */
    baseURL: process.env.BASE_URL || 'http://nsplus.perf.devassisto.com',

    ignoreHTTPSErrors:true,

    /* Collect trace on first retry */
    trace: 'on-first-retry',

    /* Screenshot and video on failure */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Timeout settings */
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  /* Projects */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   timeout: 60000,
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     /* Firefox can be slower to start up and navigate,
    //        so use higher timeouts for this browser */
    //     launchOptions: {
    //       firefox: {
    //         /* Allow Firefox to connect to the target server without strict timing */
    //         env: {
    //           MOZ_DISABLE_CONTENT_SANDBOX: '1',
    //         },
    //       },
    //     } as any,
    //   },
    // },
  ],
});


