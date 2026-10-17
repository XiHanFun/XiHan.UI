// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { FieldArrayColumn, FieldArrayItem } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface FieldArrayHost extends HTMLElement {
  updateComplete: Promise<unknown>
  defaultValue?: unknown[]
  createItem?: () => unknown
  movable?: boolean
  layout?: 'list' | 'table'
  columns?: FieldArrayColumn[]
  readonly items: FieldArrayItem[]
  add: () => void
  removeItem: (index: number) => void
  moveDown: (index: number) => void
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: FieldArrayHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<FieldArrayHost>): FieldArrayHost {
  const el = document.createElement('xh-field-array') as FieldArrayHost
  Object.assign(el, { createItem: () => '', ...props })
  document.body.append(el)
  return el
}

function parts(el: Element, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-scope="field-array"][data-part="${name}"]`)]
}

function part(el: Element, name: string): HTMLElement | null {
  return parts(el, name)[0] ?? null
}

/** 子节点里的部件名，作者内容这类非部件节点不算。 */
function childParts(el: Element): string[] {
  return [...el.children].map(node => node.getAttribute('data-xh-part')).filter((name): name is string => name != null)
}

/** 宿主里给某一行写的作者内容：一个带 slot 的输入框，值是行数据。 */
function contentFor(el: FieldArrayHost, slot: string, value: string): HTMLInputElement {
  const input = document.createElement('input')
  input.setAttribute('slot', slot)
  input.value = value
  el.append(input)
  return input
}

/** 删掉的行的内容在行离场后回到宿主（宿主的直接子节点），这时再删：淡出的替身要带着它。 */
function dropOrphans(el: FieldArrayHost): void {
  const keys = new Set(el.items.map(item => `item-content:${item.key}`))
  for (const node of [...el.querySelectorAll<HTMLElement>(':scope > [slot^="item-content:"]')]) {
    if (!keys.has(node.getAttribute('slot')!))
      node.remove()
  }
}

/** 按当前 items 补上新行的内容。 */
function syncContent(el: FieldArrayHost): void {
  for (const item of el.items) {
    if (!el.querySelector(`[slot="item-content:${item.key}"]`))
      contentFor(el, `item-content:${item.key}`, String(item.value))
  }
}

describe('xh-field-array 生成结构', () => {
  it('列表排布什么都不写：每行是行号、空着的内容格与删除钮，最后是带文字的新增钮', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ defaultValue: ['a', 'b'] })
    await settle(el)

    expect(childParts(part(el, 'root')!)).toEqual(['item', 'item', 'add-trigger'])
    expect(parts(el, 'item').map(item => childParts(item))).toEqual([
      ['item-label', 'item-content', 'item-action'],
      ['item-label', 'item-content', 'item-action'],
    ])
    expect(parts(el, 'item-label').map(label => label.textContent)).toEqual(['1', '2'])
    expect(parts(el, 'item-action').map(action => childParts(action))).toEqual([['item-delete-trigger'], ['item-delete-trigger']])
    expect(parts(el, 'item-content').every(content => content.childElementCount === 0)).toBe(true)
    expect(part(el, 'add-trigger')!.textContent).toBe('Add row')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('按 items 上的行 key 写 slot：内容挪进那一行，换序时跟着行走', async () => {
    const el = mount({ defaultValue: ['a', 'b'], movable: true })
    await settle(el)
    const [first, second] = el.items
    const a = contentFor(el, `item-content:${first!.key}`, 'a')
    const b = contentFor(el, `item-content:${second!.key}`, 'b')
    await settle(el)
    expect(parts(el, 'item-content').map(content => content.firstElementChild)).toEqual([a, b])
    expect(parts(el, 'item-action')[0]!.children).toHaveLength(3)

    el.moveDown(0)
    await settle(el)
    expect(parts(el, 'item-content').map(content => content.firstElementChild)).toEqual([b, a])
    expect(parts(el, 'item-label').map(label => label.textContent)).toEqual(['1', '2'])
  })

  it('新增的行没给内容时空着、不报缺部件；在 value-change 里按 items 增删内容，新行带上内容、删掉的行不留残余', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ defaultValue: ['a'] })
    await settle(el)

    el.add()
    await settle(el)
    expect(parts(el, 'item')).toHaveLength(2)
    expect(parts(el, 'item-content')[1]!.childElementCount).toBe(0)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])

    el.addEventListener('value-change', () => syncContent(el))
    syncContent(el)
    el.add()
    await settle(el)
    expect(parts(el, 'item-content').map(content => content.childElementCount)).toEqual([1, 1, 1])

    el.removeItem(0)
    await settle(el)
    expect(parts(el, 'item')).toHaveLength(2)
    // 离场那一行的内容回到宿主，作者随后删掉，宿主里不剩挪不进去的作者内容
    expect([...el.children].filter(child => child.hasAttribute('slot'))).toHaveLength(1)
    dropOrphans(el)
    expect([...el.children].filter(child => child.hasAttribute('slot'))).toEqual([])
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('受控：value-change 里先写回 value，再按 items 补内容，新行带上内容', async () => {
    const el = mount({})
    ;(el as unknown as { value: unknown[] }).value = ['a']
    await settle(el)
    el.addEventListener('value-change', (event) => {
      ;(el as unknown as { value: unknown[] }).value = (event as CustomEvent<{ value: unknown[] }>).detail.value
      syncContent(el)
    })
    syncContent(el)
    el.add()
    await settle(el)
    expect(parts(el, 'item')).toHaveLength(2)
    expect(parts(el, 'item-content').map(content => content.childElementCount)).toEqual([1, 1])
    expect([...el.children].filter(child => child.hasAttribute('slot'))).toEqual([])
  })

  it('表格排布：表格本体里是表头与各行，行里每列一格，作者内容按「行 key:列 id」挪进格子', async () => {
    const el = mount({
      layout: 'table',
      columns: [{ id: 'name', label: '名称' }, { id: 'amount', label: '金额' }],
      defaultValue: [{ name: '差旅', amount: 120 }],
    })
    await settle(el)

    expect(childParts(part(el, 'root')!)).toEqual(['table', 'add-trigger'])
    expect(childParts(part(el, 'table')!)).toEqual(['header', 'item'])
    expect(parts(el, 'column-header').map(header => header.textContent)).toEqual(['名称', '金额'])
    expect(childParts(part(el, 'item')!)).toEqual(['item-label', 'item-cell', 'item-cell', 'item-action'])

    const key = el.items[0]!.key
    const amount = contentFor(el, `item-cell:${key}:amount`, '120')
    await settle(el)
    expect(parts(el, 'item-cell')[1]!.firstElementChild).toBe(amount)
    expect(parts(el, 'item-cell')[1]!.getAttribute('role')).toBe('cell')
  })
})
