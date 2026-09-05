// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import {
  DIAGNOSTIC_CODES,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface FieldsetHost extends HTMLElement {
  updateComplete: Promise<unknown>
  disabled?: boolean
}

let seen: DiagnosticRecord[] = []
let off: (() => void) | undefined

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsLevel('warn')
  setDiagnosticsConsoleOutput(false)
  seen = []
  off = onDiagnostic(record => void seen.push(record))
})

afterEach(() => {
  off?.()
  resetDiagnostics()
  document.body.innerHTML = ''
})

async function mount(inner: string): Promise<FieldsetHost> {
  const host = document.createElement('xh-fieldset') as FieldsetHost
  host.innerHTML = inner
  document.body.appendChild(host)
  await host.updateComplete
  return host
}

function legendWarnings(): DiagnosticRecord[] {
  return seen.filter(r => r.code === DIAGNOSTIC_CODES.warn && r.scope === 'fieldset' && r.part === 'legend')
}

const ROOT = '[data-xh-part="root"]'
const WELL_FORMED = '<fieldset data-xh-part="root"><legend data-xh-part="legend">组名</legend><input></fieldset>'

describe('xh-fieldset legend 位置', () => {
  it('legend 是首个子节点时不报诊断', async () => {
    await mount(WELL_FORMED)
    expect(legendWarnings()).toHaveLength(0)
  })

  it('legend 被挪到别的位置时报一条诊断：组名与"legend 内控件不被连坐"都会静默失效', async () => {
    await mount('<fieldset data-xh-part="root"><input><legend data-xh-part="legend">组名</legend></fieldset>')
    expect(legendWarnings()).toHaveLength(1)
  })
})

describe('xh-fieldset 布尔属性三态', () => {
  it('disabled="false" 读成假，与 Vue 侧 :disabled="false" 同解', async () => {
    const host = await mount(WELL_FORMED)
    host.setAttribute('disabled', 'false')
    await host.updateComplete
    expect(host.disabled).toBe(false)
    expect(host.querySelector(ROOT)!.hasAttribute('disabled')).toBe(false)
  })

  it('disabled 属性在场即真，原生 disabled 落到 root 上', async () => {
    const host = await mount(WELL_FORMED)
    host.setAttribute('disabled', '')
    await host.updateComplete
    expect(host.disabled).toBe(true)
    expect(host.querySelector(ROOT)!.hasAttribute('disabled')).toBe(true)
  })
})
