import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// 浏览器态：真实 Chromium，跑 jsdom 里演不出来的那部分（无障碍、布局、可见性、真实焦点）。
// 与 vitest.config 缺省的 jsdom 单测互不覆盖，各跑各的目录。
export default defineConfig({
  test: {
    name: 'vue-browser',
    include: ['tests/browser/**/*.spec.ts'],
    setupFiles: ['./tests/browser/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
      screenshotFailures: false,
    },
  },
})
