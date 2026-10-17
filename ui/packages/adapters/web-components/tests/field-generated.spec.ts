// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface FieldHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  description?: string
  errorText?: string
  invalid?: boolean
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: Element & { updateComplete: Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<FieldHost>, inner = ''): FieldHost {
  const el = document.createElement('xh-field') as FieldHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="field"][data-part="${name}"]`)
}

function childrenOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? node.localName)
}

describe('xh-field 生成结构', () => {
  it('slot="control" 的库内控件原样挪到标题之后，外面不包部件；字段把标签、说明与校验状态接到控件上', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '申请人', description: '填写全名', errorText: '' }, '<xh-text-field slot="control"></xh-text-field>')
    el.invalid = true
    await settle(el)
    const control = el.querySelector('xh-text-field') as HTMLElement & { updateComplete: Promise<unknown> }
    await settle(control)

    const root = part(el, 'root')!
    expect(childrenOf(root)).toEqual(['label', 'xh-text-field', 'description', 'error-text'])
    expect(control.hasAttribute('data-xh-gen')).toBe(false)
    const input = control.querySelector<HTMLElement>('[data-scope="text-field"][data-part="input"]')!
    expect(input.getAttribute('aria-labelledby')).toContain(part(el, 'label')!.id)
    expect(input.getAttribute('aria-describedby')).toContain(part(el, 'description')!.id)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('标题、说明、错误文案给了才铺；错误文案非 invalid 时收起', async () => {
    const el = mount({ label: '邮箱' }, '<xh-text-field slot="control"></xh-text-field>')
    await settle(el)
    expect(childrenOf(part(el, 'root')!)).toEqual(['label', 'xh-text-field'])

    el.errorText = '格式不对'
    await settle(el)
    expect(childrenOf(part(el, 'root')!)).toEqual(['label', 'xh-text-field', 'error-text'])
    expect(part(el, 'error-text')!.hidden).toBe(true)
    expect(part(el, 'error-text')!.textContent).toBe('格式不对')
  })

  it('标题与说明可由 slot 接管', async () => {
    const el = mount({}, '<b slot="label">申请人</b><xh-text-field slot="control"></xh-text-field><i slot="description">必填</i>')
    await settle(el)
    expect(childrenOf(part(el, 'root')!)).toEqual(['label', 'xh-text-field', 'description'])
    expect(part(el, 'label')!.querySelector('b')!.textContent).toBe('申请人')
    expect(part(el, 'description')!.querySelector('i')!.textContent).toBe('必填')
  })
})
