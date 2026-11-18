import { resolve } from 'node:path'
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@/components': resolve('dist/components') } },
  test: {
    exclude: [...configDefaults.exclude, '.audit/**', '.pnpm-store/**'],
    coverage: {
      provider: 'v8',
      thresholds: { statements: 71, branches: 66, functions: 71, lines: 74 },
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
