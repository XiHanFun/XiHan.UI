// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { RadioGroupNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface RadioGroupHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: RadioGroupNode[]
  label?: string
  value?: string
  name?: string
  variant?: string
}

const COLLECTION: RadioGroupNode[] = [
  { value: 'free', label: '免费版', icon: '☆' },
  { value: 'standard', label: '标准版', description: '适合小团队' },
  { value: 'pro', label: '专业版', disabled: true },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: RadioGroupHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<RadioGroupHost>, inner = ''): RadioGroupHost {
  const el = document.createElement('xh-radio-group') as RadioGroupHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="radio-group"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-radio-group 生成结构', () => {
  it('什么都不写：连 root 生成标题与条目，条目里表单影子、圆圈、图标、文字与说明，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, label: '套餐', name: 'plan', value: 'standard' })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(partsOf(root)).toEqual(['label', 'item', 'item', 'item'])
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-scope="radio-group"][data-part="item"]'))
    expect(items.map(partsOf)).toEqual([
      ['hidden-input', 'indicator', 'item-icon', 'item-text'],
      ['hidden-input', 'indicator', 'item-text', 'item-description'],
      ['hidden-input', 'indicator', 'item-text'],
    ])
    expect(items.map(item => [item.getAttribute('role'), item.getAttribute('aria-checked')])).toEqual([['radio', 'false'], ['radio', 'true'], ['radio', 'false']])
    expect(root.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    expect(items[2]!.getAttribute('aria-disabled')).toBe('true')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('segmented 形态在条目之前生成滑块', async () => {
    const el = mount({ collection: COLLECTION, variant: 'segmented' })
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['thumb', 'item', 'item', 'item'])
  })

  it('slot 接管标题与条目文字', async () => {
    const el = mount({ collection: COLLECTION }, '<b slot="label">选套餐</b><em slot="item:pro">专业版（停售）</em>')
    await settle(el)
    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">选套餐</b>')
    const texts = Array.from(el.querySelectorAll('[data-scope="radio-group"][data-part="item-text"]'), node => node.innerHTML)
    expect(texts).toEqual(['免费版', '标准版', '<em slot="item:pro">专业版（停售）</em>'])
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION }, [
      '<div data-xh-part="root"><div data-xh-part="item" value="free">',
      '<input data-xh-part="hidden-input"><span data-xh-part="indicator"></span><span data-xh-part="item-text">免费</span>',
      '</div></div>',
    ].join(''))
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen="structure"]')).toHaveLength(0)
    expect(el.querySelectorAll('[data-scope="radio-group"][data-part="item"]')).toHaveLength(1)
  })
})
