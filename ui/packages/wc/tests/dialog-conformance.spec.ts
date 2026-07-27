// @vitest-environment jsdom
import { runConformance } from '@xihan-ui/testing'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createWcHarness } from './harness'
import { wcDialogSuite } from './wc-dialog.suite'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

// dialog 机器 + connect + 焦点 + 受控在 WC 适配器上跑通（presence 模型与 Vue 不同，见 ADR）。
runConformance(createWcHarness(), [wcDialogSuite], { describe, it }, {
  // 焦点环绕要真实的 Tab 焦点移动，jsdom 演不出来
  keyboardCoverageExempt: {
    'dialog.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
    'dialog.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
  },
})
