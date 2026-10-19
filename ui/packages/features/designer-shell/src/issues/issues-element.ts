/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-issues>：问题列表。列出设计器换好文字的结构问题，按严重程度排列、按对象分组或按传入顺序；头部的
// 错误、警告开关带计数，过滤状态保留。方向键在条目间移动，回车或点击派发 issue-activate，悬停派发 issue-hover。
// 这组开关是 summary：宿主可以把它移到外框面板头的操作区，零件照样更新它，不再收回。

import type { IssueSeverity, SchemaIssue } from '@xihan-ui/designer-kit/schema'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerIssuesTranslations } from '../translations'
import { createCounterIdGenerator } from '@xihan-ui/core'
import { issueSeverity } from '@xihan-ui/designer-kit/schema'
import { BOOLEAN_CONVERTER, createAuthoredElement, createGeneratedElement, emitEvent, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
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
  noTarget: 'General',
}

const TAG = 'xh-designer-issues'
const STRING_CONVERTER = { fromAttribute: (value: string | null) => value ?? undefined }

interface Entry {
  readonly item: DesignerIssueItem
  readonly index: number
}

interface TargetGroup {
  /** 组标题：组内第一个有 subject 的条目的 subject，都没有时为对象 id；没有对象的一组为 undefined。 */
  readonly label: string | undefined
  readonly entries: Entry[]
}

/** 错误在前、警告在后，同级保持原有先后。 */
function bySeverity(entries: readonly Entry[]): Entry[] {
  return [...entries.filter(({ item }) => issueSeverity(item.issue) === 'error'), ...entries.filter(({ item }) => issueSeverity(item.issue) === 'warning')]
}

