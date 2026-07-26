// @vitest-environment jsdom
import { buttonSuite, runConformance } from '@xihan-ui/testing'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createWcHarness } from './harness'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

// 同一份 Button 规格喂给 WC 适配器实现，逐帧核对（M2-A1 的 WC 侧）。
runConformance(createWcHarness(), [buttonSuite], { describe, it }, { enforceKeyboardCoverage: false })
