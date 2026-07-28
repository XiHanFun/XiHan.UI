import { configDefaults, defineConfig } from 'vitest/config'

// 默认这轮是 jsdom 单测。浏览器态用例走 vitest.browser.config.ts，
// 它们要真实 DOM 与 axe，被卷进 jsdom 只会整份报错。
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'tests/browser/**'],
  },
})
