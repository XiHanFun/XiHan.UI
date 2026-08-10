import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// 浏览器态：真实 Chromium。定位的判据全在"真实布局里算得对"，jsdom 无布局演不出来。
// 与 vitest.config 缺省的 jsdom 单测互不覆盖，各跑各的目录。
export default defineConfig({
  test: {
    name: 'position-self-browser',
    include: ['tests/browser/**/*.spec.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
      screenshotFailures: false,
      // 视口尺寸直接进判据（贴边、翻面、避让都按它算），不能跟着默认值飘
      viewport: { width: 1280, height: 800 },
    },
  },
})
