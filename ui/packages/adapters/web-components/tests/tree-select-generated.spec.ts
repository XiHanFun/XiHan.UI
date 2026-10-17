// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { TreeSelectNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TreeSelectHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: TreeSelectNode[]
  label?: string
  clearable?: boolean
  searchable?: boolean
  multiple?: boolean
  value?: string | string[]
  defaultExpandedValue?: string[]
}

const COLLECTION: TreeSelectNode[] = [
  { value: 'src', label: 'Source', children: [{ value: 'index', label: 'Index' }] },
  { value: 'license' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: TreeSelectHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TreeSelectHost>, inner = ''): TreeSelectHost {
  const el = document.createElement('xh-tree-select') as TreeSelectHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element | Document, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="tree-select"][data-part="${name}"]`)
}

function parts(el: Element | Document, name: string): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(`[data-scope="tree-select"][data-part="${name}"]`))
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-tree-select 生成结构', () => {
  it('什么都不写：连 root 生成整套节点，标题进 trigger 的名字链，节点文字取 label、没有时取 value，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, label: '目录', clearable: true, defaultExpandedValue: ['src'] })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(partsOf(root).slice(0, 3)).toEqual(['label', 'control', 'positioner'])
    expect(partsOf(part(el, 'control')!)).toEqual(['trigger', 'clear-trigger'])
    expect(part(el, 'trigger')!.getAttribute('aria-labelledby')!.split(' ')).toContain(part(el, 'label')!.id)
    expect(partsOf(part(el, 'branch-control')!)).toEqual(['branch-trigger', 'branch-text', 'item-indicator'])
    expect(part(el, 'branch-text')!.textContent).toBe('Source')
    expect(parts(el, 'item-text').map(text => text.textContent)).toEqual(['Index', 'license'])
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('没给 collection 也生成：树是空的，必备部件都在', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({})
    await settle(el)

    expect(part(el, 'trigger')).not.toBeNull()
    expect(part(el, 'tree')!.children).toHaveLength(0)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('searchable 时树前面生成搜索框，关掉时撤掉', async () => {
    const el = mount({ collection: COLLECTION, searchable: true })
    await settle(el)
    expect(partsOf(part(el, 'content')!).slice(0, 2)).toEqual(['input', 'tree'])

    el.searchable = false
    await settle(el)
    expect(part(el, 'input')).toBeNull()
  })

  it('slot 接管标题；换数据按值复用节点', async () => {
    const el = mount({ collection: COLLECTION }, '<b slot="label">目录</b>')
    await settle(el)
    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">目录</b>')
    const kept = parts(el, 'item').find(item => item.getAttribute('value') === 'license')

    el.collection = [{ value: 'license' }, { value: 'notes', label: 'Notes' }]
    await settle(el)
    expect(parts(el, 'item').map(item => item.getAttribute('value'))).toEqual(['license', 'notes'])
    expect(parts(el, 'item')[0]).toBe(kept)
    expect(part(el, 'branch')).toBeNull()
  })

  it('多选：触发器里生成标签行，已选项接成 tag 的 root', async () => {
    const el = mount({ collection: COLLECTION, multiple: true, value: ['index', 'license'] })
    await settle(el)

    const tags = [...el.querySelectorAll('[data-part="tag-list"] > [data-scope="tag"][data-part="root"]:not([data-count])')]
    expect(tags.map(tag => tag.textContent)).toEqual(['Index', 'license'])
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    expect(part(el, 'tree')).not.toBeNull()

    el.innerHTML = [
      '<div data-xh-part="root"><button data-xh-part="trigger"><span data-xh-part="value-text"></span></button>',
      '<div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree">',
      '<div data-xh-part="item" value="license"><span data-xh-part="item-text">自己写的</span></div>',
      '</div></div></div></div>',
    ].join('')
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen="structure"]')).toHaveLength(0)
    expect(parts(el, 'item-text').map(text => text.textContent)).toEqual(['自己写的'])
  })
})
