// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerOutlineAdapter, DesignerOutlineEventMap, DesignerOutlineMove, DesignerOutlineNode, XhDesignerOutlineElement } from '../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, describe, expect, it } from 'vitest'
import { createOutlinePanel, defineDesignerShell } from '../src'
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

  it('多选：树报 aria-multiselectable、拿到整份选中；Ctrl 点击加选与取消，Shift 点击从锚点选一段，一段里的分组行不算；Ctrl 点分组行只展开收起', async () => {
    const outline = await mount(element => element.selection = ['name'])
    expect(tree(outline).querySelector('[role="tree"]')!.getAttribute('aria-multiselectable')).toBe('true')
    const selected = record(outline, 'node-select')
    const click = (id: string, init: MouseEventInit = {}): void => void row(outline, id).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
    click('phone', { ctrlKey: true })
    outline.selection = ['name', 'phone']
    await outline.updateComplete
    expect(tree(outline).selection).toEqual(['name', 'phone'])
    // 可见序 name / grid / col-1 / phone / col-2 / header / logo，锚点在 phone
    click('logo', { shiftKey: true })
    click('header', { ctrlKey: true })
    await outline.updateComplete
    expect(treeitem(outline, 'header').getAttribute('aria-expanded')).toBe('false')
    click('name', { metaKey: true })
    expect(selected).toEqual([{ ids: ['name', 'phone'] }, { ids: ['phone', 'col-2', 'logo'] }, { ids: ['phone'] }])
    outline.selection = ['phone']
    await outline.updateComplete
    click('phone', { ctrlKey: true })
    expect(selected.at(-1)).toEqual({ ids: [] })
  })

  it('selection 从外面换了：Shift 点击从新选上的最后一行连起，新选上的第一行滚进可见区；照着 node-select 写回时不滚动', async () => {
    const scrolled: string[] = []
    // 只记大纲的行：树自己也会把焦点所在的 treeitem 滚进可见区
    HTMLElement.prototype.scrollIntoView = function (this: HTMLElement) {
      if (this.dataset.id !== undefined)
        scrolled.push(this.dataset.id)
    }
    try {
      const outline = await mount()
      const selected = record(outline, 'node-select')
      outline.selection = ['phone', 'logo']
      await outline.updateComplete
      await outline.updateComplete
      row(outline, 'grid').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }))
      // 锚点在 logo：可见序 grid / col-1 / phone / col-2 / header / logo，分组行 header 不算
      expect(selected).toEqual([{ ids: ['grid', 'col-1', 'phone', 'col-2', 'logo'] }])
      outline.selection = selected[0]!.ids
      await outline.updateComplete
      await outline.updateComplete
      outline.selection = ['grid', 'col-1', 'phone', 'col-2', 'logo', 'name']
      await outline.updateComplete
      await outline.updateComplete
      expect(scrolled).toEqual(['phone', 'name'])
    }
    finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView
    }
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

  it('expanded 为 false 的分支第一次出现时收起，之后随用户展开收起；后来新出现的同样收起，选中它下面的行时照样展开', async () => {
    const branch = (id: string): DesignerOutlineNode => ({ id, label: id, expanded: false, children: [{ id: `${id}.edge`, label: `${id} edge` }] })
    const outline = await mount(element => (element.nodes = [branch('a'), { id: 'b', label: 'b', children: [{ id: 'b.edge', label: 'b edge' }] }]))
    expect(tree(outline).expandedValue).toEqual(['b'])
    tree(outline).dispatchEvent(new CustomEvent('expanded-value-change', { detail: { value: ['a', 'b'] } }))
    outline.nodes = [branch('a'), { id: 'b', label: 'b', children: [{ id: 'b.edge', label: 'b edge' }] }, branch('c')]
    await outline.updateComplete
    expect(tree(outline).expandedValue).toEqual(['a', 'b'])
    outline.selection = ['c.edge']
    await outline.updateComplete
    expect(tree(outline).expandedValue).toEqual(['a', 'b', 'c'])
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

describe('createOutlinePanel', () => {
  interface Host {
    selection: string[]
    readonly: boolean
    readonly log: string[]
  }

  function adapter(): DesignerOutlineAdapter<Host> {
    return {
      nodes: () => nodes,
      selection: host => host.selection,
      select: (host, ids) => void host.log.push(`select:${ids.join(',')}`),
      highlight: (host, id) => void host.log.push(`highlight:${id}`),
      remove: (host, ids) => void host.log.push(`remove:${ids.join(',')}`),
      canMove: (host, move) => {
        host.log.push(`can:${move.id}>${move.parent}`)
        return move.parent !== 'header'
      },
      move: (host, move) => void host.log.push(`move:${move.id}>${move.parent}@${move.index}`),
    }
  }

  it('登记缺省是左栏的 outline，区的其余项可换；标题与帮助是零件文案，读的时候按全局配置现取', () => {
    const icon = check
    const panel = createOutlinePanel(adapter(), { region: { position: 'end', icon, defaultHidden: true } })
    expect([panel.region.name, panel.region.position, panel.region.icon, panel.region.defaultHidden]).toEqual(['outline', 'end', icon, true])
    expect([panel.region.title, panel.region.help!.startsWith('Everything in the template')]).toEqual(['Structure', true])
    expect(createOutlinePanel(adapter()).region.position).toBe('start')
    setXhConfig(designerShellZhCN)
    expect([panel.region.title, JSON.parse(JSON.stringify(panel.region)).title]).toEqual(['页面结构', '页面结构'])
    expect(panel.region.help).toContain('按树列出模板里的内容')
  })

  it('translations 是这块面板自己的文案：读的时候现取，压在零件文案之上，标题、帮助与零件里的搜索框都用它', async () => {
    let language = 'en'
    const own = (): { title: string, help: string, search: string } => language === 'en'
      ? { title: 'Flow structure', help: 'Nodes and the connections leaving them.', search: 'Search flow' }
      : { title: '流程结构', help: '列出节点与从它出去的连线。', search: '搜索流程' }
    const panel = createOutlinePanel(adapter(), { translations: own })
    expect([panel.region.title, panel.region.help]).toEqual(['Flow structure', 'Nodes and the connections leaving them.'])
    const host: Host = { selection: [], readonly: false, log: [] }
    const instance = panel.create(host)
    const outline = instance.element as Outline
    document.body.append(outline)
    await outline.updateComplete
    expect(outline.querySelector('input')!.getAttribute('aria-label')).toBe('Search flow')
    language = 'zh'
    setXhConfig(designerShellZhCN)
    instance.update!({ ...host })
    await outline.updateComplete
    expect([panel.region.title, outline.querySelector('input')!.getAttribute('aria-label')]).toEqual(['流程结构', '搜索流程'])
    expect(outline.querySelector('[data-part="empty"]')!.textContent).toBe(designerShellZhCN.translations!['xh-designer-outline']!.empty)
  })

  it('建出无头、带搜索框的零件，交上树与选中的行；内容没变时不重设，只读时不能删、不能挪', async () => {
    const host: Host = { selection: ['phone'], readonly: false, log: [] }
    const panel = createOutlinePanel(adapter(), { readonly: context => context.readonly })
    const instance = panel.create(host)
    const outline = instance.element as Outline
    document.body.append(outline)
    await outline.updateComplete
    expect([outline.localName, outline.headless, outline.searchable, outline.nodes, outline.selection]).toEqual(['xh-designer-outline', true, true, nodes, ['phone']])
    expect(outline.allowMove).toBeTypeOf('function')
    const before = outline.nodes
    instance.update!({ ...host })
    expect(outline.nodes).toBe(before)
    instance.update!({ ...host, selection: ['name'], readonly: true })
    expect([outline.selection, outline.readonly, outline.allowMove]).toEqual([['name'], true, undefined])
    expect(createOutlinePanel(adapter(), { searchable: false }).create(host).element).toHaveProperty('searchable', false)
  })

  it('树上的选中、标出、删除与挪动转给适配器，用的是最近一次刷新的上下文；同一行不重复标出，撤掉面板时撤掉标出', async () => {
    const log: string[] = []
    const first: Host = { selection: [], readonly: false, log }
    const panel = createOutlinePanel(adapter())
    const instance = panel.create(first)
    const outline = instance.element as Outline
    document.body.append(outline)
    await outline.updateComplete
    const later: Host = { selection: [], readonly: false, log: [] }
    instance.update!(later)
    const send = <K extends keyof DesignerOutlineEventMap>(type: K, detail: DesignerOutlineEventMap[K]['detail']): void => {
      outline.dispatchEvent(new CustomEvent(type, { detail }))
    }
    send('node-select', { ids: ['phone'] })
    send('node-highlight', { id: 'phone' })
    send('node-highlight', { id: 'phone' })
    send('node-delete', { ids: ['logo'] })
    expect(outline.allowMove!({ id: 'phone', parent: 'header', index: 0 })).toBe(false)
    send('node-move', { id: 'phone', parent: 'col-2', index: 0 })
    instance.destroy!()
    expect(later.log).toEqual(['select:phone', 'highlight:phone', 'remove:logo', 'can:phone>header', 'move:phone>col-2@0', 'highlight:null'])
    expect(log).toEqual([])
  })

  it('没给 canMove 就不能挪；canMove 与 move 只给一个时抛 TypeError', () => {
    const { canMove: _canMove, move: _move, ...rest } = adapter()
    const instance = createOutlinePanel(rest).create({ selection: [], readonly: false, log: [] })
    expect((instance.element as Outline).allowMove).toBeUndefined()
    expect(() => createOutlinePanel({ ...rest, move: () => {} })).toThrow(TypeError)
  })
})
