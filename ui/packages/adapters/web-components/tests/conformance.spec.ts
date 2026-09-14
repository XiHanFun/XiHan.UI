// @vitest-environment jsdom
import type { DiagnosticRecord } from '@xihan-ui/core'
import {
  DIAGNOSTIC_CODES,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { runConformance } from '@xihan-ui/testing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { installLayoutViewport } from '../../../../tooling/testing/src/fixtures/layout-viewport'
import { createWcHarness } from './harness'
import { wcSuites } from './suites'

let restoreLayoutViewport: (() => void) | undefined
beforeEach(({ task }) => {
  if (task.suite?.name.startsWith('conformance: layout '))
    restoreLayoutViewport = installLayoutViewport(document)
})

let diagnostics: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  diagnostics = []
  onDiagnostic(record => void diagnostics.push(record))
})

afterEach(() => {
  restoreLayoutViewport?.()
  restoreLayoutViewport = undefined
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
      // 列设置区摆在 root 之外，fixture 是一棵以 root 为树根的树，表达不出它的兄弟位；
      // 这一行由 headless 的 tests/table-column-settings.spec.ts 认领
      'table.kbd.column-visibility': '列设置区在 root 之外，fixture 表达不出它的兄弟位',
      // dialog 与 drawer 不在这份清单里，它们连同各自的豁免一起住在 dialog-conformance.spec.ts
      'command.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
    },
  },
)
