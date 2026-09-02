// @vitest-environment jsdom
import type { DiagnosticRecord } from '@xihan-ui/kernel'
import {
  DIAGNOSTIC_CODES,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsLevel,
} from '@xihan-ui/kernel'
import { runConformance } from '@xihan-ui/testing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createWcHarness } from './harness'
import { wcSuites } from './suites'

let diagnostics: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  diagnostics = []
  onDiagnostic(record => void diagnostics.push(record))
})

afterEach(() => {
  expect(diagnostics.filter(record => record.code === DIAGNOSTIC_CODES.wcUnknownPart)).toEqual([])
  document.body.innerHTML = ''
  resetDiagnostics()
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
    },
  },
)
