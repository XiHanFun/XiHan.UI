// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { MenuNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface MenuHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: MenuNode[]
  label?: string
  open?: boolean
}

const COLLECTION: MenuNode[] = [
  { value: 'open', label: '打开', shortcut: 'Ctrl+O' },
  { value: 'rename', label: '重命名', description: '改文件名' },
  { value: 'share', label: '发送到', separatorBefore: true, children: [{ value: 'email', label: '邮件' }, { value: 'message', label: '消息' }] },
  { value: 'bold', label: '粗体', kind: 'checkbox', group: 'format', groupLabel: '格式', separatorBefore: true },
  { value: 'italic', label: '斜体', kind: 'checkbox', group: 'format' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: MenuHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<MenuHost>, inner = ''): MenuHost {
  const el = document.createElement('xh-menu') as MenuHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

/** 本菜单自己的部件：不进嵌套子菜单的子树。 */
function own(el: Element, name: string): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(`[data-xh-part="${name}"]`))
    .filter(node => node.parentElement?.closest('xh-menu') === el)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-xh-part') ?? node.localName)
}

describe('xh-menu 生成结构', () => {
  it('什么都不写：直接在宿主里生成触发按钮与定位层，条目、分组、分隔线照数据铺，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, label: '文件' })
    await settle(el)

    expect(partsOf(el)).toEqual(['trigger', 'positioner'])
    const [trigger] = own(el, 'trigger')
    expect(trigger!.localName).toBe('button')
    expect(trigger!.textContent).toBe('文件')
    const content = own(el, 'content')[0]!
    expect(partsOf(content)).toEqual(['item', 'item', 'separator', 'xh-menu', 'separator', 'group'])
    expect(partsOf(own(el, 'item')[0]!)).toEqual(['item-text', 'item-shortcut'])
    expect(partsOf(own(el, 'item')[1]!)).toEqual(['item-text', 'item-description'])
    const group = own(el, 'group')[0]!
    expect(group.getAttribute('value')).toBe('format')
    expect(partsOf(group)).toEqual(['group-label', 'item', 'item'])
    expect(partsOf(own(el, 'item')[2]!)).toEqual(['item-text', 'item-indicator'])
    expect(own(el, 'item')[2]!.getAttribute('role')).toBe('menuitemcheckbox')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('带 children 的条目生成嵌套的子菜单：触发条目写着 value、文字取 label，里面照数据铺下一层', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)

    const sub = el.querySelector<MenuHost & { submenu?: boolean, value?: string }>('xh-menu')!
    await settle(sub)
    expect(sub.submenu).toBe(true)
    const [subTrigger] = own(sub, 'trigger')
    expect(subTrigger!.localName).toBe('div')
    expect(subTrigger!.getAttribute('value')).toBe('share')
    expect(subTrigger!.textContent).toBe('发送到')
    expect(subTrigger!.getAttribute('role')).toBe('menuitem')
    expect(subTrigger!.getAttribute('aria-haspopup')).toBe('menu')
    // 触发条目与普通条目一样，文字在 item-text 里
    expect(subTrigger!.querySelector('[data-part="item-text"]')!.textContent).toBe('发送到')
    expect(own(sub, 'item-text').map(text => text.textContent)).toEqual(['发送到', '邮件', '消息'])
  })

  it('点触发按钮展开；slot 接管触发按钮的内容与某一条的整条', async () => {
    const el = mount({ collection: COLLECTION }, '<b slot="trigger">文件</b><span slot="item:open"><i data-xh-part="item-text">打开…</i></span>')
    await settle(el)

    const trigger = own(el, 'trigger')[0]!
    expect(trigger.innerHTML).toBe('<b slot="trigger">文件</b>')
    expect(own(el, 'item')[0]!.textContent).toBe('打开…')
    trigger.click()
    await settle(el)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('换数据：按值复用条目', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    const kept = own(el, 'item')[1]

    el.collection = [{ value: 'rename', label: '重命名' }, { value: 'delete', label: '删除' }]
    await settle(el)
    expect(own(el, 'item').map(item => item.getAttribute('value'))).toEqual(['rename', 'delete'])
    expect(own(el, 'item')[0]).toBe(kept)
    expect(el.querySelector('xh-menu')).toBeNull()
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)

    el.innerHTML = [
      '<button data-xh-part="trigger">自己的触发器</button>',
      '<div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="item" value="open">自己的条目</div></div></div>',
    ].join('')
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
    expect(own(el, 'item').map(item => item.textContent)).toEqual(['自己的条目'])
  })
})
