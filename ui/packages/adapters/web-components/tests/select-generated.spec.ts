// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { SelectNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface SelectHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: SelectNode[]
  label?: string
  clearable?: boolean
  multiple?: boolean
  value?: string | string[]
  open?: boolean
}

const COLLECTION: SelectNode[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', description: '黄色' },
  { value: 'cherry', label: 'Cherry' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: SelectHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<SelectHost>, inner = ''): SelectHost {
  const el = document.createElement('xh-select') as SelectHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element | Document, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="select"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-select 生成结构', () => {
  it('什么都不写：连 root 生成整套节点，标题进 trigger 的名字链，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, label: '水果', clearable: true })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(partsOf(root)).toEqual(['hidden-select', 'label', 'control', 'positioner'])
    expect(partsOf(part(el, 'control')!)).toEqual(['trigger', 'clear-trigger'])
    expect(part(el, 'label')!.textContent).toBe('水果')
    const labelled = part(el, 'trigger')!.getAttribute('aria-labelledby')!.split(' ')
    expect(labelled).toContain(part(el, 'label')!.id)
    const items = [...el.querySelectorAll('[data-scope="select"][data-part="item"]')]
    expect(items.map(item => item.getAttribute('data-value'))).toEqual(['apple', 'banana', 'cherry'])
    expect(partsOf(items[1]!)).toEqual(['item-text', 'item-description', 'item-indicator'])
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('后来才给 label：生成的标题这一拍就进 trigger 的名字链', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    expect(part(el, 'label')).toBeNull()

    el.label = '水果'
    await settle(el)
    const label = part(el, 'label')!
    expect(part(el, 'trigger')!.getAttribute('aria-labelledby')!.split(' ')).toContain(label.id)
  })

  it('没给 collection 也生成：列表是空的，必备部件都在', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({})
    await settle(el)

    expect(part(el, 'trigger')).not.toBeNull()
    expect(part(el, 'list')!.children).toHaveLength(0)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('slot 接管标题、条目文字与行首：作者节点搬进对应部件，没写的条目照数据铺', async () => {
    const el = mount({ collection: COLLECTION }, [
      '<b slot="label">水果</b>',
      '<em slot="item:banana">香蕉</em>',
      '<i slot="item-prefix:apple">🍎</i>',
    ].join(''))
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">水果</b>')
    const texts = [...el.querySelectorAll('[data-scope="select"][data-part="item-text"]')]
    expect(texts.map(text => text.textContent)).toEqual(['Apple', '香蕉', 'Cherry'])
    const prefix = el.querySelectorAll('[data-scope="select"][data-part="item-prefix"]')
    expect(prefix).toHaveLength(1)
    expect(prefix[0]!.closest('[data-part="item"]')!.getAttribute('data-value')).toBe('apple')
  })

  it('多选：触发器里生成标签行，标签与 +N 接成 tag 的 root', async () => {
    const el = mount({ collection: COLLECTION, multiple: true, value: ['apple', 'banana', 'cherry'] })
    Object.assign(el, { maxTagCount: 2 })
    await settle(el)

    const tags = [...el.querySelectorAll('[data-part="tag-list"] > [data-scope="tag"][data-part="root"]')]
    expect(tags.map(tag => tag.textContent)).toEqual(['Apple', 'Banana', '+1'])
    expect(tags[2]!.hasAttribute('data-count')).toBe(true)
  })

  it('展开时浮层留在 portal 落点：数据变化只改落点里的条目，搬进条目的作者内容不回宿主，收起后放回 root', async () => {
    const el = mount({ collection: COLLECTION, open: true }, '<em slot="item:banana">香蕉</em>')
    await settle(el)
    const positioner = part(document, 'positioner')!
    const root = part(el, 'root')!
    expect(root.contains(positioner)).toBe(false)

    const moved: Node[] = []
    const observer = new MutationObserver(records => moved.push(...records.flatMap(record => [...record.removedNodes])))
    observer.observe(positioner.querySelector('em')!.parentElement!, { childList: true })
    el.collection = [...COLLECTION, { value: 'durian', label: 'Durian' }]
    await settle(el)
    observer.disconnect()
    expect(moved.filter(node => node.nodeName === 'EM')).toEqual([])
    expect(part(document, 'positioner')).toBe(positioner)
    expect(root.contains(positioner)).toBe(false)
    expect(positioner.querySelectorAll('[data-part="item"]')).toHaveLength(4)
    expect(positioner.querySelector('em')!.parentElement!.getAttribute('data-part')).toBe('item-text')

    el.open = false
    await settle(el)
    expect(root.contains(positioner)).toBe(true)
    expect(root.querySelectorAll('[data-scope="select"][data-part="positioner"]')).toHaveLength(1)
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    expect(part(el, 'root')!.getAttribute('data-xh-gen')).toBe('structure')

    el.innerHTML = [
      '<div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="trigger"><span data-xh-part="value-text"></span></button></div>',
      '<div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="list">',
      '<div data-xh-part="item" value="apple"><span data-xh-part="item-text">Apple</span></div>',
      '</div></div></div></div>',
    ].join('')
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen="structure"]')).toHaveLength(0)
    expect(el.querySelectorAll('[data-scope="select"][data-part="item"]')).toHaveLength(1)
  })
})
