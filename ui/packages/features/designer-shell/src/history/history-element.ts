/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-history>：历史记录。按先后列出起点与各步，当前位置那一行选中；选一行派发 history-go，由设计器跳到那一步。
// 快照由设计器用 designer-kit 的 snapshotHistory 取好交进来（说明已按语言取成字符串），换语言时重交；零件不碰历史栈。

import type { HistorySnapshot } from '@xihan-ui/designer-kit'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerHistoryTranslations } from '../translations'
import { createCounterIdGenerator } from '@xihan-ui/core'
import { BOOLEAN_CONVERTER, createAuthoredElement, createGeneratedElement, emitEvent, setAttributes, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { defineHistoryElements } from '../internal/ui-elements'

/** 历史记录派发的事件。 */
export interface DesignerHistoryEventMap {
  /** 用户选了起点或某一步：position 是要回到的位置号（HistorySnapshot 里的 origin 或某一步的 position）。 */
  'history-go': CustomEvent<{ position: number }>
  /** 用户按了零件头部的清空钮；设计器转给 clear-history 命令，先确认再清空。 */
  'history-clear': CustomEvent<Record<string, never>>
}

const DEFAULT_TRANSLATIONS: DesignerHistoryTranslations = {
  title: 'History',
  origin: 'Opened',
  originTruncated: 'Earlier steps discarded',
  untitled: 'Edit',
  undone: 'Undone',
  saved: 'Saved',
  empty: 'No changes yet',
  clear: 'Clear history',
  clearConfirmTitle: 'Clear history?',
  clearConfirmContent: 'You will not be able to undo past this point. The current content stays as it is.',
  clearConfirmOk: 'Clear',
  announceUndo: label => `Undid: ${label}`,
  announceRedo: label => `Redid: ${label}`,
  announceJump: (label, steps) => `Went to: ${label}, ${steps} ${steps === 1 ? 'step' : 'steps'}`,
  announceCleared: 'History cleared',
}

const TAG = 'xh-designer-history'

const EMPTY: HistorySnapshot = { entries: [], position: 0, origin: 0, truncated: false, originSaved: false }

interface Parts {
  readonly header: HTMLElement
  readonly title: HTMLElement
  readonly clear: HTMLElement & { disabled?: boolean }
  readonly clearFace: HTMLButtonElement
  readonly body: HTMLElement
  readonly list: HTMLElement & { value?: string | string[] }
  readonly content: HTMLElement
  readonly empty: HTMLElement
}

/** 列表里的一行：起点或一步。 */
interface Row {
  readonly position: number
  readonly label: string
  readonly state: 'origin' | 'done' | 'undone'
  readonly saved: boolean
}

function rowsOf(snapshot: HistorySnapshot, t: DesignerHistoryTranslations): Row[] {
  return [
    { position: snapshot.origin, label: snapshot.truncated ? t.originTruncated : t.origin, state: 'origin', saved: snapshot.originSaved },
    ...snapshot.entries.map(entry => ({ position: entry.position, label: entry.label ?? t.untitled, state: entry.state, saved: entry.saved })),
  ]
}

export class XhDesignerHistoryElement extends XhReactiveElement {
  static override properties = {
    snapshot: { attribute: false },
    readonly: { converter: BOOLEAN_CONVERTER },
    headless: { converter: BOOLEAN_CONVERTER },
    announce: { attribute: false },
    translations: { attribute: false },
  }

  /** 历史的快照：designer-kit 的 snapshotHistory(history)；历史变了、换了语言都重交一份。 */
  declare snapshot: HistorySnapshot | undefined
  /** 只读：能浏览，不能跳转，清空钮禁用。 */
  declare readonly?: boolean
  /** 放进外框的卡片时写上：不画自己的标题与清空钮，标题由外框的面板头显示，仍给列表命名。 */
  declare headless?: boolean
  /** 读屏播报：从这里选一行、跳转完成后礼貌级地读一句；不给就不播。 */
  declare announce: ((message: string) => void) | undefined
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerHistoryTranslations> | undefined

  /** 注册历史记录用到的库内元素。 */
  static defineDependencies(): void {
    defineHistoryElements()
  }

  readonly #config = new XhConfigController(this)
  readonly #ids = createCounterIdGenerator('xh-designer-history')
  #parts: Parts | undefined
  /** 已铺的行，键是位置号。 */
  #items = new Map<number, HTMLElement>()
  /** 最近一次从这里请求跳去的位置与当时所在的位置；快照到了那里就播报一句。 */
  #request: { readonly to: number, readonly from: number } | undefined
  #lastPosition: number | undefined

  constructor() {
    super()
    this.readonly = false
    this.headless = false
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#translations()
    const snapshot = this.snapshot ?? EMPTY
    setText(parts.title, t.title)
    parts.header.hidden = this.headless === true
    setText(parts.clearFace, t.clear)
    const canClear = this.readonly !== true && snapshot.entries.length > 0
    setAttributes(parts.clear, { disabled: !canClear })
    parts.list.setAttribute('aria-labelledby', parts.title.id)
    setAttributes(parts.list, { 'read-only': this.readonly === true })
    const rows = rowsOf(snapshot, t)
    this.#renderRows(rows, t)
    parts.list.value = String(snapshot.position)
    setText(parts.empty, t.empty)
    parts.empty.hidden = snapshot.entries.length > 0
    this.#announceArrival(rows, snapshot, t)
    if (snapshot.position !== this.#lastPosition) {
      this.#lastPosition = snapshot.position
      const current = this.#items.get(snapshot.position)
      void this.updateComplete.then(() => current?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }))
    }
  }

  #translations(): DesignerHistoryTranslations {
    return this.#config.translations<DesignerHistoryTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
  }

  #ensureParts(): Parts {
    if (this.#parts?.header.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const title = createAuthoredElement(doc, 'span', { 'data-part': 'title', 'id': this.#ids.scopeId() })
    const clearFace = createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' })
    const clear: Parts['clear'] = createAuthoredElement(doc, 'xh-button', { 'variant': 'ghost', 'size': 'sm', 'tone': 'danger', 'data-part': 'clear-trigger' }, [clearFace])
    clearFace.addEventListener('click', () => {
      if (this.readonly !== true && (this.snapshot?.entries.length ?? 0) > 0)
        emitEvent(this, 'history-clear', {})
    })
    const header = createGeneratedElement(doc, 'div', { 'data-part': 'header' }, [title, clear])
    const content = createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' })
    const list: Parts['list'] = createAuthoredElement(doc, 'xh-listbox', { 'size': 'sm', 'typeahead': 'false', 'data-part': 'list' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [content]),
    ])
    list.addEventListener('value-change', this.#onValueChange)
    const body = createGeneratedElement(doc, 'div', { 'data-part': 'body' }, [list])
    const empty = createGeneratedElement(doc, 'div', { 'data-part': 'empty' })
    this.prepend(header, body, empty)
    this.#parts = { header, title, clear, clearFace, body, list, content, empty }
    this.#items = new Map()
    return this.#parts
  }

  /** 按位置号复用行：只改文字与状态，增删进出的那几行，焦点所在的行不被换掉。 */
  #renderRows(rows: readonly Row[], t: DesignerHistoryTranslations): void {
    const doc = this.ownerDocument
    const next = new Map<number, HTMLElement>()
    const nodes = rows.map((row) => {
      let item = this.#items.get(row.position)
      if (item === undefined) {
        item = createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'value': String(row.position) }, [
          createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-text' }),
          createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-description' }),
          createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-indicator' }),
        ])
      }
      const [text, description] = [item.children[0] as HTMLElement, item.children[1] as HTMLElement]
      setText(text, row.label)
      const notes = [row.state === 'undone' ? t.undone : undefined, row.saved ? t.saved : undefined].filter(note => note !== undefined)
      setText(description, notes.join(' · '))
      description.hidden = notes.length === 0
      setAttributes(item, { 'data-history': row.state })
      next.set(row.position, item)
      return item
    })
    const content = this.#parts!.content
    for (const [position, item] of this.#items) {
      if (!next.has(position))
        item.remove()
    }
    nodes.forEach((item, index) => {
      if (content.children[index] !== item)
        content.insertBefore(item, content.children[index] ?? null)
    })
    this.#items = next
  }

  /** 从这里请求的跳转到了：读一句「跳到哪一步、走了几步」。 */
  #announceArrival(rows: readonly Row[], snapshot: HistorySnapshot, t: DesignerHistoryTranslations): void {
    const request = this.#request
    if (request === undefined || snapshot.position !== request.to)
      return
    this.#request = undefined
    const order = rows.map(row => row.position)
    const target = rows.find(row => row.position === request.to)
    const steps = Math.abs(order.indexOf(request.to) - order.indexOf(request.from))
    if (target !== undefined && steps > 0)
      this.announce?.(t.announceJump(target.label, steps))
  }

  readonly #onValueChange = (event: Event): void => {
    event.stopPropagation()
    const snapshot = this.snapshot ?? EMPTY
    const picked = (event as CustomEvent<{ value: string[] }>).detail.value[0]
    // 选中受控：列表换回当前位置，等设计器跳过去后交来新快照
    this.#parts!.list.value = String(snapshot.position)
    const position = picked === undefined ? Number.NaN : Number(picked)
    if (this.readonly === true || !Number.isFinite(position) || position === snapshot.position)
      return
    this.#request = { to: position, from: snapshot.position }
    emitEvent(this, 'history-go', { position })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-history': XhDesignerHistoryElement
  }
}
