import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    name: 'react',
    environment: 'jsdom',
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
    exclude: ['tests/browser/**'],
  },
})
