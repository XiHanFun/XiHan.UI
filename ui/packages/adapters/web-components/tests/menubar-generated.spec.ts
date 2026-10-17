// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { MenubarNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface MenubarHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: MenubarNode[]
}

const COLLECTION: MenubarNode[] = [
  {
    value: 'file',
    label: '文件',
    items: [
      { value: 'open', label: '打开', shortcut: 'Ctrl+O' },
      { value: 'share', label: '发送到', separatorBefore: true, children: [{ value: 'email', label: '邮件' }, { value: 'message', label: '消息' }] },
    ],
  },
  {
    value: 'format',
    label: '格式',
    items: [
      { value: 'bold', label: '粗体', kind: 'checkbox', group: 'style', groupLabel: '样式' },
      { value: 'italic', label: '斜体', kind: 'checkbox', group: 'style' },
    ],
  },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: HTMLElement & { updateComplete: Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<MenubarHost>, inner = ''): MenubarHost {
  const el = document.createElement('xh-menubar') as MenubarHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

/** 本菜单栏自己的部件：不进嵌套子菜单的子树；展开的定位层经 portal 挪出宿主，按 scope 在整页里找。 */
function own(el: Element, name: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`[data-scope="menubar"][data-xh-part="${name}"], [data-scope="menubar"][data-part="${name}"]`))
    .filter(node => node.closest('xh-menu') === null && (node.closest('xh-menubar') === el || !el.contains(node)))
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-xh-part') ?? node.localName)
}

describe('xh-menubar 生成结构', () => {
  it('什么都不写：生成 root、一排入口按钮与各自菜单的定位层，条目、分组、分隔线照数据铺，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION })
    await settle(el)

    expect(partsOf(el)).toEqual(['root'])
    expect(partsOf(own(el, 'root')[0]!)).toEqual(['trigger', 'trigger', 'positioner', 'positioner'])
    const triggers = own(el, 'trigger')
    expect(triggers.map(trigger => [trigger.localName, trigger.getAttribute('value'), trigger.textContent])).toEqual([['button', 'file', '文件'], ['button', 'format', '格式']])
    const contents = own(el, 'content')
    expect(contents.map(content => content.getAttribute('value'))).toEqual(['file', 'format'])
    expect(partsOf(contents[0]!)).toEqual(['item', 'separator', 'xh-menu'])
    expect(partsOf(own(el, 'item')[0]!)).toEqual(['item-text', 'item-shortcut'])
    expect(partsOf(contents[1]!)).toEqual(['group'])
    expect(partsOf(own(el, 'group')[0]!)).toEqual(['group-label', 'item', 'item'])
    expect(own(el, 'item')[1]!.getAttribute('role')).toBe('menuitemcheckbox')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('带 children 的条目生成嵌套的子菜单：触发条目是菜单栏里的一条，写着 value、文字取 label', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)

    const sub = el.querySelector<HTMLElement & { updateComplete: Promise<unknown>, submenu?: boolean }>('xh-menu')!
    await settle(sub)
    expect(sub.submenu).toBe(true)
    const subTrigger = sub.querySelector<HTMLElement>('[data-xh-part="trigger"]')!
    expect(subTrigger.localName).toBe('div')
    expect(subTrigger.getAttribute('value')).toBe('share')
    expect(subTrigger.textContent).toBe('发送到')
    expect(subTrigger.getAttribute('role')).toBe('menuitem')
    expect(subTrigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(Array.from(sub.querySelectorAll('[data-xh-part="item-text"]'), text => text.textContent)).toEqual(['邮件', '消息'])
  })

  it('slot 给出某一条的文字，快捷键仍照数据铺；点入口展开那张菜单', async () => {
    const el = mount({ collection: COLLECTION }, '<b slot="item:open">打开…</b>')
    await settle(el)

    const open = own(el, 'item')[0]!
    expect(partsOf(open)).toEqual(['item-text', 'item-shortcut'])
    expect(open.querySelector('[data-xh-part="item-text"]')!.innerHTML).toBe('<b slot="item:open">打开…</b>')
    const trigger = own(el, 'trigger')[0]!
    trigger.click()
    await settle(el)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(own(el, 'content')[0]!.hasAttribute('hidden')).toBe(false)
  })

  it('换数据：按值复用入口与条目', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    const keptTrigger = own(el, 'trigger')[0]
    const keptItem = own(el, 'item')[0]

    el.collection = [{ value: 'file', label: '文件', items: [{ value: 'open', label: '打开' }, { value: 'close', label: '关闭' }] }]
    await settle(el)
    expect(own(el, 'trigger')).toEqual([keptTrigger])
    expect(own(el, 'item').map(item => item.getAttribute('value'))).toEqual(['open', 'close'])
    expect(own(el, 'item')[0]).toBe(keptItem)
    expect(el.querySelector('xh-menu')).toBeNull()
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)

    el.innerHTML = [
      '<div data-xh-part="root">',
      '<button data-xh-part="trigger" value="file">自己的入口</button>',
      '<div data-xh-part="positioner" value="file"><div data-xh-part="content" value="file"><div data-xh-part="item" value="open">自己的条目</div></div></div>',
      '</div>',
    ].join('')
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
    expect(own(el, 'item').map(item => item.textContent)).toEqual(['自己的条目'])
  })
})
