// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { CommandGroup, CommandNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface CommandHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: CommandNode[]
  groups?: CommandGroup[]
  open?: boolean
}

const COLLECTION: CommandNode[] = [
  { value: 'page-users', label: '用户管理', group: 'nav' },
  { value: 'page-roles', label: '角色管理', group: 'nav', description: '分配权限' },
  { value: 'action-export', label: '导出报表', shortcut: 'Ctrl+E' },
]

const GROUPS: CommandGroup[] = [{ value: 'nav', label: '页面' }]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: CommandHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<CommandHost>, inner = ''): CommandHost {
  const el = document.createElement('xh-command') as CommandHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

/** 展开后遮罩与定位层经 portal 挪出宿主，按 scope 在整页里找。 */
function parts(name: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`[data-scope="command"][data-part="${name}"]`))
}

/** 子节点里的部件；滚动条控制器挂在面板上的滚动条不算。 */
function partsOf(parent: Element): string[] {
  return Array.from(parent.children, node => node.getAttribute('data-xh-part')).filter((part): part is string => part !== null)
}

describe('xh-command 生成结构', () => {
  it('什么都不写：直接在宿主里生成遮罩与定位层，面板里是检索框、按组铺的结果列表、空态与在途占位，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, groups: GROUPS })
    await settle(el)

    expect(partsOf(el)).toEqual(['backdrop', 'positioner'])
    const content = parts('content')[0]!
    expect(partsOf(content)).toEqual(['input', 'list', 'empty', 'loading'])
    expect(parts('input')[0]!.localName).toBe('input')
    expect(partsOf(parts('list')[0]!)).toEqual(['group', 'item'])
    expect(partsOf(parts('group')[0]!)).toEqual(['group-label', 'item', 'item'])
    expect(partsOf(parts('item')[1]!)).toEqual(['item-text', 'item-description'])
    expect(partsOf(parts('item')[2]!)).toEqual(['item-text', 'item-shortcut'])
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('slot 给出触发按钮、空态、页脚与条目文字；点触发按钮展开', async () => {
    const el = mount({ collection: COLLECTION, groups: GROUPS }, [
      '<span slot="trigger">打开命令</span>',
      '<em slot="empty">没有这条命令</em>',
      '<small slot="footer">↵ 执行</small>',
      '<b slot="item:action-export">导出…</b>',
    ].join(''))
    await settle(el)

    expect(partsOf(el)).toEqual(['trigger', 'backdrop', 'positioner'])
    const trigger = parts('trigger')[0]!
    expect(trigger.localName).toBe('button')
    expect(trigger.innerHTML).toBe('<span slot="trigger">打开命令</span>')
    expect(partsOf(parts('content')[0]!)).toEqual(['input', 'list', 'empty', 'loading', 'footer'])
    expect(parts('empty')[0]!.innerHTML).toBe('<em slot="empty">没有这条命令</em>')
    expect(parts('footer')[0]!.localName).toBe('footer')
    expect(parts('item-text')[2]!.innerHTML).toBe('<b slot="item:action-export">导出…</b>')

    trigger.click()
    await settle(el)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('检索只给结果之外的条目与筛空的分组写 hidden，不增删节点', async () => {
    const el = mount({ collection: COLLECTION, groups: GROUPS, open: true })
    await settle(el)
    const items = parts('item')

    const input = parts('input')[0] as HTMLInputElement
    input.value = '导出'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle(el)
    expect(parts('item')).toEqual(items)
    expect(items.map(item => item.hasAttribute('hidden'))).toEqual([true, true, false])
    expect(parts('group')[0]!.hasAttribute('hidden')).toBe(true)
  })

  it('换数据：按值复用条目', async () => {
    const el = mount({ collection: COLLECTION, groups: GROUPS })
    await settle(el)
    const kept = parts('item')[2]

    el.collection = [COLLECTION[2]!, { value: 'action-print', label: '打印' }]
    await settle(el)
    expect(parts('item').map(item => item.getAttribute('value'))).toEqual(['action-export', 'action-print'])
    expect(parts('item')[0]).toBe(kept)
    expect(parts('group')).toHaveLength(0)
  })

  it('作者写的面板展开时搬进 portal：宿主里没有部件了也不生成一套', async () => {
    const el = mount(
      { collection: COLLECTION, groups: GROUPS, open: true },
      '<div data-xh-part="content"><input data-xh-part="input"><div data-xh-part="list"><div data-xh-part="item" value="page-users">自己的条目</div></div></div>',
    )
    await settle(el)

    expect(el.querySelector('[data-xh-part="content"]')).toBeNull()
    expect(document.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
    expect(parts('list')).toHaveLength(1)
    expect(parts('item').map(item => item.textContent)).toEqual(['自己的条目'])
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION, groups: GROUPS })
    await settle(el)

    el.innerHTML = '<div data-xh-part="content"><input data-xh-part="input"><div data-xh-part="list"><div data-xh-part="item" value="page-users">自己的条目</div></div></div>'
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
    expect(parts('item').map(item => item.textContent)).toEqual(['自己的条目'])
  })
})
