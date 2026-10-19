/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-outline>：页面结构。按树列出模板里的内容，选中、标出、删除与挪动都派发事件，由设计器翻成自己的操作；
// 选中集合受控，展开状态按节点 id 保留，键盘与读屏照 xh-tree 的约定。

import type { IconRecord } from '@xihan-ui/core'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerOutlineTranslations } from '../translations'
import { createCounterIdGenerator } from '@xihan-ui/core'
import { BOOLEAN_CONVERTER, createAuthoredElement, createGeneratedElement, emitEvent, setText, SVG_NS, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { defineOutlineElements } from '../internal/ui-elements'

/** 页面结构里的一行。 */
export interface DesignerOutlineNode {
  /** 节点 id，在整棵树里唯一。 */
  readonly id: string
  /** 显示的名字，已按语言取好。 */
  readonly label: string
  /** 名字下方的一行副文本，如种类名、数据键。 */
  readonly description?: string
  readonly icon?: IconRecord
  /** 下一层；有数组就是分支（空数组也能放进东西），没有就是叶子。 */
  readonly children?: readonly DesignerOutlineNode[]
  /** 分支第一次出现时展不展开，缺省 true；false 的先收起，之后随用户展开收起，选中它下面的行时照样展开。 */
  readonly expanded?: boolean
  /** 缺省 true。false 的行只作分组：点了只展开收起，不派发 node-select。 */
  readonly selectable?: boolean
  /** 缺省 true。false 的行自己不能挪：按住拖不起来，Alt + 方向键也挪不动；仍能当落点。 */
  readonly movable?: boolean
  /** 缺省 true。false 的行没有删除钮，Delete 不删它。 */
  readonly deletable?: boolean
}

/** 一次挪动：把 id 挪到 parent（null 为顶层）下第 index 位，0 起，已按先摘后插修正。 */
export interface DesignerOutlineMove {
  readonly id: string
  readonly parent: string | null
  readonly index: number
}

/** 页面结构派发的事件。 */
export interface DesignerOutlineEventMap {
  /** 用户在树上选了这些行；选中集合受控，元素不自己改。 */
  'node-select': CustomEvent<{ ids: string[] }>
  /** 悬停或焦点所在的行变了；离开整棵树时为 null。 */
  'node-highlight': CustomEvent<{ id: string | null }>
  /** 按了删除钮或 Delete / Backspace。 */
  'node-delete': CustomEvent<{ ids: string[] }>
  /** 拖动或 Alt + 方向键挪了一行，已经过 allowMove 判定。 */
  'node-move': CustomEvent<DesignerOutlineMove>
}

const DEFAULT_TRANSLATIONS: DesignerOutlineTranslations = {
  title: 'Structure',
  help: 'Everything in the template as a tree. Choose an item to select it on the canvas; drag it, or press Alt with an arrow key, to move it.',
  search: 'Search structure',
  noMatches: 'No matching items',
  empty: 'Nothing here yet',
  remove: label => `Delete ${label}`,
}

const TAG = 'xh-designer-outline'

/** 行：叶子是 item，分支的可点那一行是 branch-control；两者都带 data-id。 */
const ROW_SELECTOR = '[data-scope="tree"][data-id]'

/** <xh-tree> 的节点数据里用到的几项。 */
interface OutlineTreeNode {
  readonly value: string
  readonly label: string
  readonly description?: string
  /** false 时这一行拖不起来，仍能当落点。 */
  readonly draggable?: false
  readonly children?: OutlineTreeNode[]
}

/** 树上受控的数据、选中、展开、拖动与落点判定。 */
type OutlineTree = HTMLElement & {
  collection?: OutlineTreeNode[]
  selection?: string[]
  expandedValue?: string[]
  nodeDraggable?: boolean
  allowDrop?: (move: { value: string, parent: string | null, index: number }) => boolean
}

interface Parts {
  readonly header: HTMLElement
  readonly title: HTMLElement
  readonly search: HTMLElement & { value?: string }
  readonly searchInput: HTMLInputElement
  readonly body: HTMLElement
  readonly empty: HTMLElement
}

function matches(node: DesignerOutlineNode, query: string): boolean {
  return node.label.toLocaleLowerCase().includes(query) || (node.description?.toLocaleLowerCase().includes(query) ?? false)
}

/** 按搜索词留下命中的节点（连同它的全部下级）与命中节点的上级。 */
function filterNodes(nodes: readonly DesignerOutlineNode[], query: string): DesignerOutlineNode[] {
  const kept: DesignerOutlineNode[] = []
  for (const node of nodes) {
    if (matches(node, query)) {
      kept.push(node)
      continue
    }
    const children = filterNodes(node.children ?? [], query)
    if (children.length > 0)
      kept.push({ ...node, children })
  }
  return kept
}

function treeNodes(nodes: readonly DesignerOutlineNode[]): OutlineTreeNode[] {
  return nodes.map(node => ({
    value: node.id,
    label: node.label,
    ...(node.description === undefined ? {} : { description: node.description }),
    ...(node.movable === false ? { draggable: false as const } : {}),
    ...(node.children === undefined ? {} : { children: treeNodes(node.children) }),
  }))
}

/** 全部分支的 id。 */
function branchIds(nodes: readonly DesignerOutlineNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children === undefined)
      continue
    out.push(node.id)
    branchIds(node.children, out)
  }
  return out
}

