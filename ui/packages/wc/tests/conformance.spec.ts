// @vitest-environment jsdom
import { runConformance } from '@xihan-ui/testing'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createWcHarness } from './harness'
import { wcSuites } from './suites'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

runConformance(
  createWcHarness(),
  wcSuites,
  { describe, it },
  {
    // 焦点环绕要真实的 Tab 焦点移动，jsdom 按 Tab 不移动焦点，这四行在这里演不出来。
    // 陷阱本身（trapped/loop 的装配）由 focus-scope 的单测覆盖，环绕效果待真机验证。
    keyboardCoverageExempt: {
      // dialog 与 drawer 不在这份清单里，它们连同各自的豁免一起住在 dialog-conformance.spec.ts
      'popover.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      // 输入法那两行不是"暂时演不出来"，是运行时根本给不出信号：
      // 合成 KeyboardEvent 的 isComposing 恒 false（且 keyCode 恒 0），
      // 换行则是浏览器的默认行为、组件刻意不接管，于是连个可断言的属性都没有。
      'composer.kbd.ime-enter': 'jsdom 与浏览器都无法合成真实 IME 组合态，isComposing 恒 false',
      'composer.kbd.shift-enter': '换行是浏览器默认行为，组件不接管也就无属性可断言',
    },
  },
)
