// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { NavigationMenuNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface NavigationMenuHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: NavigationMenuNode[]
}

const COLLECTION: NavigationMenuNode[] = [
  { value: 'home', label: '首页', href: '#home', current: true },
  {
    value: 'products',
    label: '产品',
    children: [
      { value: 'flow', label: '流程设计器', href: '#flow' },
      { value: 'more', label: '更多', children: [{ value: 'print', label: '打印设计器', href: '#print' }] },
    ],
  },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: NavigationMenuHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<NavigationMenuHost>, inner = ''): NavigationMenuHost {
  const el = document.createElement('xh-navigation-menu') as NavigationMenuHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function parts(el: Element, name: string): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(`[data-xh-part="${name}"]`))
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-xh-part') ?? node.localName)
}

describe('xh-navigation-menu 生成结构', () => {
  it('什么都不写：生成 nav、列表、直达链接、入口与面板、指示条，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION })
    await settle(el)

    const root = parts(el, 'root')[0]!
    expect(root.localName).toBe('nav')
    const list = parts(el, 'list')[0]!
    expect(list.localName).toBe('ul')
    expect(partsOf(list)).toEqual(['item', 'item', 'indicator'])
    expect(partsOf(parts(el, 'item')[0]!)).toEqual(['link'])
    expect(partsOf(parts(el, 'item')[1]!)).toEqual(['trigger', 'content'])

    const links = parts(el, 'link')
    expect(links.map(link => [link.localName, link.getAttribute('href'), link.textContent])).toEqual([
      ['a', '#home', '首页'],
      ['a', '#flow', '流程设计器'],
      ['a', '#print', '打印设计器'],
    ])
    expect(links[0]!.getAttribute('aria-current')).toBe('page')
    expect(links[1]!.hasAttribute('aria-current')).toBe(false)

    const trigger = parts(el, 'trigger')[0]!
    expect([trigger.localName, trigger.getAttribute('value'), trigger.textContent]).toEqual(['button', 'products', '产品'])
    expect(partsOf(parts(el, 'content')[0]!)).toEqual(['link', 'branch-trigger', 'branch-content'])
    const branch = parts(el, 'branch-trigger')[0]!
    expect(branch.textContent).toBe('更多')
    expect(partsOf(branch)).toEqual(['span', 'branch-indicator'])
    expect(parts(el, 'indicator')[0]!.localName).toBe('li')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('slot="panel:<值>" 整块给出这个入口的面板内容；点入口展开面板', async () => {
    const el = mount({ collection: COLLECTION }, '<div slot="panel:products"><a href="#all">全部产品</a></div>')
    await settle(el)

    const content = parts(el, 'content')[0]!
    expect(content.innerHTML).toBe('<div slot="panel:products"><a href="#all">全部产品</a></div>')
    expect(parts(el, 'branch-trigger')).toHaveLength(0)

    const trigger = parts(el, 'trigger')[0]!
    trigger.click()
    await settle(el)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(content.hasAttribute('hidden')).toBe(false)
  })

  it('换数据：按值复用条目', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    const kept = parts(el, 'item')[0]

    el.collection = [COLLECTION[0]!, { value: 'about', label: '关于', href: '#about' }]
    await settle(el)
    expect(parts(el, 'item')[0]).toBe(kept)
    expect(parts(el, 'link').map(link => link.getAttribute('href'))).toEqual(['#home', '#about'])
    expect(parts(el, 'trigger')).toHaveLength(0)
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)

    el.innerHTML = '<nav data-xh-part="root"><ul data-xh-part="list"><li data-xh-part="item"><a data-xh-part="link" href="#mine">自己的链接</a></li></ul></nav>'
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
    expect(parts(el, 'link').map(link => link.textContent)).toEqual(['自己的链接'])
  })
})
