import { readdirSync, readFileSync } from 'node:fs'
import { playwright } from '@vitest/browser-playwright'
import { browserCommands } from '@xihan-ui/testing/browser-commands'
import { defineConfig } from 'vitest/config'

const BROWSER_DIR = new URL('./tests/browser/', import.meta.url)

/**
 * 仿真过触屏的用例文件。
 *
 * Linux 无头 Chromium 上，一张页面只要调过一次 Emulation.setTouchEmulationEnabled({ enabled: false })，
 * 不论之前开没开过，(pointer) 与 (hover) 就永久落成 none，CDP 没有入口改回来。同一 worker 里后面的文件
 * 复用这张页面，挂在 @media (hover: hover) 下的悬停规则整片失效（checkbox-group / list 的悬停断言、
 * menu / toast 的像素基线随之随机判红，红哪几张取决于文件落到哪个 worker）。Windows 上不走这条恢复路径，本机复现不出来。
 * 这些文件单开一个项目：项目各开各的页面，排在主池之后跑，坏掉的页面只留给它们自己。
 */
const TOUCH_SPECS = readdirSync(BROWSER_DIR)
  .filter(name => name.endsWith('.spec.ts'))
  .filter(name => /setTouchEmulationEnabled|coarsePointer\(/.test(readFileSync(new URL(name, BROWSER_DIR), 'utf8')))
  .map(name => `tests/browser/${name}`)

/** 量主线程耗时的预算用例：与整套并行跑时量到的是别份用例抢走的 CPU，放到最后单独串行跑。 */
const SERIAL_SPECS = ['tests/browser/overlay-open-budget.spec.ts']

// 浏览器态：真实 Chromium，跑 jsdom 里演不出来的那部分（无障碍、布局、可见性、真实焦点）。
// 与 vitest.config 缺省的 jsdom 单测互不覆盖，各跑各的目录。
// 三个项目按 sequence.groupOrder 先后跑：主池 → 触屏组 → 串行预算。
export default defineConfig({
  test: {
    // 硬件相关的性能预算只在固定配额的容器里跑（vitest.performance.config.ts），三个项目都不收
    exclude: ['tests/browser/visual-performance.spec.ts'],
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
          name: 'vue-browser',
          include: ['tests/browser/**/*.spec.ts'],
          exclude: [...TOUCH_SPECS, ...SERIAL_SPECS],
        },
      },
      {
        extends: true,
        test: {
          name: 'vue-browser-touch',
          include: TOUCH_SPECS,
          sequence: { groupOrder: 1 },
        },
      },
      {
        extends: true,
        test: {
          name: 'vue-browser-serial',
          include: SERIAL_SPECS,
          maxWorkers: 1,
          sequence: { groupOrder: 2 },
          browser: { fileParallelism: false },
        },
      },
    ],
  },
})
