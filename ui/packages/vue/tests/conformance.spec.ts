// @vitest-environment jsdom
import { accordionSuite, badgeSuite, buttonSuite, checkboxSuite, collapsibleSuite, dialogSuite, popoverSuite, progressSuite, radioGroupSuite, runConformance, separatorSuite, switchSuite, tabsSuite, toggleSuite, tooltipSuite } from '@xihan-ui/testing'
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
  [accordionSuite, badgeSuite, buttonSuite, checkboxSuite, collapsibleSuite, dialogSuite, popoverSuite, progressSuite, radioGroupSuite, separatorSuite, switchSuite, tabsSuite, toggleSuite, tooltipSuite],
  { describe, it },
  { enforceKeyboardCoverage: false },
)
