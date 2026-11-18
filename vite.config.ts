import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { barefoot } from '@barefootjs/hono/vite'

export default defineConfig({
  base: '/components/',
  resolve: { alias: { '@/components': resolve('components') } },
  publicDir: false,
  build: { outDir: 'public/components', emptyOutDir: true },
  plugins: [
    barefoot({ components: ['components'], templates: 'dist/components' }),
  ],
})
