// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerOutlineEventMap, DesignerOutlineMove, DesignerOutlineNode, XhDesignerOutlineElement } from '../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
})

const check = { name: 'check', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: 'M5 12l5 5L20 7' } }] } as const

const nodes: DesignerOutlineNode[] = [
  { id: 'name', label: '姓名', description: 'name', icon: check },
  { id: 'grid', label: '栅格', children: [
    { id: 'col-1', label: '第 1 列', movable: false, deletable: false, children: [
      { id: 'phone', label: '手机号', description: 'phone' },
    ] },
    { id: 'col-2', label: '第 2 列', movable: false, deletable: false, children: [] },
  ] },
  { id: 'header', label: '页眉', selectable: false, movable: false, deletable: false, children: [
    { id: 'logo', label: '标志' },
  ] },
]

type Outline = XhDesignerOutlineElement

async function mount(setup: (outline: Outline) => void = () => {}): Promise<Outline> {
  const outline = document.createElement('xh-designer-outline')
  outline.nodes = nodes
  setup(outline)
  document.body.append(outline)
  await outline.updateComplete
  return outline
}

function tree(outline: Element): HTMLElement & { expandedValue?: string[], selection?: string[], nodeDraggable?: boolean, allowDrop?: (move: { value: string, parent: string | null, index: number }) => boolean } {
  return outline.querySelector('xh-tree')!
}

function row(outline: Element, id: string): HTMLElement {
  return outline.querySelector<HTMLElement>(`[data-scope="tree"][data-id="${id}"]`)!
}

function treeitem(outline: Element, id: string): HTMLElement {
  return outline.querySelector<HTMLElement>(`[role="treeitem"][value="${id}"]`)!
}

function record<K extends keyof DesignerOutlineEventMap>(outline: Element, type: K): DesignerOutlineEventMap[K]['detail'][] {
  const seen: DesignerOutlineEventMap[K]['detail'][] = []
  outline.addEventListener(type, event => seen.push((event as DesignerOutlineEventMap[K]).detail))
  return seen
}

function key(target: Element, name: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }))
}

async function search(outline: Outline, text: string): Promise<void> {
  const field = outline.querySelector('xh-text-field')!
  field.dispatchEvent(new CustomEvent('value-change', { detail: { value: text }, bubbles: true }))
  await outline.updateComplete
}

/** 收集这一段里的 wc.* 诊断：部件契约不全的库内元素会在这里报出来。 */
function recordWcDiagnostics(): { readonly codes: () => string[], readonly stop: () => void } {
  const seen: DiagnosticRecord[] = []
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  setDiagnosticsDedupe(false)
  const off = onDiagnostic(record => void seen.push(record))
  return {
    codes: () => seen.filter(item => item.code.startsWith('wc.')).map(item => `${item.code} ${item.scope ?? ''}/${item.part ?? ''}`),
    stop: () => {
      off()
      resetDiagnostics()
    },
  }
}

