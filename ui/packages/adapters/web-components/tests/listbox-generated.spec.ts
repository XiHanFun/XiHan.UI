// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { ListboxNode, ListboxValueChangeDetails } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface ListboxHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: ListboxNode[]
  label?: string
  value?: string | string[]
}

const COLLECTION: ListboxNode[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', description: '黄色' },
  { value: 'cherry', label: 'Cherry', disabled: true },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: ListboxHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<ListboxHost>, inner = ''): ListboxHost {
  const el = document.createElement('xh-listbox') as ListboxHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="listbox"][data-part="${name}"]`)
}

function parts(el: Element, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-scope="listbox"][data-part="${name}"]`)]
}

/** 直接子节点里本组件的部件名；滚动条是另一个组件的节点，不在其列。 */
function partsOf(parent: Element): string[] {
  return Array.from(parent.children)
    .filter(node => node.getAttribute('data-scope') === 'listbox')
    .map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-listbox 生成结构', () => {
  it('什么都不写：生成标题与列表，条目照 collection 铺，标题进列表的名字链，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, label: '水果' })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(partsOf(root)).toEqual(['label', 'content'])
    const content = part(el, 'content')!
    expect(content.getAttribute('role')).toBe('listbox')
    expect(content.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    const items = parts(el, 'item')
    expect(items.map(item => item.getAttribute('data-value'))).toEqual(['apple', 'banana', 'cherry'])
    expect(partsOf(items[0]!)).toEqual(['item-text', 'item-indicator'])
    expect(partsOf(items[1]!)).toEqual(['item-text', 'item-description', 'item-indicator'])
    expect(part(items[1]!, 'item-description')!.textContent).toBe('黄色')
    expect(items[2]!.getAttribute('aria-disabled')).toBe('true')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('点生成的条目即选中并派发 value-change', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    const changes: string[][] = []
    el.addEventListener('value-change', event => changes.push((event as CustomEvent<ListboxValueChangeDetails>).detail.value))

    parts(el, 'item')[1]!.click()
    await settle(el)
    expect(changes).toEqual([['banana']])
    expect(parts(el, 'item').map(item => item.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
  })

  it('后来才给 label：生成的标题这一拍就进列表的名字链', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    expect(part(el, 'label')).toBeNull()
    expect(part(el, 'content')!.hasAttribute('aria-labelledby')).toBe(false)

    el.label = '水果'
    await settle(el)
    expect(part(el, 'content')!.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
  })

  it('没给 collection 也生成：列表是空的，必备部件都在', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({})
    await settle(el)

    expect(part(el, 'content')!.children).toHaveLength(0)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('数据增删时条目随之增删，留下的条目节点原样复用', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    const apple = parts(el, 'item')[0]

    el.collection = [COLLECTION[0]!, { value: 'durian', label: 'Durian' }]
    await settle(el)
    const items = parts(el, 'item')
    expect(items.map(item => item.getAttribute('data-value'))).toEqual(['apple', 'durian'])
    expect(items[0]).toBe(apple)
  })

  it('slot 接管标题、条目文字与行首行尾：作者节点搬进对应部件，没写的条目照数据铺', async () => {
    const el = mount({ collection: COLLECTION }, [
      '<b slot="label">水果</b>',
      '<em slot="item:banana">香蕉</em>',
      '<i slot="item-prefix:apple">🍎</i>',
      '<span slot="item-suffix:cherry">3</span>',
    ].join(''))
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">水果</b>')
    expect(parts(el, 'item-text').map(text => text.textContent)).toEqual(['Apple', '香蕉', 'Cherry'])
    const items = parts(el, 'item')
    expect(partsOf(items[0]!)).toEqual(['item-prefix', 'item-text', 'item-indicator'])
    expect(partsOf(items[2]!)).toEqual(['item-text', 'item-suffix', 'item-indicator'])
    expect(part(items[2]!, 'item-suffix')!.textContent).toBe('3')
  })

  it('作者写了部件：全归作者，不生成任何节点', async () => {
    const el = mount({}, `
      <div data-xh-part="root">
        <div data-xh-part="content">
          <div data-xh-part="item" value="apple"><span data-xh-part="item-text">Apple</span></div>
        </div>
      </div>`)
    await settle(el)
    expect(partsOf(part(el, 'content')!)).toEqual(['item'])
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
  })
})
