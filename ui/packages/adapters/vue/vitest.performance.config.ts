import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// REQ-039 的性能预算独立于日常 browser 全量：它只在固定资源的 Linux 容器中运行。
export default defineConfig({
  test: {
    name: 'vue-visual-performance',
    include: ['tests/browser/visual-performance.spec.ts'],
    setupFiles: ['./tests/browser/setup.ts'],
    testTimeout: 120_000,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
      screenshotFailures: false,
    },
  },
})
