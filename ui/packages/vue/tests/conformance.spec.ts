// @vitest-environment jsdom
import { badgeSuite, buttonSuite, checkboxSuite, collapsibleSuite, dialogSuite, progressSuite, runConformance, separatorSuite, switchSuite, toggleSuite } from '@xihan-ui/testing'
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
runConformance(createVueHarness(), [badgeSuite, buttonSuite, checkboxSuite, collapsibleSuite, dialogSuite, progressSuite, separatorSuite, switchSuite, toggleSuite], { describe, it }, { enforceKeyboardCoverage: false })
