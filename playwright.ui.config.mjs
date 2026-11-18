import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/ui',
  testMatch: '**/*.pw.mjs',
  snapshotPathTemplate: '{testDir}/../../docs/reports/ui/after/{arg}{ext}',
  fullyParallel: true,
  workers: 3,
  timeout: 100_000,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  },
  expect: { toMatchSnapshot: { threshold: 0.1, maxDiffPixelRatio: 0.001 } },
})
