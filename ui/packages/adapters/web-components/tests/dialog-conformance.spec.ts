// @vitest-environment jsdom
import { runConformance } from '@xihan-ui/testing'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createWcHarness } from './harness'
import { wcDialogSuite } from './wc-dialog.suite'
import { wcDrawerSuite } from './wc-drawer.suite'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

// dialog 与 drawer 的 presence 模型与 Vue 不同（Light DOM 下 content 常驻、靠 data-state 收起），
// 共享套件按"卸载"写的断言在这边对不上，两者各自单开一份 WC 规格。
runConformance(createWcHarness(), [wcDialogSuite, wcDrawerSuite], { describe, it }, {
  // 焦点环绕要真实的 Tab 焦点移动，jsdom 演不出来
  keyboardCoverageExempt: {
    'dialog.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
    'dialog.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
    'drawer.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
    'drawer.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
  },
})
