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
runConformance(createWcHarness(), [wcDialogSuite], { describe, it }, { enforceKeyboardCoverage: false })
