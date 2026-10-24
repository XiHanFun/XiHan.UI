// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { ComboboxNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface ComboboxHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: ComboboxNode[]
  label?: string
  empty?: string
  name?: string
  clearable?: boolean
  multiple?: boolean
  value?: string | string[]
  open?: boolean
}

const COLLECTION: ComboboxNode[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: ComboboxHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<ComboboxHost>, inner = ''): ComboboxHost {
  const el = document.createElement('xh-combobox') as ComboboxHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element | Document, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="combobox"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-combobox 生成结构', () => {
  it('什么都不写：连 root 生成整套节点，标题进输入框的名字链，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, label: '水果', empty: '没有匹配项', clearable: true, name: 'fruit' })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(Array.from(root.children).map(node => node.getAttribute('data-xh-part'))).toEqual(['label', 'control', 'positioner', 'hidden-input'])
    expect(partsOf(part(el, 'control')!)).toEqual(['input', 'clear-trigger', 'trigger'])
    expect(Array.from(part(el, 'positioner')!.children).map(node => node.getAttribute('data-xh-part')).filter(Boolean)).toEqual(['content', 'empty', 'loading'])
    expect(part(el, 'label')!.localName).toBe('label')
    expect(part(el, 'input')!.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    expect(part(el, 'empty')!.textContent).toBe('没有匹配项')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])

    // 没有 name 也不必填：影子既不提交也拦不住什么，不铺
    el.name = undefined
    await settle(el)
    expect(Array.from(root.children).map(node => node.getAttribute('data-xh-part'))).toEqual(['label', 'control', 'positioner'])
  })

  it('候选清空时空态露出：过滤归调用方，换 collection 即换候选', async () => {
    const el = mount({ collection: COLLECTION, empty: '没有匹配项', open: true })
    await settle(el)
    expect(part(document, 'empty')!.style.display).toBe('none')

    el.collection = []
    await settle(el)
    expect(document.querySelectorAll('[data-scope="combobox"][data-part="item"]')).toHaveLength(0)
    expect(part(document, 'empty')!.style.display).toBe('')
  })

  it('在途占位：生成时写 translations.loading，展开、在途且没有候选时露出', async () => {
    const el = mount({ collection: [], open: true })
    await settle(el)
    const loading = part(document, 'loading')!
    expect([loading.textContent, loading.hidden]).toEqual(['Loading', true])
    Object.assign(el, { loading: true })
    await settle(el)
    expect(part(document, 'loading')!.hidden).toBe(false)
  })

  it('多选：标签行里每枚标签带文字与删除钮，摆不下的折进 +N', async () => {
    const el = mount({ collection: COLLECTION, multiple: true, value: ['apple', 'banana', 'cherry'] })
    Object.assign(el, { maxTagCount: 2 })
    await settle(el)

    const tags = [...el.querySelectorAll('[data-part="tag-list"] > [data-scope="tag"][data-part="root"]')]
    expect(tags.map(tag => tag.textContent)).toEqual(['Apple', 'Banana', '+1'])
    expect(tags.map(tag => tag.querySelector('[data-scope="tag"][data-part="close-trigger"]')?.localName ?? null)).toEqual(['button', 'button', null])
  })

  it('slot 接管空态与条目文字', async () => {
    const el = mount({ collection: COLLECTION }, '<em slot="empty">换个词试试</em><b slot="item:banana">香蕉</b>')
    await settle(el)

    expect(part(el, 'empty')!.innerHTML).toBe('<em slot="empty">换个词试试</em>')
    const texts = [...el.querySelectorAll('[data-scope="combobox"][data-part="item-text"]')].map(text => text.textContent)
    expect(texts).toEqual(['Apple', '香蕉', 'Cherry'])
  })
})
