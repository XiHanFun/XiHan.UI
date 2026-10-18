// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { BreadcrumbNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface BreadcrumbHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: BreadcrumbNode[]
  maxItems?: number
}

const COLLECTION: BreadcrumbNode[] = [
  { value: 'home', label: '首页', href: '/', icon: 'home' },
  { value: 'docs', label: '文档', href: '/docs' },
  { value: 'guide', label: '指南', href: '/docs/guide' },
  { value: 'menu', label: '菜单', current: true },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: BreadcrumbHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<BreadcrumbHost>, inner = ''): BreadcrumbHost {
  const el = document.createElement('xh-breadcrumb') as BreadcrumbHost
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

describe('xh-breadcrumb 生成结构', () => {
  it('什么都不写：生成 nav 与有序列表，按折叠后的序列铺层级、分隔符与折叠位，不报缺少部件、不多收起', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, maxItems: 3 })
    await settle(el)

    expect(parts(el, 'root')[0]!.localName).toBe('nav')
    const list = parts(el, 'list')[0]!
    expect(list.localName).toBe('ol')
    expect(partsOf(list)).toEqual(['item', 'separator', 'ellipsis', 'separator', 'item', 'separator', 'item'])
    expect(parts(el, 'item').some(item => item.hidden)).toBe(false)
    const links = parts(el, 'link')
    expect(links.map(link => [link.getAttribute('value'), link.getAttribute('href')])).toEqual([['home', '/'], ['guide', '/docs/guide'], ['menu', null]])
    expect(partsOf(links[0]!)).toEqual(['link-icon', 'span'])
    expect(links[0]!.textContent).toBe('home首页')
    expect(links[1]!.textContent).toBe('指南')
    expect(links[2]!.getAttribute('aria-current')).toBe('page')
    expect(partsOf(parts(el, 'ellipsis')[0]!)).toEqual(['ellipsis-trigger'])
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('按下折叠位：铺出全部层级，原有的层级按值复用', async () => {
    const el = mount({ collection: COLLECTION, maxItems: 3 })
    await settle(el)
    const kept = parts(el, 'item')[0]

    parts(el, 'ellipsis-trigger')[0]!.click()
    await settle(el)
    expect(partsOf(parts(el, 'list')[0]!)).toEqual(['item', 'separator', 'item', 'separator', 'item', 'separator', 'item'])
    expect(parts(el, 'item')[0]).toBe(kept)
    expect(parts(el, 'link').map(link => link.getAttribute('value'))).toEqual(['home', 'docs', 'guide', 'menu'])
  })

  it('slot="separator:<后一项的值>" 与 slot="ellipsis" 给出分隔符与折叠位按钮的内容', async () => {
    const el = mount({ collection: COLLECTION, maxItems: 3 }, '<i slot="separator:menu">›</i><b slot="ellipsis">…</b>')
    await settle(el)

    const separators = parts(el, 'separator')
    expect(separators.map(separator => separator.innerHTML)).toEqual(['', '', '<i slot="separator:menu">›</i>'])
    expect(parts(el, 'ellipsis-trigger')[0]!.innerHTML).toBe('<b slot="ellipsis">…</b>')
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)

    el.innerHTML = '<nav data-xh-part="root"><ol data-xh-part="list"><li data-xh-part="item"><a data-xh-part="link" href="/mine">自己的层级</a></li></ol></nav>'
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
    expect(parts(el, 'link').map(link => link.textContent)).toEqual(['自己的层级'])
  })
})
