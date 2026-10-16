/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-palette>：物料面板。按分组列出物料，可按名称搜索、分组可折叠。
// 点击、回车、空格或触屏轻点派发 item-activate；按下拖动（触屏长按）经 startDrag 拖向放置目标。

import type { IconRecord } from '@xihan-ui/core'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerPaletteTranslations } from '../translations'
import { createCounterIdGenerator } from '@xihan-ui/core'
import { createAuthoredElement, createGeneratedElement, emitEvent, setText, SVG_NS, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
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
  /** 随 item-activate 与拖动交给设计器的数据。 */
  readonly payload?: unknown
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
    searchable: { type: Boolean },
    collapsible: { type: Boolean },
    readonly: { type: Boolean },
    translations: { attribute: false },
  }

  /** 物料分组。 */
  declare groups: readonly DesignerPaletteGroup[] | undefined
  /** 显示搜索框，按名称过滤。 */
  declare searchable: boolean
  /** 分组可折叠，折叠状态按分组 id 保留；搜索时匹配的分组一律展开。 */
  declare collapsible: boolean
  /** 只读：物料只能浏览，不派发 item-activate、不能拖出。 */
  declare readonly: boolean
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
  #rendered: readonly unknown[] = []
  #suppressClick = false

  constructor() {
    super()
    this.searchable = false
    this.collapsible = false
    this.readonly = false
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#config.translations<DesignerPaletteTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
    setText(parts.title, t.title)
    parts.search.hidden = !this.searchable
    parts.searchInput.setAttribute('aria-label', t.search)
    parts.searchInput.setAttribute('placeholder', t.search)
    const query = this.searchable ? this.#query.trim().toLocaleLowerCase() : ''
    const groups = (this.groups ?? [])
      .map(group => ({ group, items: query === '' ? group.items : group.items.filter(item => item.label.toLocaleLowerCase().includes(query)) }))
      .filter(({ items }) => items.length > 0)
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

  #render(groups: readonly { group: DesignerPaletteGroup, items: readonly DesignerPaletteItem[] }[], searching: boolean): void {
    const parts = this.#parts!
    const focused = this.#focusedId()
    const doc = this.ownerDocument
    const sections = groups.map(({ group, items }) => {
      const list = createAuthoredElement(doc, 'div', { 'data-part': 'group-items' }, items.map(item => this.#item(item)))
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
    if (this.collapsible) {
      const accordion: HTMLElement & { value?: string[] } = createAuthoredElement(doc, 'xh-accordion', { 'multiple': true, 'size': 'sm', 'data-part': 'accordion' }, [
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

  #item(item: DesignerPaletteItem): HTMLElement {
    const doc = this.ownerDocument
    const inert = this.readonly || item.disabled === true
    const children: Node[] = []
    if (item.icon) {
      const svg = doc.createElementNS(SVG_NS, 'svg')
      svg.setAttribute('data-xh-part', 'root')
      const glyph = doc.createElementNS(SVG_NS, 'g')
      glyph.setAttribute('data-xh-part', 'glyph')
      svg.append(glyph)
      const icon: HTMLElement & { icon?: IconRecord } = createAuthoredElement(doc, 'xh-icon', { 'size': 'sm', 'data-part': 'item-icon' }, [svg])
      icon.icon = item.icon
      children.push(icon)
    }
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
    for (const group of this.groups ?? []) {
      const item = group.items.find(entry => entry.id === id)
      if (item)
        return item
    }
    return undefined
  }

  readonly #onPointerDown = (event: PointerEvent): void => {
    this.#suppressClick = false
    const element = this.#itemOf(event)
    if (!element || !event.isPrimary || event.button !== 0 || element.getAttribute('aria-disabled') === 'true')
      return
    const item = this.#find(element.dataset.id!)
    if (!item)
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
    if (element.getAttribute('aria-disabled') === 'true')
      return
    const item = this.#find(element.dataset.id!)
    if (item)
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
