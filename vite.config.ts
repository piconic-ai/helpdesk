import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { barefoot } from '@barefootjs/hono/vite'

export default defineConfig({
  base: '/components/',
  resolve: { alias: { '@/components': resolve('components') } },
  publicDir: false,
  build: {
    outDir: 'public/components',
    emptyOutDir: true,
    rollupOptions: {
      input: { navigation: resolve('src/browser/navigation.js') },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'navigation'
            ? 'navigation.js'
            : 'assets/[name]-[hash].js',
      },
    },
  },
  plugins: [
    barefoot({ components: ['components'], templates: 'dist/components' }),
  ],
})
