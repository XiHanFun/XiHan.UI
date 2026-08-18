import process from 'node:process'
import { defineConfig } from 'vitest/config'
import browser from './vitest.browser.config'

// 文档站示例的验证台，浏览器设置照搬 vitest.browser.config，只换 include 与两处示例专用配置。
//
// 单开一份而不是并进 tests/browser：示例文件在 docs/ 下，不在 turbo 对 test:browser
// 声明的输入集里，只加示例不改 ui/ 时 turbo 会直接返回缓存的绿。这条走 tooling/scripts/check-wc-demos.mjs
// 直接起 vitest，不经 turbo。
export default defineConfig({
  ...browser,
  // 示例文件在本包之外，放行到仓库根
  server: {
    fs: { allow: ['../../../..'] },
  },
  // 组件筛选：逗号分隔的组件目录名，空串表示全跑
  define: {
    __XH_WC_DEMOS__: JSON.stringify(process.env.XH_WC_DEMOS ?? ''),
  },
  test: {
    ...browser.test,
    name: 'wc-demos',
    include: ['tests/demos/**/*.spec.ts'],
  },
})
