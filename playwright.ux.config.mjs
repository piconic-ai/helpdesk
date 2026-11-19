import { defineConfig } from '@playwright/test'
export default defineConfig({
  outputDir: '.audit/ux-results-' + process.pid,
  testDir: './tests/ux',
  testMatch: '**/*.pw.mjs',
  fullyParallel: true,
  workers: 3,
  reporter: process.env.HELPDESK_WALK_OUTPUT
    ? [['list'], ['./tests/ux/review-walk-reporter.mjs']]
    : 'list',
  timeout: 65_000,
  expect: { timeout: 6000 },
  use: {
    viewport: { width: 1440, height: 900 },
    locale: 'ja-JP',
    launchOptions: { args: ['--lang=ja-JP', '--accept-lang=ja-JP'] },
    timezoneId: 'Asia/Tokyo',
    reducedMotion: 'reduce',
  },
})
