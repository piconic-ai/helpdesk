import { defineConfig } from '@playwright/test'

const pixelComparison = { threshold: 0.1, maxDiffPixelRatio: 0.001 }

export default defineConfig({
  testDir: './tests/ui',
  testMatch: '**/*.pw.mjs',
  snapshotPathTemplate:
    '{testDir}/../../docs/reports/loop/round-6/screens/{arg}{ext}',
  fullyParallel: true,
  workers: 3,
  timeout: 100_000,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    // Software compositing also works on virtual runners without a display.
    launchOptions: { args: ['--disable-gpu'] },
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  },
  expect: {
    toMatchSnapshot: pixelComparison,
    toHaveScreenshot: { ...pixelComparison, timeout: 10_000 },
  },
})
