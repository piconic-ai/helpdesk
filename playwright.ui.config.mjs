import { defineConfig } from '@playwright/test'
import { resolve } from 'node:path'

const captureDir = process.env.HELPDESK_DAILY_CAPTURE
const pixelComparison = { threshold: 0.1, maxDiffPixelRatio: 0.001 }

export default defineConfig({
  testDir: './tests/ui',
  testMatch: '**/*.pw.mjs',
  snapshotPathTemplate: captureDir
    ? resolve(captureDir, '{arg}{ext}')
    : '{testDir}/../../docs/reports/loop/round-15/screens/{arg}{ext}',
  fullyParallel: true,
  workers: 3,
  updateSnapshots: captureDir ? 'all' : 'none',
  timeout: 100_000,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    // Software compositing also works on virtual runners without a display.
    launchOptions: {
      args: ['--disable-gpu', '--lang=ja-JP', '--accept-lang=ja-JP'],
    },
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
