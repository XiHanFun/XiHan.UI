import { configDefaults, defineConfig } from 'vitest/config'

// 默认这轮是节点或 jsdom 单测（按文件头选环境）。浏览器态用例走 vitest.browser.config.ts，
// 它们要真实布局，被卷进这一轮只会整份报错。
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'tests/browser/**'],
    setupFiles: ['./tests/setup.ts'],
  },
})
