import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// 浏览器态：真实 Chromium。光标矩形这类量测的判据全在真实布局里，jsdom 无布局演不出来。
// 与 vitest.config 缺省的单测互不覆盖，各跑各的目录。
export default defineConfig({
  test: {
    name: 'core-self-browser',
    include: ['tests/browser/**/*.spec.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
      screenshotFailures: false,
      viewport: { width: 1280, height: 800 },
    },
  },
})
