// @vitest-environment jsdom
import { accordionSuite, avatarSuite, badgeSuite, buttonSuite, checkboxSuite, collapsibleSuite, dialogSuite, fieldSuite, menuSuite, numberFieldSuite, popoverSuite, progressSuite, radioGroupSuite, runConformance, selectSuite, separatorSuite, switchSuite, tabsSuite, toggleSuite, tooltipSuite } from '@xihan-ui/testing'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createVueHarness } from './harness'

beforeEach(() => {
  // jsdom 无 matchMedia，桩掉供 RuntimeConfig.reducedMotion 使用
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

// 键盘/焦点相关行需真机验证，jsdom 态不强制全覆盖（浏览器态转硬门禁）。
runConformance(
  createVueHarness(),
  [accordionSuite, avatarSuite, badgeSuite, buttonSuite, checkboxSuite, collapsibleSuite, dialogSuite, fieldSuite, menuSuite, numberFieldSuite, popoverSuite, progressSuite, radioGroupSuite, selectSuite, separatorSuite, switchSuite, tabsSuite, toggleSuite, tooltipSuite],
  { describe, it },
  {
    // 焦点环绕要真实的 Tab 焦点移动，jsdom 按 Tab 不移动焦点，这四行在这里演不出来。
    // 陷阱本身（trapped/loop 的装配）由 focus-scope 的单测覆盖，环绕效果待真机验证。
    keyboardCoverageExempt: {
      'dialog.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'dialog.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
    },
  },
)