describe('<xh-designer-outline>', () => {
  it('按树列出节点：以标题命名，层级、位次与展开报给读屏，缺省全部展开；图标、名称与副文本都在行上；没有 wc.* 诊断', async () => {
    const diagnostics = recordWcDiagnostics()
    const outline = await mount()
    const container = tree(outline).querySelector('[data-scope="tree"][data-part="tree"]')!
    expect(container.getAttribute('role')).toBe('tree')
    expect(document.getElementById(container.getAttribute('aria-labelledby')!)!.textContent).toBe('Structure')
    const items = Array.from(container.querySelectorAll('[role="treeitem"]'))
    expect(items.map(item => [item.getAttribute('value'), item.getAttribute('aria-level'), item.getAttribute('aria-expanded')])).toEqual([
      ['name', '1', null],
      ['grid', '1', 'true'],
      ['col-1', '2', 'true'],
      ['phone', '3', null],
      ['col-2', '2', 'true'],
      ['header', '1', 'true'],
      ['logo', '2', null],
    ])
    expect(row(outline, 'name').querySelector('xh-icon')).not.toBeNull()
    expect(row(outline, 'name').querySelector('[data-scope="tree"][data-part="item-description"]')!.textContent).toBe('name')
    expect(row(outline, 'grid').querySelector('[data-scope="tree"][data-part="branch-text"]')!.textContent).toBe('栅格')
    expect(diagnostics.codes()).toEqual([])
    diagnostics.stop()
  })

  it('没有节点时显示空状态，不建树；文案随配置的语言', async () => {
    setXhConfig(designerShellZhCN)
    const outline = await mount(element => element.nodes = [])
    expect(outline.querySelector('xh-tree')).toBeNull()
    const empty = outline.querySelector<HTMLElement>('[data-part="empty"]')!
    expect([empty.hidden, empty.textContent]).toEqual([false, '还没有内容'])
    expect(outline.querySelector('[data-part="title"]')!.textContent).toBe('页面结构')
  })

  it('selection 受控：选中的行报 aria-selected；点一行派发 node-select、不自己改选中；点只作分组的行只展开收起', async () => {
    const outline = await mount(element => element.selection = ['phone'])
    expect(treeitem(outline, 'phone').getAttribute('aria-selected')).toBe('true')
    const selected = record(outline, 'node-select')
    row(outline, 'name').click()
    expect(selected).toEqual([{ ids: ['name'] }])
    await outline.updateComplete
    expect(tree(outline).selection).toEqual(['phone'])
    row(outline, 'header').click()
    await outline.updateComplete
    expect(selected).toHaveLength(1)
    expect(treeitem(outline, 'header').getAttribute('aria-expanded')).toBe('false')
    expect(tree(outline).selection).toEqual(['phone'])
  })

  it('选中了收起的分支里的节点：它的上级都展开', async () => {
    const outline = await mount()
    tree(outline).dispatchEvent(new CustomEvent('expanded-value-change', { detail: { value: ['header'] } }))
    await outline.updateComplete
    expect(treeitem(outline, 'grid').getAttribute('aria-expanded')).toBe('false')
    outline.selection = ['phone']
    await outline.updateComplete
    expect(tree(outline).expandedValue).toEqual(expect.arrayContaining(['grid', 'col-1']))
    expect(treeitem(outline, 'grid').getAttribute('aria-expanded')).toBe('true')
  })

  it('悬停与焦点：指针移到一行或焦点落到一行派发 node-highlight，离开整棵树派发 null；同一行不重复派发', async () => {
    const outline = await mount()
    const seen = record(outline, 'node-highlight')
    const label = row(outline, 'phone').querySelector('[data-scope="tree"][data-part="item-text"]')!
    label.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }))
    label.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }))
    outline.querySelector('[data-part="body"]')!.dispatchEvent(new PointerEvent('pointerleave'))
    treeitem(outline, 'grid').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    treeitem(outline, 'grid').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))
    expect(seen).toEqual([{ id: 'phone' }, { id: null }, { id: 'grid' }, { id: null }])
  })

  it('删除：可删的行带删除钮，点它派发 node-delete、不选中；Delete 删焦点所在的一行，焦点在选中项上时删全部可删的选中项', async () => {
    const outline = await mount(element => element.selection = ['name', 'phone', 'col-1'])
    expect(row(outline, 'col-1').querySelector('[data-part="delete-trigger"]')).toBeNull()
    const trigger = row(outline, 'logo').querySelector<HTMLButtonElement>('[data-part="delete-trigger"]')!
    expect([trigger.tabIndex, trigger.getAttribute('aria-hidden'), trigger.getAttribute('aria-label')]).toEqual([-1, 'true', 'Delete 标志'])
    const deleted = record(outline, 'node-delete')
    const selected = record(outline, 'node-select')
    trigger.click()
    key(treeitem(outline, 'logo'), 'Delete')
    key(treeitem(outline, 'phone'), 'Backspace')
    key(treeitem(outline, 'col-2'), 'Delete')
    key(treeitem(outline, 'name'), 'Delete', { ctrlKey: true })
    expect(deleted).toEqual([{ ids: ['logo'] }, { ids: ['logo'] }, { ids: ['name', 'phone'] }])
    expect(selected).toEqual([])
  })

  it('只读：没有删除钮，Delete 不派发，不能拖；选中与悬停照常', async () => {
    const outline = await mount((element) => {
      element.readonly = true
      element.allowMove = () => true
    })
    expect(outline.querySelector('[data-part="delete-trigger"]')).toBeNull()
    const deleted = record(outline, 'node-delete')
    key(treeitem(outline, 'logo'), 'Delete')
    expect(deleted).toEqual([])
    expect(tree(outline).nodeDraggable).toBe(false)
    const selected = record(outline, 'node-select')
    row(outline, 'logo').click()
    expect(selected).toEqual([{ ids: ['logo'] }])
  })

  it('拖动：给了 allowMove 才能拖；movable 为 false 的节点不许挪；树的 node-move 换成 node-move 事件', async () => {
    const outline = await mount()
    expect(tree(outline).nodeDraggable).toBe(false)
    const asked: DesignerOutlineMove[] = []
    outline.allowMove = (move) => {
      asked.push(move)
      return move.parent !== 'header'
    }
    await outline.updateComplete
    expect(tree(outline).nodeDraggable).toBe(true)
    const allow = tree(outline).allowDrop!
    expect(allow({ value: 'phone', parent: 'col-2', index: 0 })).toBe(true)
    expect(allow({ value: 'phone', parent: 'header', index: 0 })).toBe(false)
    expect(allow({ value: 'col-1', parent: 'grid', index: 1 })).toBe(false)
    expect(asked).toEqual([{ id: 'phone', parent: 'col-2', index: 0 }, { id: 'phone', parent: 'header', index: 0 }])
    const moved = record(outline, 'node-move')
    tree(outline).dispatchEvent(new CustomEvent('node-move', { detail: { value: 'phone', parent: 'col-2', index: 0 } }))
    expect(moved).toEqual([{ id: 'phone', parent: 'col-2', index: 0 }])
  })

  it('searchable 时按名称与副文本过滤，命中的连同上级显示并展开；过滤时不能拖；没有结果显示提示', async () => {
    const outline = await mount((element) => {
      element.searchable = true
      element.allowMove = () => true
    })
    await search(outline, 'PHONE')
    expect(Array.from(outline.querySelectorAll('[role="treeitem"]'), item => item.getAttribute('value'))).toEqual(['grid', 'col-1', 'phone'])
    expect(tree(outline).nodeDraggable).toBe(false)
    await search(outline, '没有这个')
    expect(outline.querySelector('xh-tree')).toBeNull()
    const empty = outline.querySelector<HTMLElement>('[data-part="empty"]')!
    expect([empty.hidden, empty.textContent]).toEqual([false, 'No matching items'])
    await search(outline, '')
    expect(outline.querySelectorAll('[role="treeitem"]')).toHaveLength(7)
    expect(tree(outline).nodeDraggable).toBe(true)
  })

  it('headless 时不画自己的标题，标题仍给树命名；元素自己的 translations 压在全局文案之上', async () => {
    const outline = await mount((element) => {
      element.headless = true
      element.translations = { title: '大纲', remove: label => `移除${label}` }
    })
    const title = outline.querySelector<HTMLElement>('[data-part="title"]')!
    expect([title.hidden, title.textContent]).toEqual([true, '大纲'])
    expect(tree(outline).querySelector('[data-scope="tree"][data-part="tree"]')!.getAttribute('aria-labelledby')).toBe(title.id)
    expect(row(outline, 'logo').querySelector('[data-part="delete-trigger"]')!.getAttribute('aria-label')).toBe('移除标志')
  })
})
