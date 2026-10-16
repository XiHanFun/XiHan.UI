/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-issues>：问题列表。列出设计器换好文字的结构问题，按严重程度分组或按传入顺序；头部的错误、警告
// 开关带计数，过滤状态保留。方向键在条目间移动，回车或点击派发 issue-activate，悬停派发 issue-hover。

import type { IssueSeverity, SchemaIssue } from '@xihan-ui/designer-kit/schema'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerIssuesTranslations } from '../translations'
import { createCounterIdGenerator } from '@xihan-ui/core'
import { issueSeverity } from '@xihan-ui/designer-kit/schema'
import { emitEvent, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { h, setText } from '../internal/dom'
import { defineIssueListElements } from '../internal/ui-elements'

/** 列表里的一条：问题本身与设计器换好的文字。 */
export interface DesignerIssueItem {
  readonly issue: SchemaIssue
  /** 问题说明。 */
  readonly message: string
  /** 问题所在对象的名字。 */
  readonly subject?: string
  /** 来源小标签，如「校验」「分页」。 */
  readonly source?: string
}

/** 问题列表派发的事件。 */
export interface DesignerIssuesEventMap {
  'issue-activate': CustomEvent<{ issue: SchemaIssue, index: number }>
  'issue-hover': CustomEvent<{ issue: SchemaIssue | undefined }>
}

const DEFAULT_TRANSLATIONS: DesignerIssuesTranslations = {
  title: 'Problems',
  empty: 'No problems',
  errors: count => `${count} ${count === 1 ? 'error' : 'errors'}`,
  warnings: count => `${count} ${count === 1 ? 'warning' : 'warnings'}`,
  severityError: 'Error',
  severityWarning: 'Warning',
  filter: 'Show problems by severity',
}

const TAG = 'xh-designer-issues'
const STRING_CONVERTER = { fromAttribute: (value: string | null) => value ?? undefined }

interface Parts {
  readonly header: HTMLElement
  readonly title: HTMLElement
  readonly filter: HTMLElement & { value?: string[] }
  readonly errorCount: HTMLElement
  readonly warningCount: HTMLElement
  readonly list: HTMLElement
  readonly empty: HTMLElement
}

export class XhDesignerIssuesElement extends XhReactiveElement {
  static override properties = {
    items: { attribute: false },
    groupBy: { converter: STRING_CONVERTER, attribute: 'group-by' },
    emptyText: { converter: STRING_CONVERTER, attribute: 'empty-text' },
    readonly: { type: Boolean },
    translations: { attribute: false },
  }

  /** 要列出的问题。 */
  declare items: readonly DesignerIssueItem[] | undefined
  /** severity：错误在前、警告在后分两组（缺省）；none：按传入顺序。 */
  declare groupBy: 'severity' | 'none' | undefined
  /** 没有问题时的提示，缺省取文案 empty。 */
  declare emptyText: string | undefined
  /** 只读。问题列表没有修改类操作，只读时照常浏览与定位。 */
  declare readonly: boolean
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerIssuesTranslations> | undefined

  /** 注册列表用到的库内元素。 */
  static defineDependencies(): void {
    defineIssueListElements()
  }

  readonly #config = new XhConfigController(this)
  readonly #ids = createCounterIdGenerator('xh-designer-issues')
  #parts: Parts | undefined
  #shown = new Set<IssueSeverity>(['error', 'warning'])
  #rendered: readonly unknown[] = []
  #hovered: SchemaIssue | undefined

  constructor() {
    super()
    this.readonly = false
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#config.translations<DesignerIssuesTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
    const items = this.items ?? []
    setText(parts.title, t.title)
    parts.filter.querySelector('[data-xh-part="root"]')!.setAttribute('aria-label', t.filter)
    const errors = items.filter(item => issueSeverity(item.issue) === 'error').length
    setText(parts.errorCount, t.errors(errors))
    setText(parts.warningCount, t.warnings(items.length - errors))
    const filter = [...this.#shown]
    if (JSON.stringify(parts.filter.value ?? []) !== JSON.stringify(filter))
      parts.filter.value = filter
    const visible = items.filter(item => this.#shown.has(issueSeverity(item.issue)))
    setText(parts.empty, this.emptyText ?? t.empty)
    parts.empty.hidden = visible.length > 0
    const inputs = [items, this.groupBy, filter.join(','), t.severityError, t.severityWarning]
    if (inputs.length === this.#rendered.length && inputs.every((input, index) => input === this.#rendered[index]))
      return
    this.#rendered = inputs
    this.#renderList(items, t)
  }

  #ensureParts(): Parts {
    if (this.#parts?.header.isConnected && this.#parts.header.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const title = h(doc, 'span', { 'data-part': 'title', 'id': this.#ids.scopeId() })
    const errorCount = h(doc, 'span', {})
    const warningCount = h(doc, 'span', {})
    const filter: Parts['filter'] = h(doc, 'xh-toggle-group', { 'multiple': true, 'size': 'sm', 'data-part': 'filter' }, [
      h(doc, 'div', { 'data-xh-part': 'root' }, [
        h(doc, 'button', { 'data-xh-part': 'item', 'type': 'button', 'value': 'error', 'data-severity': 'error' }, [errorCount]),
        h(doc, 'button', { 'data-xh-part': 'item', 'type': 'button', 'value': 'warning', 'data-severity': 'warning' }, [warningCount]),
      ]),
    ])
    filter.addEventListener('value-change', (event) => {
      event.stopPropagation()
      const value = (event as CustomEvent<{ value: string[] | string | null }>).detail.value
      const next = Array.isArray(value) ? value : value === null ? [] : [value]
      this.#shown = new Set(next.filter((severity): severity is IssueSeverity => severity === 'error' || severity === 'warning'))
      this.requestUpdate()
    })
    const header = h(doc, 'div', { 'data-part': 'header' }, [title, filter])
    const list = h(doc, 'ul', { 'data-part': 'list', 'role': 'list', 'aria-labelledby': title.id })
    const empty = h(doc, 'p', { 'data-part': 'empty' })
    list.addEventListener('click', this.#onClick)
    list.addEventListener('keydown', this.#onKeyDown)
    list.addEventListener('mouseover', this.#onHover)
    list.addEventListener('mouseleave', () => this.#hover(undefined))
    this.prepend(header, list, empty)
    this.#parts = { header, title, filter, errorCount, warningCount, list, empty }
    this.#rendered = []
    return this.#parts
  }

  #renderList(items: readonly DesignerIssueItem[], t: DesignerIssuesTranslations): void {
    const parts = this.#parts!
    const focused = this.#focusedIndex()
    const indexed = items.map((item, index) => ({ item, index })).filter(({ item }) => this.#shown.has(issueSeverity(item.issue)))
    const ordered = this.groupBy === 'none'
      ? indexed
      : [...indexed.filter(({ item }) => issueSeverity(item.issue) === 'error'), ...indexed.filter(({ item }) => issueSeverity(item.issue) === 'warning')]
    const doc = this.ownerDocument
    let first = true
    parts.list.replaceChildren(...ordered.map(({ item, index }) => {
      const severity = issueSeverity(item.issue)
      const children: (Node | string)[] = [
        h(doc, 'span', { 'data-part': 'issue-severity' }, [severity === 'error' ? t.severityError : t.severityWarning]),
      ]
      if (item.subject !== undefined)
        children.push(h(doc, 'span', { 'data-part': 'issue-subject' }, [item.subject]))
      children.push(h(doc, 'span', { 'data-part': 'issue-message' }, [item.message]))
      if (item.source !== undefined) {
        children.push(h(doc, 'xh-tag', { 'size': 'sm', 'variant': 'subtle', 'data-part': 'issue-source' }, [
          h(doc, 'span', { 'data-xh-part': 'root' }, [h(doc, 'span', { 'data-xh-part': 'label' }, [item.source])]),
        ]))
      }
      const activatable = item.issue.target !== undefined
      const body = activatable
        ? h(doc, 'button', { 'data-part': 'issue', 'data-severity': severity, 'data-index': index, 'type': 'button', 'tabindex': first ? 0 : -1 }, children)
        : h(doc, 'div', { 'data-part': 'issue', 'data-severity': severity, 'data-index': index }, children)
      if (activatable)
        first = false
      return h(doc, 'li', {}, [body])
    }))
    if (focused !== undefined)
      this.#focusIndex(focused)
  }

  #buttons(): HTMLButtonElement[] {
    return Array.from(this.#parts?.list.querySelectorAll<HTMLButtonElement>('button[data-part="issue"]') ?? [])
  }

  #focusedIndex(): number | undefined {
    const active = this.ownerDocument.activeElement
    if (!(active instanceof HTMLElement) || !this.#parts?.list.contains(active))
      return undefined
    return Number(active.dataset.index)
  }

  /** 把焦点与 Tab 位移到该条（按 items 的下标）；它被滤掉时取第一条。 */
  #focusIndex(index: number): void {
    const buttons = this.#buttons()
    const target = buttons.find(button => Number(button.dataset.index) === index) ?? buttons[0]
    if (!target)
      return
    for (const button of buttons)
      button.tabIndex = button === target ? 0 : -1
    target.focus()
  }

  #issueAt(element: Element | null): { issue: SchemaIssue, index: number } | undefined {
    const button = element?.closest<HTMLElement>('button[data-part="issue"]')
    if (!button || !this.contains(button))
      return undefined
    const index = Number(button.dataset.index)
    const item = this.items?.[index]
    return item && { issue: item.issue, index }
  }

  #hover(issue: SchemaIssue | undefined): void {
    if (issue === this.#hovered)
      return
    this.#hovered = issue
    emitEvent(this, 'issue-hover', { issue })
  }

  readonly #onClick = (event: MouseEvent): void => {
    const hit = this.#issueAt(event.target as Element | null)
    if (hit)
      emitEvent(this, 'issue-activate', hit)
  }

  readonly #onHover = (event: MouseEvent): void => {
    const element = event.target as Element | null
    const row = element?.closest<HTMLElement>('[data-part="issue"]')
    const item = row ? this.items?.[Number(row.dataset.index)] : undefined
    this.#hover(item?.issue)
  }

  readonly #onKeyDown = (event: KeyboardEvent): void => {
    const buttons = this.#buttons()
    const current = buttons.indexOf(event.target as HTMLButtonElement)
    if (current < 0)
      return
    let next: number
    switch (event.key) {
      case 'ArrowDown':
        next = Math.min(buttons.length - 1, current + 1)
        break
      case 'ArrowUp':
        next = Math.max(0, current - 1)
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = buttons.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    this.#focusIndex(Number(buttons[next]!.dataset.index))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-issues': XhDesignerIssuesElement
  }
}
