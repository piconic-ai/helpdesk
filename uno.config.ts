import { defineConfig, presetWind4 } from 'unocss'

const patterns = [
  'components/**/*.tsx',
  'src/**/*-pages.ts',
  'src/**/*-page.tsx',
]

export default defineConfig({
  presets: [presetWind4()],
  content: { filesystem: patterns },
  cli: { entry: { patterns, outFile: 'public/uno.css' } },
})
