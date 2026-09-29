import { playwright } from '@vitest/browser-playwright'
import { browserCommands } from '@xihan-ui/testing/browser-commands'
import { defineConfig } from 'vitest/config'

/**
 * 全量无障碍扫描：整包最重的一块（按主题拆成两份文件，单份约三分钟）。单开一个项目，
 * CI 上用 --project=*-a11y* 挑出来独占一片、其余分片用 --project=!*-a11y* 排除；本地整包跑时两个项目并行。
 */
const A11Y_SPECS = ['tests/browser/a11y-*.spec.tsx']

// 浏览器态：真实 Chromium，跑 jsdom 里演不出来的那部分（无障碍、布局、可见性、真实焦点）。
// 与 vitest.config 缺省的 jsdom 单测互不覆盖，各跑各的目录。
// 用例后缀是 .tsx：React 的夹具要写 JSX，转换口径由包根 tsconfig 的 jsx: 'react-jsx' 给。
export default defineConfig({
  test: {
    setupFiles: ['./tests/browser/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
      screenshotFailures: false,
      commands: browserCommands,
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'react-browser',
          include: ['tests/browser/**/*.spec.tsx'],
          exclude: A11Y_SPECS,
        },
      },
      {
        extends: true,
        test: {
          name: 'react-browser-a11y',
          include: A11Y_SPECS,
        },
      },
    ],
  },
})
