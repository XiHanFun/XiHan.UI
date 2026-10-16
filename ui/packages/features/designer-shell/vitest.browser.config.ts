import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// 浏览器态：真实 Chromium。拖放的命中判断、预览跟手与边缘平移都要真实布局，jsdom 演不出来。
// 与 vitest.config 缺省的 jsdom 单测互不覆盖，各跑各的目录。
export default defineConfig({
  test: {
    name: 'designer-shell-browser',
    include: ['tests/browser/**/*.spec.ts'],
    setupFiles: ['./tests/browser/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
      screenshotFailures: false,
      // 边缘平移与预览位置按视口算，不能跟着默认值飘
      viewport: { width: 1280, height: 800 },
    },
  },
})
