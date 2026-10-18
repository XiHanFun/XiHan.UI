/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-palette>：物料面板。按分组列出物料，可按名称与说明搜索、分组可折叠；有条目带下级时这一组按树显示。
// 点击、回车、空格或触屏轻点派发 item-activate；按下拖动（触屏长按）经 startDrag 拖向放置目标。

import type { IconRecord } from '@xihan-ui/core'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerPaletteTranslations } from '../translations'
import { createCounterIdGenerator } from '@xihan-ui/core'
import { BOOLEAN_CONVERTER, createAuthoredElement, createGeneratedElement, emitEvent, setText, SVG_NS, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { startDrag } from '../drag/drag'
import { definePaletteElements } from '../internal/ui-elements'

/** 一个物料。 */
export interface DesignerPaletteItem {
  /** 物料 id，在整个面板内唯一。 */
  readonly id: string
  readonly label: string
  readonly icon?: IconRecord
  /** 名称下方的一行说明。 */
  readonly description?: string
  readonly disabled?: boolean
  /**
   * 只作浏览：照常显示，能用方向键走到、能展开下级，但不派发 item-activate、不能拖出。
   * 只用来分组的上级条目、只供查看的下级写它；用不了的条目写 disabled。
   */
  readonly browseOnly?: boolean
  /** 随 item-activate 与拖动交给设计器的数据。 */
  readonly payload?: unknown
  /**
   * 下级物料。组里有条目带了它时，这一组按树显示：带下级的条目可以展开、收起，展开状态按条目 id 保留，
   * 键盘与读屏按树的约定（上下键在可见的条目间移动，左右键收起、展开）；下级与上级一样可以激活、拖出。
   */
  readonly children?: readonly DesignerPaletteItem[]
}

/** 一组物料。 */
export interface DesignerPaletteGroup {
  readonly id: string
  readonly label: string
  readonly items: readonly DesignerPaletteItem[]
}

/** 从物料面板拖出时交给放置目标的数据。 */
export interface DesignerPaletteDragPayload {
  readonly source: 'palette'
  readonly id: string
  readonly payload: unknown
}

/** 物料面板派发的事件。 */
export interface DesignerPaletteEventMap {
  'item-activate': CustomEvent<{ id: string, payload: unknown }>
}

const DEFAULT_TRANSLATIONS: DesignerPaletteTranslations = {
  title: 'Elements',
  search: 'Search elements',
  noMatches: 'No matching elements',
  empty: 'No elements',
}

const TAG = 'xh-designer-palette'

/** 一组里要显示的条目，以及搜索时要展开的上级。 */
interface Shown {
  readonly items: readonly DesignerPaletteItem[]
  readonly reveal: ReadonlySet<string>
}

function matches(item: DesignerPaletteItem, query: string): boolean {
  return item.label.toLocaleLowerCase().includes(query) || (item.description?.toLocaleLowerCase().includes(query) ?? false)
}

/** 按搜索词留下命中的条目（连同它的全部下级）与命中条目的上级；上级记进 reveal 以便展开。 */
function filterItems(items: readonly DesignerPaletteItem[], query: string, reveal: Set<string>): DesignerPaletteItem[] {
  const kept: DesignerPaletteItem[] = []
  for (const item of items) {
    if (matches(item, query)) {
      kept.push(item)
      continue
    }
    const children = filterItems(item.children ?? [], query, reveal)
    if (children.length > 0) {
      reveal.add(item.id)
      kept.push({ ...item, children })
    }
  }
  return kept
}

function hierarchical(items: readonly DesignerPaletteItem[]): boolean {
  return items.some(item => item.children !== undefined)
}

/** <xh-tree> 的节点数据里用到的几项。 */
interface PaletteTreeNode {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
  readonly description?: string
  readonly children?: PaletteTreeNode[]
}

/** 按组显示的树：节点数据、受控的选中与展开集合。 */
type PaletteTree = HTMLElement & { collection?: PaletteTreeNode[], selection?: string[], expandedValue?: string[] }

/** 树的节点数据：与标记同源，层级与禁用由它报给读屏。 */
function treeNodes(items: readonly DesignerPaletteItem[]): PaletteTreeNode[] {
  return items.map(item => ({
    value: item.id,
    label: item.label,
    ...(item.disabled === true ? { disabled: true } : {}),
    ...(item.description === undefined ? {} : { description: item.description }),
    ...(item.children === undefined ? {} : { children: treeNodes(item.children) }),
  }))
}

interface Parts {
  readonly header: HTMLElement
  readonly title: HTMLElement
  readonly search: HTMLElement & { value?: string }
  readonly searchInput: HTMLInputElement
  readonly body: HTMLElement
  readonly empty: HTMLElement
}

export class XhDesignerPaletteElement extends XhReactiveElement {
  static override properties = {
    groups: { attribute: false },
    searchable: { converter: BOOLEAN_CONVERTER },
    collapsible: { converter: BOOLEAN_CONVERTER },
    readonly: { converter: BOOLEAN_CONVERTER },
    headless: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  /** 物料分组。 */
  declare groups: readonly DesignerPaletteGroup[] | undefined
  /** 显示搜索框，按名称与说明过滤；命中的条目连同它的上级一起展开显示。 */
  declare searchable?: boolean
  /** 分组可折叠，折叠状态按分组 id 保留；搜索时匹配的分组一律展开。 */
  declare collapsible?: boolean
  /** 只读：物料只能浏览，不派发 item-activate、不能拖出。 */
  declare readonly?: boolean
  /** 放进外框的卡片时写上：不画自己的标题，标题由外框的面板头显示，仍作正文的可访问名。 */
  declare headless?: boolean
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerPaletteTranslations> | undefined

  /** 注册面板用到的库内元素。 */
  static defineDependencies(): void {
    definePaletteElements()
  }

  readonly #config = new XhConfigController(this)
  readonly #ids = createCounterIdGenerator('xh-designer-palette')
  #parts: Parts | undefined
  #query = ''
  #collapsed = new Set<string>()
  /** 树里展开着的条目 id；搜索时另按命中的条目展开，不改它。 */
  #expanded = new Set<string>()
  #rendered: readonly unknown[] = []
  #suppressClick = false

  constructor() {
    super()
    this.searchable = false
    this.collapsible = false
    this.readonly = false
    this.headless = false
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#config.translations<DesignerPaletteTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
    setText(parts.title, t.title)
    parts.title.hidden = this.headless === true
    parts.search.hidden = !this.searchable
    parts.header.hidden = this.headless === true && !this.searchable
    parts.searchInput.setAttribute('aria-label', t.search)
    parts.searchInput.setAttribute('placeholder', t.search)
    const query = this.searchable ? this.#query.trim().toLocaleLowerCase() : ''
    const groups = (this.groups ?? [])
      .map((group) => {
        const reveal = new Set<string>()
        return { group, shown: { items: query === '' ? group.items : filterItems(group.items, query, reveal), reveal } }
      })
      .filter(({ shown }) => shown.items.length > 0)
    setText(parts.empty, query === '' ? t.empty : t.noMatches)
    parts.empty.hidden = groups.length > 0
    const inputs = [this.groups, query, this.collapsible, this.readonly]
    if (inputs.length === this.#rendered.length && inputs.every((input, index) => input === this.#rendered[index]))
      return
    this.#rendered = inputs
    this.#render(groups, query !== '')
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
    const body = createGeneratedElement(doc, 'div', { 'data-part': 'body', 'role': 'region', 'aria-labelledby': title.id })
    const empty = createGeneratedElement(doc, 'p', { 'data-part': 'empty' })
    body.addEventListener('pointerdown', this.#onPointerDown)
    body.addEventListener('click', this.#onClick)
    body.addEventListener('keydown', this.#onKeyDown)
    this.prepend(header, body, empty)
    this.#parts = { header, title, search, searchInput, body, empty }
    this.#rendered = []
    return this.#parts
  }

  #render(groups: readonly { group: DesignerPaletteGroup, shown: Shown }[], searching: boolean): void {
    const parts = this.#parts!
    const focused = this.#focusedId()
    const doc = this.ownerDocument
    const sections = groups.map(({ group, shown }) => {
      const list = hierarchical(group.items)
        ? this.#tree(group, shown, searching)
        : createAuthoredElement(doc, 'div', { 'data-part': 'group-items' }, shown.items.map(item => this.#item(item)))
      if (this.collapsible) {
        return createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'value': group.id }, [
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'header' }, [
            createAuthoredElement(doc, 'button', { 'data-xh-part': 'trigger', 'type': 'button' }, [
              createAuthoredElement(doc, 'span', { 'data-part': 'group-label' }, [group.label]),
              createAuthoredElement(doc, 'span', { 'data-xh-part': 'indicator' }),
            ]),
          ]),
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [list]),
        ])
      }
      const label = createAuthoredElement(doc, 'div', { 'data-part': 'group-label', 'id': this.#ids.scopeId() }, [group.label])
      return createAuthoredElement(doc, 'div', { 'data-part': 'group', 'role': 'group', 'aria-labelledby': label.id }, [label, list])
    })
    // 一个分组都没有时不建空的手风琴
    if (this.collapsible && sections.length > 0) {
      const accordion: HTMLElement & { value?: string[] } = createAuthoredElement(doc, 'xh-accordion', { 'multiple': true, 'size': 'sm', 'content-role': 'group', 'data-part': 'accordion' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, sections),
      ])
      accordion.value = groups.map(({ group }) => group.id).filter(id => searching || !this.#collapsed.has(id))
      accordion.addEventListener('value-change', (event) => {
        event.stopPropagation()
        const open = (event as CustomEvent<{ value: string[] }>).detail.value
        accordion.value = open
        if (searching)
          return
        for (const { group } of groups) {
          if (open.includes(group.id))
            this.#collapsed.delete(group.id)
          else
            this.#collapsed.add(group.id)
        }
      })
      parts.body.replaceChildren(accordion)
    }
    else {
      parts.body.replaceChildren(...sections)
    }
    this.#rove(focused, focused !== undefined)
  }

  #icon(item: DesignerPaletteItem): HTMLElement[] {
    if (!item.icon)
      return []
    const doc = this.ownerDocument
    const svg = doc.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('data-xh-part', 'root')
    const glyph = doc.createElementNS(SVG_NS, 'g')
    glyph.setAttribute('data-xh-part', 'glyph')
    svg.append(glyph)
    const icon: HTMLElement & { icon?: IconRecord } = createAuthoredElement(doc, 'xh-icon', { 'size': 'sm', 'data-part': 'item-icon' }, [svg])
    icon.icon = item.icon
    return [icon]
  }

  /** 条目不派发 item-activate、不能拖出：只读、禁用或只作浏览。 */
  #inert(item: DesignerPaletteItem): boolean {
    return this.readonly === true || item.disabled === true || item.browseOnly === true
  }

  /** 带下级的一组：一棵 <xh-tree>，选中集合受控为空，点选与确认键当作激活；展开集合按条目 id 保留。 */
  #tree(group: DesignerPaletteGroup, shown: Shown, searching: boolean): HTMLElement {
    const doc = this.ownerDocument
    const tree: PaletteTree = createAuthoredElement(doc, 'xh-tree', { 'size': 'sm', 'data-part': 'group-tree' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'tree', 'aria-label': group.label }, shown.items.map(item => this.#node(item))),
      ]),
    ])
    tree.collection = treeNodes(shown.items)
    tree.selection = []
    tree.expandedValue = searching ? [...shown.reveal] : [...this.#expanded]
    tree.addEventListener('selection-change', (event) => {
      event.stopPropagation()
      const id = (event as CustomEvent<{ value: string[] }>).detail.value[0]
      if (this.#suppressClick) {
        this.#suppressClick = false
        return
      }
      const item = id === undefined ? undefined : this.#find(id)
      if (item && !this.#inert(item))
        emitEvent(this, 'item-activate', { id: item.id, payload: item.payload })
    })
    tree.addEventListener('expanded-value-change', (event) => {
      event.stopPropagation()
      const open = (event as CustomEvent<{ value: string[] }>).detail.value
      tree.expandedValue = open
      if (searching)
        return
      const walk = (items: readonly DesignerPaletteItem[]): void => {
        for (const item of items) {
          if (open.includes(item.id))
            this.#expanded.add(item.id)
          else
            this.#expanded.delete(item.id)
          walk(item.children ?? [])
        }
      }
      walk(shown.items)
    })
    return tree
  }

  /** 树里的一个条目：没有下级的是 item，有下级的是 branch；行上带 data-id 供拖动认领。 */
  #node(item: DesignerPaletteItem): HTMLElement {
    const doc = this.ownerDocument
    const browse = item.browseOnly === true ? '' : undefined
    if (item.children === undefined) {
      return createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'value': item.id, 'data-id': item.id, 'data-browse-only': browse }, [
        ...this.#icon(item),
        createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-text' }, [item.label]),
        ...(item.description === undefined ? [] : [createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-description' }, [item.description])]),
      ])
    }
    return createAuthoredElement(doc, 'div', { 'data-xh-part': 'branch', 'value': item.id }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'branch-control', 'data-id': item.id, 'data-browse-only': browse }, [
        createAuthoredElement(doc, 'span', { 'data-xh-part': 'branch-trigger' }, [createAuthoredElement(doc, 'span', { 'data-xh-part': 'branch-indicator' })]),
        ...this.#icon(item),
        createAuthoredElement(doc, 'span', { 'data-xh-part': 'branch-text' }, [item.label]),
        ...(item.description === undefined ? [] : [createAuthoredElement(doc, 'span', { 'data-part': 'branch-description', 'data-xh-collection-slot': 'description' }, [item.description])]),
      ]),
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'branch-content' }, item.children.map(child => this.#node(child))),
    ])
  }

  #item(item: DesignerPaletteItem): HTMLElement {
    const doc = this.ownerDocument
    const inert = this.readonly === true || item.disabled === true
    const children: Node[] = [...this.#icon(item)]
    children.push(createAuthoredElement(doc, 'span', { 'data-part': 'item-label' }, [item.label]))
    let describedBy: string | undefined
    if (item.description !== undefined) {
      describedBy = this.#ids.scopeId()
      children.push(createAuthoredElement(doc, 'span', { 'data-part': 'item-description', 'id': describedBy }, [item.description]))
    }
    return createAuthoredElement(doc, 'button', {
      'data-part': 'item',
      'data-id': item.id,
      'type': 'button',
      'tabindex': -1,
      'aria-disabled': inert ? 'true' : undefined,
      'aria-describedby': describedBy,
      'data-browse-only': item.browseOnly === true ? '' : undefined,
    }, children)
  }

  #items(): HTMLButtonElement[] {
    return Array.from(this.#parts?.body.querySelectorAll<HTMLButtonElement>('button[data-part="item"]') ?? [])
      .filter(item => item.closest('[data-xh-part="content"]')?.getAttribute('data-state') !== 'closed')
  }

  #focusedId(): string | undefined {
    const active = this.ownerDocument.activeElement
    return active instanceof HTMLElement && this.#parts?.body.contains(active) ? active.dataset.id : undefined
  }

  /** 把 Tab 位放到该物料上（找不到时放第一个），focus 为真时同时移入焦点。 */
  #rove(id: string | undefined, focus: boolean): void {
    const items = this.#items()
    const target = items.find(item => item.dataset.id === id) ?? items[0]
    for (const item of this.#parts?.body.querySelectorAll<HTMLButtonElement>('button[data-part="item"]') ?? [])
      item.tabIndex = item === target ? 0 : -1
    if (focus)
      target?.focus()
  }

  #itemOf(event: Event): HTMLButtonElement | undefined {
    const item = (event.target as Element | null)?.closest<HTMLButtonElement>('button[data-part="item"]')
    return item && this.#parts?.body.contains(item) ? item : undefined
  }

  #find(id: string): DesignerPaletteItem | undefined {
    const search = (items: readonly DesignerPaletteItem[]): DesignerPaletteItem | undefined => {
      for (const item of items) {
        const found = item.id === id ? item : search(item.children ?? [])
        if (found)
          return found
      }
      return undefined
    }
    for (const group of this.groups ?? []) {
      const item = search(group.items)
      if (item)
        return item
    }
    return undefined
  }

  /** 按下的条目行：按钮或树里带 data-id 的行；展开箭头不算。 */
  #rowOf(event: Event): HTMLElement | undefined {
    const target = event.target as Element | null
    if (target?.closest('[data-scope="tree"][data-part="branch-trigger"]'))
      return undefined
    const row = target?.closest<HTMLElement>('button[data-part="item"], [data-scope="tree"][data-id]')
    return row && this.#parts?.body.contains(row) ? row : undefined
  }

  readonly #onPointerDown = (event: PointerEvent): void => {
    this.#suppressClick = false
    const element = this.#rowOf(event)
    if (!element || !event.isPrimary || event.button !== 0)
      return
    const item = this.#find(element.dataset.id!)
    if (!item || this.#inert(item))
      return
    startDrag<DesignerPaletteDragPayload>(event, {
      source: element,
      payload: { source: 'palette', id: item.id, payload: item.payload },
      onEnd: ({ dragged }) => {
        this.#suppressClick = dragged
      },
    })
  }

  readonly #onClick = (event: MouseEvent): void => {
    const element = this.#itemOf(event)
    if (!element)
      return
    this.#rove(element.dataset.id, false)
    if (this.#suppressClick) {
      this.#suppressClick = false
      return
    }
    const item = this.#find(element.dataset.id!)
    if (item && !this.#inert(item))
      emitEvent(this, 'item-activate', { id: item.id, payload: item.payload })
  }

  readonly #onKeyDown = (event: KeyboardEvent): void => {
    const element = this.#itemOf(event)
    if (!element)
      return
    const items = this.#items()
    const index = items.indexOf(element)
    const rtl = this.ownerDocument.defaultView?.getComputedStyle(this).direction === 'rtl'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft'
    let next: number
    switch (event.key) {
      case 'ArrowDown':
      case forward:
        next = Math.min(items.length - 1, index + 1)
        break
      case 'ArrowUp':
      case backward:
        next = Math.max(0, index - 1)
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = items.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    this.#rove(items[next]?.dataset.id, true)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-palette': XhDesignerPaletteElement
  }
}
