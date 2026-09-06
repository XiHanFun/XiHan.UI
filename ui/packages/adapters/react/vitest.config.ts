import { defineConfig } from 'vitest/config'

// JSX 的转换口径由 tsconfig 的 jsx: 'react-jsx' 给，转换器按文件就近读它。
export default defineConfig({
  test: {
    name: 'react',
    environment: 'jsdom',
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
    exclude: ['tests/browser/**'],
  },
})
