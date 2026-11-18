import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@/components': resolve('dist/components') } },
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.{ts,tsx}',
        'cli/**/*.{ts,mjs}',
        'components/**/*.tsx',
        'scripts/**/*.mjs',
        'worker.ts',
      ],
      exclude: ['**/*.test.*', '**/*.examples.ts', '**/test-*.ts', '**/*.d.ts'],
      reporter: ['text-summary', 'json-summary'],
    },
  },
})