/** 按问题所在对象分组：组按对象第一次出现的先后，没有对象的问题归在最后一组。 */
function byTarget(entries: readonly Entry[]): TargetGroup[] {
  const groups = new Map<string, { label: string | undefined, id: string, entries: Entry[] }>()
  const rest: Entry[] = []
  for (const entry of entries) {
    const target = entry.item.issue.target
    if (target === undefined) {
      rest.push(entry)
      continue
    }
    const key = JSON.stringify([target.kind, target.id])
    const group = groups.get(key) ?? { label: undefined, id: target.id, entries: [] }
    group.label ??= entry.item.subject
    group.entries.push(entry)
    groups.set(key, group)
  }
  const result: TargetGroup[] = Array.from(groups.values(), group => ({ label: group.label ?? group.id, entries: bySeverity(group.entries) }))
  if (rest.length > 0)
    result.push({ label: undefined, entries: bySeverity(rest) })
  return result
}

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
    activate: { converter: STRING_CONVERTER },
    readonly: { converter: BOOLEAN_CONVERTER },
    headless: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  /** 要列出的问题。 */
  declare items: readonly DesignerIssueItem[] | undefined
  /**
   * severity：错误在前、警告在后（缺省）；target：按问题所在对象分组，组标题取条目的 subject，组内错误在前，
   * 没有对象的问题归在最后一组；none：按传入顺序。
   */
  declare groupBy: 'severity' | 'target' | 'none' | undefined
  /** 没有问题时的提示，缺省取文案 empty。 */
  declare emptyText: string | undefined
  /**
   * 哪些条目能点：target（缺省）只有落在对象上的问题能点，设计器据此选中对象；path 凡有路径的都能点，
   * JSON 编辑框据此把光标移到路径在文字里的位置。
   */
  declare activate: 'target' | 'path' | undefined
  /** 只读。问题列表没有修改类操作，只读时照常浏览与定位。 */
  declare readonly?: boolean
  /** 放进外框的卡片时写上：不画自己的标题，标题由外框的面板头显示，仍作正文的可访问名。 */
  declare headless?: boolean
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
    this.headless = false
  }

  /**
   * 严重程度的开关，各带这一级问题的计数。缺省在零件自己的头部；放进外框的卡片时，宿主可以把它移到面板头的操作区
   * （写上 slot="<区名>-actions" 交给外框），零件照样更新计数与开关状态，不再把它收回头部。
   */
  get summary(): HTMLElement {
    return this.#ensureParts().filter
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#config.translations<DesignerIssuesTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
    const items = this.items ?? []
    setText(parts.title, t.title)
    parts.title.hidden = this.headless === true
    parts.header.hidden = parts.title.hidden && parts.filter.parentElement !== parts.header
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
    const inputs = [items, this.groupBy, this.activate, filter.join(','), t.severityError, t.severityWarning, t.noTarget]
    if (inputs.length === this.#rendered.length && inputs.every((input, index) => input === this.#rendered[index]))
      return
    this.#rendered = inputs
    this.#renderList(items, t)
  }

  #ensureParts(): Parts {
    if (this.#parts?.header.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const title = createAuthoredElement(doc, 'span', { 'data-part': 'title', 'id': this.#ids.scopeId() })
    const errorCount = createAuthoredElement(doc, 'span', {})
    const warningCount = createAuthoredElement(doc, 'span', {})
    const filter: Parts['filter'] = createAuthoredElement(doc, 'xh-toggle-group', { 'multiple': true, 'size': 'sm', 'data-part': 'filter' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
        createAuthoredElement(doc, 'button', { 'data-xh-part': 'item', 'type': 'button', 'value': 'error', 'data-severity': 'error' }, [errorCount]),
        createAuthoredElement(doc, 'button', { 'data-xh-part': 'item', 'type': 'button', 'value': 'warning', 'data-severity': 'warning' }, [warningCount]),
      ]),
    ])
    filter.addEventListener('value-change', (event) => {
      event.stopPropagation()
      const value = (event as CustomEvent<{ value: string[] | string | null }>).detail.value
      const next = Array.isArray(value) ? value : value === null ? [] : [value]
      this.#shown = new Set(next.filter((severity): severity is IssueSeverity => severity === 'error' || severity === 'warning'))
      this.requestUpdate()
    })
    const header = createGeneratedElement(doc, 'div', { 'data-part': 'header' }, [title, filter])
    // 开关被宿主移走时头部跟着收起
    new MutationObserver(() => this.requestUpdate()).observe(header, { childList: true })
    const list = createGeneratedElement(doc, 'div', { 'data-part': 'list', 'role': 'list', 'aria-labelledby': title.id })
    const empty = createGeneratedElement(doc, 'div', { 'data-part': 'empty' })
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
    const doc = this.ownerDocument
    let first = true
    const row = ({ item, index }: Entry, withSubject: boolean): HTMLElement => {
      const severity = issueSeverity(item.issue)
      const children: (Node | string)[] = [
        createAuthoredElement(doc, 'span', { 'data-part': 'issue-severity' }, [severity === 'error' ? t.severityError : t.severityWarning]),
      ]
      if (withSubject && item.subject !== undefined)
        children.push(createAuthoredElement(doc, 'span', { 'data-part': 'issue-subject' }, [item.subject]))
      children.push(createAuthoredElement(doc, 'span', { 'data-part': 'issue-message' }, [item.message]))
      if (item.source !== undefined) {
        children.push(createAuthoredElement(doc, 'xh-tag', { 'size': 'sm', 'variant': 'subtle', 'data-part': 'issue-source' }, [
          createAuthoredElement(doc, 'span', { 'data-xh-part': 'root' }, [createAuthoredElement(doc, 'span', { 'data-xh-part': 'label' }, [item.source])]),
        ]))
      }
      const activatable = this.activate === 'path' || item.issue.target !== undefined
      const body = activatable
        ? createAuthoredElement(doc, 'button', { 'data-part': 'issue', 'data-severity': severity, 'data-index': index, 'type': 'button', 'tabindex': first ? 0 : -1 }, children)
        : createAuthoredElement(doc, 'div', { 'data-part': 'issue', 'data-severity': severity, 'data-index': index }, children)
      if (activatable)
        first = false
      return createAuthoredElement(doc, 'div', { role: 'listitem' }, [body])
    }
    if (this.groupBy === 'target') {
      parts.list.replaceChildren(...byTarget(indexed).map((group, position) => {
        const id = `${parts.title.id}-group-${position}`
        return createAuthoredElement(doc, 'div', { 'data-part': 'group', 'role': 'listitem' }, [
          createAuthoredElement(doc, 'div', { 'data-part': 'group-label', id }, [group.label ?? t.noTarget]),
          createAuthoredElement(doc, 'div', { 'data-part': 'group-items', 'role': 'list', 'aria-labelledby': id }, group.entries.map(entry => row(entry, false))),
        ])
      }))
    }
    else {
      const ordered = this.groupBy === 'none' ? indexed : bySeverity(indexed)
      parts.list.replaceChildren(...ordered.map(entry => row(entry, true)))
    }
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
