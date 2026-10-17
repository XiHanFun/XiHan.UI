// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { CascaderNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface CascaderHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  clearable?: boolean
  multiple?: boolean
  searchable?: boolean
  collection?: CascaderNode[]
  defaultValue?: string[][]
  loadChildren?: (node: CascaderNode) => Promise<CascaderNode[]>
}

const TREE: CascaderNode[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州', description: '省会' },
      { value: 'ningbo', label: '宁波' },
    ],
  },
  { value: 'macau', label: '澳门' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: CascaderHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<CascaderHost>, inner = ''): CascaderHost {
  const el = document.createElement('xh-cascader') as CascaderHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="cascader"][data-part="${name}"]`)
}

/** 父节点下属于级联选择自己的部件（自绘滚动条、标签等别的 scope 不算）。 */
function partsOf(parent: Element): string[] {
  return Array.from(parent.children).filter(node => node.getAttribute('data-scope') === 'cascader').map(node => node.getAttribute('data-part') ?? '')
}

/** 当前各列里条目的文字。 */
function columns(): string[][] {
  return Array.from(document.querySelectorAll('[data-scope="cascader"][data-part="column"]'), column =>
    Array.from(column.querySelectorAll('[data-part="item"] [data-part="item-text"]'), text => text.textContent ?? ''))
}

describe('xh-cascader 生成结构', () => {
  it('什么都不写：生成标题、盒（触发钮与清空钮）与浮层里的根列、空态与在途，点分支展开下一列', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '地区', clearable: true, collection: TREE })
    await settle(el)

    expect(partsOf(part('root')!)).toEqual(['label', 'control', 'positioner'])
    expect(partsOf(part('control')!)).toEqual(['trigger', 'clear-trigger'])
    expect(partsOf(part('trigger')!)).toEqual(['value-text', 'indicator'])
    expect(part('trigger')!.getAttribute('aria-labelledby')).toContain(part('label')!.id)
    expect(partsOf(part('content')!)).toEqual(['column', 'empty', 'loading'])
    expect(columns()).toEqual([['浙江', '澳门']])

    part('trigger')!.click()
    await settle(el)
    document.querySelector<HTMLElement>('[data-scope="cascader"][data-part="item"][value="zhejiang"]')!.click()
    await settle(el)
    expect(columns()).toEqual([['浙江', '澳门'], ['杭州', '宁波']])
    const hangzhou = document.querySelector('[data-scope="cascader"][data-part="item"][value="hangzhou"]')!
    expect(partsOf(hangzhou)).toEqual(['item-text', 'item-description', 'item-indicator'])
    expect(partsOf(part('content')!)).toEqual(['column', 'column', 'empty', 'loading'])
    expect(records.filter(record => record.level === 'error')).toEqual([])
  })

  it('选中叶子后值串写进触发钮；多选时触发钮里铺标签行', async () => {
    const el = mount({ collection: TREE, defaultValue: [['zhejiang', 'hangzhou']] })
    await settle(el)
    expect(part('value-text')!.textContent).toBe('浙江 / 杭州')

    const multi = mount({ collection: TREE, multiple: true, defaultValue: [['macau'], ['zhejiang', 'ningbo']] })
    await settle(multi)
    const trigger = multi.querySelector<HTMLElement>('[data-scope="cascader"][data-part="trigger"]')!
    expect(partsOf(trigger)).toEqual(['value-text', 'tag-list', 'indicator'])
    const tags = Array.from(trigger.querySelectorAll('[data-scope="tag"][data-part="root"]:not([data-count])'), tag => tag.textContent)
    expect(tags).toEqual(['澳门', '浙江 / 宁波'])
  })

  it('searchable 时浮层顶部铺搜索框与候选列表，候选是整条路径连缀成的一行', async () => {
    const el = mount({ collection: TREE, searchable: true })
    await settle(el)
    expect(partsOf(part('content')!)).toEqual(['input', 'search-list', 'column', 'empty', 'loading'])
    part('trigger')!.click()
    await settle(el)
    const input = part('input') as HTMLInputElement
    input.value = '杭'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle(el)
    const results = Array.from(part('search-list')!.querySelectorAll('[data-part="search-item"]'), item => [item.getAttribute('value'), item.textContent])
    expect(results).toEqual([['["zhejiang","hangzhou"]', '浙江 / 杭州']])
  })

  it('懒分支：展开到它时那一列由结构铺出在途、失败与重试三块', async () => {
    const el = mount({
      collection: [{ value: 'jiangsu', label: '江苏', hasChildren: true } as CascaderNode],
      loadChildren: () => new Promise<CascaderNode[]>(() => {}),
    })
    await settle(el)
    part('trigger')!.click()
    await settle(el)
    document.querySelector<HTMLElement>('[data-scope="cascader"][data-part="item"][value="jiangsu"]')!.click()
    await settle(el)
    const lazy = document.querySelectorAll('[data-scope="cascader"][data-part="column"]')[1]!
    expect(partsOf(lazy)).toEqual(['branch-loading', 'branch-error', 'branch-retry-trigger'])
    expect(Array.from(lazy.children, node => node.getAttribute('data-xh-gen'))).toEqual(['structure', 'structure', 'structure'])
    expect(lazy.querySelector<HTMLElement>('[data-part="branch-loading"]')!.hidden).toBe(false)
  })

  it('slot="label" 接管标题；作者写了部件就全归作者', async () => {
    mount({ collection: TREE }, '<b slot="label">所在地</b>')
    await settle(document.querySelector('xh-cascader') as CascaderHost)
    expect(part('label')!.querySelector('b')!.textContent).toBe('所在地')
    document.body.replaceChildren()

    const authored = mount({ collection: TREE }, `
      <div data-xh-part="root">
        <button data-xh-part="trigger"></button>
        <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="column" level="0"></div></div></div>
      </div>`)
    await settle(authored)
    expect(authored.querySelectorAll('[data-xh-gen="structure"]')).toHaveLength(0)
  })
})
