// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { TransferItem } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TransferHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: TransferItem[]
  defaultValue?: string[]
  searchable?: boolean
  oneWay?: boolean
}

const ITEMS: TransferItem[] = [
  { value: 'a', label: '苹果' },
  { value: 'b', label: '香蕉', description: '进口' },
  { value: 'c', label: '樱桃' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: TransferHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TransferHost>, inner = ''): TransferHost {
  const el = document.createElement('xh-transfer') as TransferHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="transfer"][data-part="${name}"]`)
}

/** 父节点下属于穿梭框自己的部件（列表旁的自绘滚动条归 scrollbar，不算）。 */
function partsOf(parent: Element): string[] {
  return Array.from(parent.children).filter(node => node.getAttribute('data-scope') === 'transfer').map(node => node.getAttribute('data-part') ?? '')
}

/** 某侧列表里条目的文字。 */
function itemsIn(el: Element, panel: string): string[] {
  return Array.from(part(el, panel)!.querySelectorAll('[data-part="item"] [data-part="item-text"]'), node => node.textContent ?? '')
}

describe('xh-transfer 生成结构', () => {
  it('什么都不写：生成两侧面板与两颗搬运钮，每侧只铺本侧的条目，标题、全选、空态与在途的字取 translations', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: ITEMS, defaultValue: ['c'] })
    await settle(el)

    expect(partsOf(part(el, 'root')!).filter(name => name !== 'hidden-input')).toEqual(['source-panel', 'to-target-trigger', 'to-source-trigger', 'target-panel'])
    const source = part(el, 'source-panel')!
    expect(partsOf(source)).toEqual(['panel-header', 'list', 'empty', 'loading'])
    expect(partsOf(source.querySelector('[data-part="panel-header"]')!)).toEqual(['panel-title', 'panel-count', 'select-all-trigger'])
    expect(source.querySelector('[data-part="panel-title"]')!.textContent).toBe('Source list')
    expect(source.querySelector('[data-part="select-all-trigger"]')!.textContent).toBe('Select all')
    expect(source.querySelector('[data-part="empty"]')!.textContent).toBe('No data')
    expect(itemsIn(el, 'source-panel')).toEqual(['苹果', '香蕉'])
    expect(itemsIn(el, 'target-panel')).toEqual(['樱桃'])
    const banana = source.querySelector('[data-part="item"][value="b"]')!
    expect(partsOf(banana)).toEqual(['item-checkbox', 'item-text', 'item-description'])
    const list = source.querySelector('[data-part="list"]')!
    expect(list.getAttribute('aria-labelledby')).toBe(source.querySelector('[data-part="panel-title"]')!.id)
    expect(records.filter(record => record.level === 'error')).toEqual([])
  })

  it('勾选后移到右侧：条目从左侧撤掉、在右侧铺出', async () => {
    const el = mount({ collection: ITEMS, defaultValue: ['c'] })
    await settle(el)
    part(el, 'source-panel')!.querySelector<HTMLElement>('[data-part="item"][value="a"]')!.click()
    await settle(el)
    part(el, 'to-target-trigger')!.click()
    await settle(el)
    expect(itemsIn(el, 'source-panel')).toEqual(['香蕉'])
    expect(itemsIn(el, 'target-panel').sort()).toEqual(['樱桃', '苹果'].sort())
  })

  it('searchable 时每侧多一个搜索框；单向时不生成移回左侧', async () => {
    const el = mount({ collection: ITEMS, searchable: true, oneWay: true })
    await settle(el)
    expect(partsOf(part(el, 'source-panel')!)).toEqual(['panel-header', 'search', 'list', 'empty', 'loading'])
    expect(part(el, 'to-source-trigger')).toBeNull()
  })

  it('作者写了部件就全归作者', async () => {
    const el = mount({ collection: ITEMS }, `
      <div data-xh-part="root">
        <div data-xh-part="source-panel"><div data-xh-part="list"></div></div>
        <button data-xh-part="to-target-trigger"></button>
        <div data-xh-part="target-panel"><div data-xh-part="list"></div></div>
      </div>`)
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen="structure"]')).toHaveLength(0)
  })
})