/** 节点 id 到节点与它的上级链。 */
function indexNodes(nodes: readonly DesignerOutlineNode[], parents: readonly string[] = [], out = new Map<string, { node: DesignerOutlineNode, parents: readonly string[] }>()): Map<string, { node: DesignerOutlineNode, parents: readonly string[] }> {
  for (const node of nodes) {
    out.set(node.id, { node, parents })
    if (node.children !== undefined)
      indexNodes(node.children, [...parents, node.id], out)
  }
  return out
}

export class XhDesignerOutlineElement extends XhReactiveElement {
  static override properties = {
    nodes: { attribute: false },
    selection: { attribute: false },
    allowMove: { attribute: false },
    searchable: { converter: BOOLEAN_CONVERTER },
    readonly: { converter: BOOLEAN_CONVERTER },
    headless: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  /** 整棵树。 */
  declare nodes: readonly DesignerOutlineNode[] | undefined
  /** 选中的行 id；受控，设计器的选择变了就换上新值。 */
  declare selection: readonly string[] | undefined
  /** 一次挪动许不许；不给就不能拖。movable 为 false 的行先被拦下，不问它。 */
  declare allowMove: ((move: DesignerOutlineMove) => boolean) | undefined
  /** 显示搜索框，按名字与副文本过滤；命中的行连同上级一起展开显示，过滤时不能拖。 */
  declare searchable?: boolean
  /** 只读：能选、能标出，不能删、不能挪。 */
  declare readonly?: boolean
  /** 放进外框的卡片时写上：不画自己的标题，标题由外框的面板头显示，仍给树命名。 */
  declare headless?: boolean
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerOutlineTranslations> | undefined

  /** 注册页面结构用到的库内元素。 */
  static defineDependencies(): void {
    defineOutlineElements()
  }

  readonly #config = new XhConfigController(this)
  readonly #ids = createCounterIdGenerator('xh-designer-outline')
  #parts: Parts | undefined
  #query = ''
  /** 收起的分支 id；没记的分支缺省展开。 */
  readonly #collapsed = new Set<string>()
  /** 出现过的分支 id：expanded 为 false 的只在第一次出现时收起。 */
  readonly #seen = new Set<string>()
  #index = new Map<string, { node: DesignerOutlineNode, parents: readonly string[] }>()
  #tree: OutlineTree | undefined
  #rendered: readonly unknown[] = []
  /** 最近一次派发的标出；null 为没有。 */
  #highlighted: string | null = null
  /** 指针悬停的行与焦点所在的行；指针离开时退回焦点所在的行。 */
  #hovered: string | null = null
  #focused: string | null = null

  constructor() {
    super()
    this.searchable = false
    this.readonly = false
    this.headless = false
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#translations()
    setText(parts.title, t.title)
    parts.title.hidden = this.headless === true
    parts.search.hidden = !this.searchable
    parts.header.hidden = this.headless === true && !this.searchable
    parts.searchInput.setAttribute('aria-label', t.search)
    parts.searchInput.setAttribute('placeholder', t.search)
    const nodes = this.nodes ?? []
    this.#index = indexNodes(nodes)
    for (const [id, { node }] of this.#index) {
      if (node.children === undefined || this.#seen.has(id))
        continue
      this.#seen.add(id)
      if (node.expanded === false)
        this.#collapsed.add(id)
    }
    const selection = this.#selection()
    if (changed.has('selection')) {
      for (const id of selection) {
        for (const parent of this.#index.get(id)?.parents ?? [])
          this.#collapsed.delete(parent)
      }
    }
    const query = this.searchable ? this.#query.trim().toLocaleLowerCase() : ''
    const shown = query === '' ? nodes : filterNodes(nodes, query)
    setText(parts.empty, query === '' ? t.empty : t.noMatches)
    parts.empty.hidden = shown.length > 0
    const inputs = [shown, this.readonly, t.remove]
    if (inputs.length !== this.#rendered.length || inputs.some((input, index) => input !== this.#rendered[index])) {
      this.#rendered = inputs
      this.#render(shown, t)
    }
    const tree = this.#tree
    if (tree === undefined)
      return
    tree.selection = selection.slice(0, 1)
    tree.expandedValue = query === '' ? branchIds(shown).filter(id => !this.#collapsed.has(id)) : branchIds(shown)
    tree.nodeDraggable = this.allowMove !== undefined && this.readonly !== true && query === ''
    if (changed.has('selection') && selection[0] !== undefined)
      void this.updateComplete.then(() => this.#row(selection[0]!)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }))
  }

  #translations(): DesignerOutlineTranslations {
    return this.#config.translations<DesignerOutlineTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
  }

  /** 受控的选中里还在树上、能选的那些。 */
  #selection(): string[] {
    return (this.selection ?? []).filter(id => this.#index.get(id)?.node.selectable !== false && this.#index.has(id))
  }

  #ensureParts(): Parts {
    if (this.#parts?.header.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const title = createAuthoredElement(doc, 'span', { 'data-part': 'title', 'id': this.#ids.scopeId() })
    const searchInput = createAuthoredElement(doc, 'input', { 'data-xh-part': 'input' })
    const search: Parts['search'] = createAuthoredElement(doc, 'xh-text-field', { 'type': 'search', 'clearable': true, 'size': 'sm', 'data-part': 'search' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [
          searchInput,
          createAuthoredElement(doc, 'button', { 'data-xh-part': 'clear-trigger', 'type': 'button' }),
        ]),
      ]),
    ])
    search.addEventListener('value-change', (event) => {
      event.stopPropagation()
      const { value } = (event as CustomEvent<{ value: string }>).detail
      search.value = value
      this.#query = value
      this.requestUpdate()
    })
    const header = createGeneratedElement(doc, 'div', { 'data-part': 'header' }, [title, search])
    const body = createGeneratedElement(doc, 'div', { 'data-part': 'body' })
    // 树的宿主不占盒，指针离开整棵树按正文这一层算
    body.addEventListener('pointerover', this.#onPointerOver)
    body.addEventListener('pointerleave', this.#onPointerLeave)
    const empty = createGeneratedElement(doc, 'div', { 'data-part': 'empty' })
    this.prepend(header, body, empty)
    this.#parts = { header, title, search, searchInput, body, empty }
    this.#rendered = []
    return this.#parts
  }

  /** 整棵树重新铺一遍；焦点原在树里的，回到同一 id 的行上。 */
  #render(nodes: readonly DesignerOutlineNode[], t: DesignerOutlineTranslations): void {
    const parts = this.#parts!
    const doc = this.ownerDocument
    const active = doc.activeElement
    const focused = active instanceof HTMLElement && this.#tree?.contains(active) ? active.closest('[role="treeitem"]')?.getAttribute('value') ?? undefined : undefined
    if (nodes.length === 0) {
      this.#tree = undefined
      parts.body.replaceChildren()
      return
    }
    const tree: OutlineTree = createAuthoredElement(doc, 'xh-tree', { 'size': 'sm', 'variant': 'ghost', 'data-part': 'tree' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'tree', 'aria-labelledby': parts.title.id }, nodes.map(node => this.#node(node, t))),
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'live-region' }),
      ]),
    ])
    tree.collection = treeNodes(nodes)
    tree.allowDrop = (move) => {
      const found = this.#index.get(move.value)
      return found !== undefined && found.node.movable !== false && (this.allowMove?.({ id: move.value, parent: move.parent, index: move.index }) ?? false)
    }
    tree.addEventListener('selection-change', this.#onSelectionChange)
    tree.addEventListener('expanded-value-change', this.#onExpandedChange)
    tree.addEventListener('node-move', this.#onNodeMove)
    tree.addEventListener('focusin', this.#onFocusIn)
    tree.addEventListener('focusout', this.#onFocusOut)
    tree.addEventListener('keydown', this.#onKeyDown)
    this.#tree = tree
    parts.body.replaceChildren(tree)
    if (focused !== undefined)
      void this.updateComplete.then(() => this.#treeitem(focused)?.focus())
  }

  #icon(node: DesignerOutlineNode): HTMLElement[] {
    if (!node.icon)
      return []
    const doc = this.ownerDocument
    const svg = doc.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('data-xh-part', 'root')
    const glyph = doc.createElementNS(SVG_NS, 'g')
    glyph.setAttribute('data-xh-part', 'glyph')
    svg.append(glyph)
    const icon: HTMLElement & { icon?: IconRecord } = createAuthoredElement(doc, 'xh-icon', { 'size': 'sm', 'data-part': 'node-icon' }, [svg])
    icon.icon = node.icon
    return [icon]
  }

  /** 行尾的删除钮：只接指针，对读屏隐藏、不占 Tab 位，键盘与读屏用 Delete。 */
  #deleteTrigger(node: DesignerOutlineNode, t: DesignerOutlineTranslations): HTMLElement[] {
    if (this.readonly === true || node.deletable === false)
      return []
    const trigger = createAuthoredElement(this.ownerDocument, 'button', { 'type': 'button', 'data-part': 'delete-trigger', 'tabindex': -1, 'aria-hidden': 'true', 'aria-label': t.remove(node.label) })
    // 按下不夺焦点：这颗钮对读屏隐藏，焦点不该停在它上面
    trigger.addEventListener('mousedown', event => event.preventDefault())
    trigger.addEventListener('click', (event) => {
      event.stopPropagation()
      emitEvent(this, 'node-delete', { ids: [node.id] })
    })
    return [trigger]
  }

  /** 一行：没有下级的是 item，有下级的是 branch；行上带 data-id 供悬停认领。 */
  #node(node: DesignerOutlineNode, t: DesignerOutlineTranslations): HTMLElement {
    const doc = this.ownerDocument
    if (node.children === undefined) {
      return createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'value': node.id, 'data-id': node.id }, [
        ...this.#icon(node),
        createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-text' }, [node.label]),
        ...(node.description === undefined ? [] : [createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-description' }, [node.description])]),
        ...this.#deleteTrigger(node, t),
        createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-indicator' }),
      ])
    }
    return createAuthoredElement(doc, 'div', { 'data-xh-part': 'branch', 'value': node.id }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'branch-control', 'data-id': node.id }, [
        createAuthoredElement(doc, 'span', { 'data-xh-part': 'branch-trigger' }),
        ...this.#icon(node),
        createAuthoredElement(doc, 'span', { 'data-xh-part': 'branch-text' }, [node.label]),
        ...(node.description === undefined ? [] : [createAuthoredElement(doc, 'span', { 'data-xh-part': 'branch-description' }, [node.description])]),
        ...this.#deleteTrigger(node, t),
        createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-indicator' }),
      ]),
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'branch-content' }, node.children.map(child => this.#node(child, t))),
    ])
  }

  #row(id: string): HTMLElement | null {
    return [...this.#tree?.querySelectorAll<HTMLElement>(ROW_SELECTOR) ?? []].find(row => row.dataset.id === id) ?? null
  }

  #treeitem(id: string): HTMLElement | null {
    return [...this.#tree?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []].find(item => item.getAttribute('value') === id) ?? null
  }

  /** 标出这一行；与上次相同时不再派发。 */
  #highlight(id: string | null): void {
    if (id === this.#highlighted)
      return
    this.#highlighted = id
    emitEvent(this, 'node-highlight', { id })
  }

  readonly #onSelectionChange = (event: Event): void => {
    event.stopPropagation()
    const id = (event as CustomEvent<{ value: string[] }>).detail.value[0]
    const found = id === undefined ? undefined : this.#index.get(id)
    // 选中受控：树上的选中换回设计器给的，等设计器换上新值
    this.#tree!.selection = this.#selection().slice(0, 1)
    if (found === undefined)
      return
    if (found.node.selectable === false) {
      if (found.node.children !== undefined) {
        if (this.#collapsed.has(found.node.id))
          this.#collapsed.delete(found.node.id)
        else
          this.#collapsed.add(found.node.id)
        this.requestUpdate()
      }
      return
    }
    emitEvent(this, 'node-select', { ids: [found.node.id] })
  }

  readonly #onExpandedChange = (event: Event): void => {
    event.stopPropagation()
    const open = new Set((event as CustomEvent<{ value: string[] }>).detail.value)
    if (this.#query.trim() === '' || !this.searchable) {
      for (const id of branchIds(this.nodes ?? [])) {
        if (open.has(id))
          this.#collapsed.delete(id)
        else
          this.#collapsed.add(id)
      }
    }
    this.requestUpdate()
  }

  readonly #onNodeMove = (event: Event): void => {
    event.stopPropagation()
    const { value, parent, index } = (event as CustomEvent<{ value: string, parent: string | null, index: number }>).detail
    emitEvent(this, 'node-move', { id: value, parent, index })
  }

  readonly #onPointerOver = (event: PointerEvent): void => {
    const row = (event.target as Element | null)?.closest<HTMLElement>(ROW_SELECTOR)
    this.#hovered = row?.dataset.id ?? null
    this.#highlight(this.#hovered ?? this.#focused)
  }

  readonly #onPointerLeave = (): void => {
    this.#hovered = null
    this.#highlight(this.#focused)
  }

  readonly #onFocusIn = (event: FocusEvent): void => {
    this.#focused = (event.target as Element | null)?.closest('[role="treeitem"]')?.getAttribute('value') ?? null
    this.#highlight(this.#hovered ?? this.#focused)
  }

  readonly #onFocusOut = (event: FocusEvent): void => {
    if (this.#tree?.contains(event.relatedTarget as Node | null))
      return
    this.#focused = null
    this.#highlight(this.#hovered)
  }

  readonly #onKeyDown = (event: KeyboardEvent): void => {
    if ((event.key !== 'Delete' && event.key !== 'Backspace') || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || this.readonly === true)
      return
    const id = (event.target as Element | null)?.closest('[role="treeitem"]')?.getAttribute('value')
    if (id == null || (event.target as Element).closest('input, textarea, [contenteditable]'))
      return
    const selection = this.#selection()
    const ids = (selection.includes(id) ? selection : [id]).filter(item => this.#index.get(item)?.node.deletable !== false)
    if (ids.length === 0)
      return
    event.preventDefault()
    emitEvent(this, 'node-delete', { ids })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-outline': XhDesignerOutlineElement
  }
}
