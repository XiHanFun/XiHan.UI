// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/kernel'
import { dialogAnatomy, dialogMeta } from '@xihan-ui/headless'
import {
  DIAGNOSTIC_CODES,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsLevel,
} from '@xihan-ui/kernel'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'
import { XhDialogElement } from '../src/elements/dialog'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

let seen: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  seen = []
  onDiagnostic(r => void seen.push(r))
})

afterEach(() => {
  document.body.innerHTML = ''
  resetDiagnostics()
})

function part(name: string, tag = 'div'): HTMLElement {
  const el = document.createElement(tag)
  el.dataset.xhPart = name
  return el
}

async function mountDialog(children: readonly HTMLElement[]): Promise<Updatable> {
  const el = document.createElement('xh-dialog') as Updatable
  for (const c of children) el.appendChild(c)
  document.body.appendChild(el)
  await el.updateComplete
  await el.updateComplete
  return el
}

function codes(code: string): DiagnosticRecord[] {
  return seen.filter(r => r.code === code)
}

describe('角色节点契约', () => {
  it('每个元素类都声明了契约，且必需 part 落在解剖内', () => {
    const contract = XhDialogElement.partContract
    expect(contract).toBeDefined()
    expect(contract!.anatomy.name).toBe(dialogAnatomy.name)
    expect(contract!.meta).toBe(dialogMeta)
    for (const p of contract!.meta.requiredParts)
      expect(contract!.anatomy.parts).toContain(p)
  })

  it('必需 part 齐备时不投递任何诊断', async () => {
    await mountDialog([part('trigger', 'button'), part('content')])
    expect(seen).toEqual([])
  })

  it('缺必需 part 报 error 并带上 part 名与宿主节点', async () => {
    const host = await mountDialog([part('trigger', 'button')])
    const hits = codes(DIAGNOSTIC_CODES.wcMissingPart)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'error', scope: 'dialog', part: 'content' })
    expect(hits[0]!.node).toBe(host)
  })

  it('解剖外的 part 名报 warn 并指向那个节点', async () => {
    const stray = part('conten')
    await mountDialog([part('trigger', 'button'), part('content'), stray])
    const hits = codes(DIAGNOSTIC_CODES.wcUnknownPart)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'dialog', part: 'conten' })
    expect(hits[0]!.node).toBe(stray)
  })

  it('同一实例的同一问题重复渲染只报一次', async () => {
    const host = await mountDialog([part('trigger', 'button')])
    host.setAttribute('modal', 'false')
    await host.updateComplete
    await host.updateComplete
    expect(codes(DIAGNOSTIC_CODES.wcMissingPart)).toHaveLength(1)
  })

  it('两个坏实例各报一次', async () => {
    await mountDialog([part('trigger', 'button')])
    await mountDialog([part('trigger', 'button')])
    expect(codes(DIAGNOSTIC_CODES.wcMissingPart)).toHaveLength(2)
  })

  it('通道静默时不校验', async () => {
    setDiagnosticsLevel('silent')
    await mountDialog([part('trigger', 'button'), part('conten')])
    expect(seen).toEqual([])
  })

  it('部件标签不符时报 warn 并指向那个节点', async () => {
    const el = document.createElement('xh-field') as Updatable
    const label = part('label', 'div')
    const control = part('control', 'input')
    el.append(label, control)
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete

    const hits = codes(DIAGNOSTIC_CODES.wcWrongPartTag)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'field', part: 'label' })
    expect(hits[0]!.node).toBe(label)
  })

  it('部件标签合规时不报', async () => {
    const el = document.createElement('xh-field') as Updatable
    el.append(part('label', 'label'), part('control', 'input'))
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete

    expect(codes(DIAGNOSTIC_CODES.wcWrongPartTag)).toEqual([])
  })
})

describe('委派给内嵌部件的角色节点', () => {
  /** 按 date-picker 的实际写法搭一棵：分段输入与日历的 DOM 摊在宿主自己的 Light DOM 里。 */
  async function mountDatePicker(): Promise<HTMLElement> {
    const el = document.createElement('xh-date-picker') as Updatable
    const root = part('root')
    const control = part('control')
    const input = part('input')
    input.append(part('segment'), part('segment'), part('segment'))
    control.append(input, part('clear-trigger', 'button'), part('trigger', 'button'))

    const calendar = part('calendar')
    const header = part('header')
    header.append(part('prev-trigger', 'button'), part('heading'), part('next-trigger', 'button'))
    const grid = part('grid')
    const gridHead = part('grid-head')
    const weekRow = part('week-row')
    weekRow.append(part('week-day', 'span'))
    gridHead.append(weekRow)
    grid.append(gridHead, part('grid-body'))
    calendar.append(header, grid)

    const content = part('content')
    content.append(calendar)
    const positioner = part('positioner')
    positioner.append(content)

    root.append(part('label', 'span'), control, part('hidden-input', 'input'), positioner)
    el.append(root)
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    return el
  }

  it('内嵌部件的角色节点不再被当成解剖外的野节点', async () => {
    await mountDatePicker()
    expect(codes(DIAGNOSTIC_CODES.wcUnknownPart)).toEqual([])
  })

  it('真正不认识的名字照报不误', async () => {
    const el = await mountDatePicker()
    el.querySelector('[data-xh-part="root"]')!.append(part('并不存在的角色'))
    await (el as Updatable).updateComplete
    await (el as Updatable).updateComplete

    const hits = codes(DIAGNOSTIC_CODES.wcUnknownPart)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ scope: 'date-picker', part: '并不存在的角色' })
  })
})
