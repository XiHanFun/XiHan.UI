// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface NumberFieldHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  defaultValue?: string
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: NumberFieldHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<NumberFieldHost>, inner = ''): NumberFieldHost {
  const el = document.createElement('xh-number-field') as NumberFieldHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="number-field"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-number-field 生成结构', () => {
  it('什么都不写：生成标题与盒里的减号、输入框、加号，标题进输入框的名字链', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '宽度', defaultValue: '3' })
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'control'])
    expect(partsOf(part(el, 'control')!)).toEqual(['decrement-trigger', 'input', 'increment-trigger'])
    expect(part(el, 'input')!.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    part(el, 'increment-trigger')!.click()
    await settle(el)
    expect((part(el, 'input') as HTMLInputElement).value).toBe('4')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('不给 label：只铺盒，输入框不指向不存在的标题', async () => {
    const el = mount({})
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['control'])
    expect(part(el, 'input')!.hasAttribute('aria-labelledby')).toBe(false)
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({}, '<b slot="label">宽度</b>')
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">宽度</b>')
  })
})
