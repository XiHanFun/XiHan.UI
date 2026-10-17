// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface FieldsetHost extends HTMLElement {
  updateComplete: Promise<unknown>
  legend?: string
  invalid?: boolean
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: FieldsetHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<FieldsetHost>, inner = ''): FieldsetHost {
  const el = document.createElement('xh-fieldset') as FieldsetHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="fieldset"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-fieldset 生成结构', () => {
  it('只给 legend：生成原生 fieldset 当 root，组标题是原生 legend 且是首个子节点', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ legend: '联系方式' })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.localName).toBe('fieldset')
    expect(partsOf(root)).toEqual(['legend'])
    expect(root.firstElementChild!.localName).toBe('legend')
    expect(part(el, 'legend')!.textContent).toBe('联系方式')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('各段按 slot 生成并按组标题、说明、字段区、错误文案、按钮行排好；说明与错误文案接进描述链', async () => {
    const el = mount({ legend: '联系方式', invalid: true }, [
      '<div slot="actions"><button type="button">保存</button></div>',
      '<span slot="error-text">请至少填写一种联系方式</span>',
      '<input slot="field-group" aria-label="邮箱">',
      '<span slot="description">至少填写一种</span>',
    ].join(''))
    await settle(el)

    const root = part(el, 'root')!
    expect(partsOf(root)).toEqual(['legend', 'description', 'field-group', 'error-text', 'actions'])
    expect(part(el, 'field-group')!.querySelector('input[aria-label="邮箱"]')).not.toBeNull()
    expect(root.getAttribute('aria-describedby')!.split(' ')).toEqual([part(el, 'description')!.id, part(el, 'error-text')!.id])
    expect(part(el, 'error-text')!.hidden).toBe(false)
  })

  it('legend 插槽接管组标题文字', async () => {
    const el = mount({ legend: '不用这段' }, '<b slot="legend">收货信息</b>')
    await settle(el)
    expect(part(el, 'legend')!.querySelector('b')!.textContent).toBe('收货信息')
  })
})
