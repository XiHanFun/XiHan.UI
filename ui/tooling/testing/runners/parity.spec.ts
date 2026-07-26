// @vitest-environment jsdom
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createVueHarness } from '../../../packages/vue/tests/harness'
import { createWcHarness } from '../../../packages/wc/tests/harness'
import { buttonSuite, runParity } from '../src'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

// 同一份 Button 规格在 Vue 与 WC 上各自独占文档串行录制，逐帧结构比对。
// Button 无 portal/机器，两端 DOM 结构应逐帧完全一致。
runParity([createVueHarness(), createWcHarness()], [buttonSuite], { describe, it })
