/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-properties>：属性面板。按属性描述把一个或多个对象渲染成一组字段，分组、显示条件与编辑器查找
// 都用 designer-kit/properties；多选时只显示共同属性。写入派发事件，由设计器换成编辑操作。

import type { JsonPath, JsonValue } from '@xihan-ui/core/json'
import type { DataField } from '@xihan-ui/designer-kit'
import type { PropertyControl, PropertyDescriptor, PropertyEditor, PropertyEditorContext, PropertyEditorTable, PropertyOption } from '@xihan-ui/designer-kit/properties'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerPropertiesTranslations } from '../translations'
import type { FieldContext, FieldInstance } from './editors'
import { createCounterIdGenerator } from '@xihan-ui/core'
import { formatJsonPath, getJsonAt, jsonEquals } from '@xihan-ui/core/json'
import { groupProperties, isPropertyVisible, resolvePropertyEditor } from '@xihan-ui/designer-kit/properties'
import { createAuthoredElement, createGeneratedElement, emitEvent, setAttributes, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { placeChildren } from '../internal/dom'
import { adoptSlots } from '../internal/slots'
import { definePropertyFieldElements } from '../internal/ui-elements'
import { builtinEditor, PROPERTIES_SCOPE } from './editors'

/** 属性描述，编辑方式可以是内建种类之外的产品种类。 */
export type DesignerPropertyDescriptor = PropertyDescriptor<PropertyControl | { readonly kind: string }>

/** 被编辑的对象：种类（用于按对象种类查编辑器）、id、对象本身与它的属性描述。 */
export interface DesignerPropertyTarget {
  readonly kind: string
  readonly id: string
  readonly value: JsonValue
  readonly descriptors: readonly DesignerPropertyDescriptor[]
}

/** 对象的身份。 */
export interface DesignerPropertyTargetRef {
  readonly kind: string
  readonly id: string
}

/** 落在字段上的错误，文字由设计器换好，path 相对对象。 */
export interface DesignerPropertyError {
  readonly target: DesignerPropertyTargetRef
  readonly path: JsonPath
  readonly message: string
}

/** 宿主编辑器：target 是当前全部被编辑的对象。 */
export type DesignerPropertyEditor = PropertyEditor<DesignerPropertyDescriptor, readonly DesignerPropertyTarget[]>

/** 属性面板派发的事件。 */
export interface DesignerPropertiesEventMap {
  'property-change': CustomEvent<{ path: JsonPath, value: JsonValue | undefined, targets: readonly DesignerPropertyTargetRef[], merge: string }>
  'property-commit': CustomEvent<{ path: JsonPath }>
}

const DEFAULT_TRANSLATIONS: DesignerPropertiesTranslations = {
  title: 'Properties',
  empty: 'No properties to edit',
  mixed: 'Multiple values',
  invalidJson: 'Not valid JSON',
  notInteger: 'Must be a whole number',
  belowMinimum: min => `Must be at least ${min}`,
  aboveMaximum: max => `Must be at most ${max}`,
  notAboveMinimum: min => `Must be greater than ${min}`,
  invalidDataField: 'Not a valid field path',
  sidesLinked: 'Same on all sides',
  sides: { all: 'All sides', top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' },
  sidesIncomplete: 'Fill in all four sides',
}

const TAG = 'xh-designer-properties'
/** 属性面板生成的部件都带这个 data-scope，样式只认它，不碰插槽与自定义编辑器里的作者内容。 */
const SCOPE = PROPERTIES_SCOPE
/** 字段里接焦点的部件：输入框、触发钮、开关与切换组的条目；加减与清空钮不算。 */
const FOCUSABLE = 'input:not([type="hidden"]), textarea, [role="switch"], [data-xh-part="trigger"], [data-xh-part="item"], [tabindex]:not([tabindex="-1"])'
const NUMBER_CONVERTER = { fromAttribute: (value: string | null) => (value === null ? undefined : Number(value)) }
const STRING_CONVERTER = { fromAttribute: (value: string | null) => value ?? undefined }

interface Parts {
  readonly header: HTMLElement
  readonly title: HTMLElement
  readonly heading: HTMLElement
  readonly headerSlot: HTMLElement
  readonly body: HTMLElement
  readonly empty: HTMLElement
  readonly groups: HTMLElement
  readonly footerSlot: HTMLElement
}

/**
 * 一行属性：
 * - 内建编辑器与标了 data-xh-part="control" 的宿主编辑器放进 xh-field，由字段接线；
 * - 其余宿主编辑器是一组控件，整行 role=group，标签与说明经 aria-labelledby / aria-describedby 接上；
 * - 没有编辑器时是只读的一行，左边标签文字、右边占位说明。
 * 后两种没有 field。
 */
interface Row {
  readonly key: string
  readonly element: HTMLElement
  field: HTMLElement | undefined
  label: HTMLElement
  readonly hint: HTMLElement
  readonly error: HTMLElement
  readonly control: { readonly update?: (context: FieldContext) => void, readonly destroy?: () => void }
  descriptor: DesignerPropertyDescriptor
  localError: string | undefined
}

interface Group {
  readonly key: string
  readonly element: HTMLElement
  readonly label: HTMLElement | undefined
  readonly rows: HTMLElement
}

export class XhDesignerPropertiesElement extends XhReactiveElement {
  static override properties = {
    targets: { attribute: false },
    editors: { attribute: false },
    groupOrder: { attribute: false },
    groupLabel: { attribute: false },
    labelOf: { attribute: false },
    hintOf: { attribute: false },
    optionLabel: { attribute: false },
    unitLabel: { attribute: false },
    dataFields: { attribute: false },
    errors: { attribute: false },
    heading: { converter: STRING_CONVERTER },
    emptyText: { converter: STRING_CONVERTER, attribute: 'empty-text' },
    toggleLimit: { converter: NUMBER_CONVERTER, attribute: 'toggle-limit' },
    collapsible: { type: Boolean },
    readonly: { type: Boolean },
    translations: { attribute: false },
  }

  /** 要编辑的对象；空数组显示空状态，多个时只显示共同属性。 */
  declare targets: readonly DesignerPropertyTarget[] | undefined
  /** 宿主编辑器，按 resolvePropertyEditor 查找；查不到的内建种类用自带编辑器。 */
  declare editors: PropertyEditorTable<DesignerPropertyEditor> | undefined
  /** 先列出的分组及其顺序。 */
  declare groupOrder: readonly string[] | undefined
  /** 分组标题，缺省显示分组 id。 */
  declare groupLabel: ((group: string) => string) | undefined
  /** 属性名，缺省取描述的 label，再缺省取 formatJsonPath(path)。 */
  declare labelOf: ((descriptor: DesignerPropertyDescriptor) => string) | undefined
  /** 字段说明。 */
  declare hintOf: ((descriptor: DesignerPropertyDescriptor) => string | undefined) | undefined
  /** select 选项的文案，缺省取 option.label，再缺省取值本身。 */
  declare optionLabel: ((descriptor: DesignerPropertyDescriptor, option: PropertyOption) => string) | undefined
  /** number 与 sides 后缀的单位文案，缺省原样显示。 */
  declare unitLabel: ((unit: string) => string) | undefined
  /** dataField 选字段用的字段树；不给时 dataField 是输入字段路径的文本框。 */
  declare dataFields: readonly DataField[] | undefined
  /** 落在字段上的错误。 */
  declare errors: readonly DesignerPropertyError[] | undefined
  /** 标题下一行，如「表格 · t1」。 */
  declare heading: string | undefined
  /** 空状态文案，缺省取文案 empty。 */
  declare emptyText: string | undefined
  /** select 的 appearance 为 auto（缺省）、单选且选项不超过它时改用切换按钮组；缺省不用。 */
  declare toggleLimit: number | undefined
  /** 分组可折叠，折叠状态按分组 id 保留。 */
  declare collapsible: boolean
  /** 只读：字段只读，不派发 property-change。 */
  declare readonly: boolean
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerPropertiesTranslations> | undefined

  /** 注册面板用到的库内元素。 */
  static defineDependencies(): void {
    definePropertyFieldElements()
  }

  readonly #config = new XhConfigController(this)
  readonly #ids = createCounterIdGenerator('xh-designer-properties')
  #parts: Parts | undefined
  #releaseSlots: (() => void) | undefined
  #rows = new Map<string, Row>()
  #groups = new Map<string, Group>()
  #collapsed = new Set<string>()
  #accordion: HTMLElement & { value?: string[] } | undefined
  #shownGroups: string[] = []
  #editorIds = new WeakMap<object, number>()
  #editorCount = 0
  #t: DesignerPropertiesTranslations = DEFAULT_TRANSLATIONS

  constructor() {
    super()
    this.collapsible = false
    this.readonly = false
  }

  override connectedCallback(): void {
    super.connectedCallback()
    const parts = this.#ensureParts()
    this.#releaseSlots ??= adoptSlots(this, { header: parts.headerSlot, footer: parts.footerSlot })
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#releaseSlots?.()
    this.#releaseSlots = undefined
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#config.translations<DesignerPropertiesTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
    this.#t = t
    setText(parts.title, t.title)
    setText(parts.heading, this.heading ?? '')
    parts.heading.hidden = !this.heading
    if (changed.has('collapsible'))
      this.#clear()
    const targets = this.targets ?? []
    const descriptors = this.#visible(targets)
    parts.empty.hidden = descriptors.length > 0
    setText(parts.empty, this.emptyText ?? t.empty)
    this.#render(targets, descriptors)
  }

  /** 把焦点交给该属性的字段；找不到时返回 false。 */
  focusField(path: JsonPath): boolean {
    const key = formatJsonPath(path)
    for (const row of this.#rows.values()) {
      if (formatJsonPath(row.descriptor.path) !== key)
        continue
      const focusable = row.element.querySelector<HTMLElement>(FOCUSABLE)
      if (!focusable)
        return false
      focusable.focus()
      return true
    }
    return false
  }

  #ensureParts(): Parts {
    if (this.#parts?.header.isConnected && this.#parts.header.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const title = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'title' })
    const heading = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'heading', 'hidden': true })
    const headerSlot = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'header-slot' })
    const header = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'header' }, [title, heading, headerSlot])
    const empty = createAuthoredElement(doc, 'p', { 'data-scope': SCOPE, 'data-part': 'empty' })
    const groups = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'groups' })
    const footerSlot = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'footer-slot' })
    const body = createGeneratedElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'body' }, [empty, groups, footerSlot])
    this.prepend(header, body)
    this.#parts = { header, title, heading, headerSlot, body, empty, groups, footerSlot }
    this.#rows.clear()
    this.#groups.clear()
    this.#accordion = undefined
    return this.#parts
  }

  /** 共同属性里在每个对象上都显示的那些。 */
  #visible(targets: readonly DesignerPropertyTarget[]): DesignerPropertyDescriptor[] {
    const [first, ...rest] = targets
    if (!first)
      return []
    return first.descriptors.filter((descriptor) => {
      const key = formatJsonPath(descriptor.path)
      const shared = rest.every(target => target.descriptors.some(other =>
        formatJsonPath(other.path) === key && jsonEquals(other.control as unknown as JsonValue, descriptor.control as unknown as JsonValue)))
      return shared && targets.every(target => isPropertyVisible(descriptor, target.value))
    })
  }

  #render(targets: readonly DesignerPropertyTarget[], descriptors: readonly DesignerPropertyDescriptor[]): void {
    const parts = this.#parts!
    // 显示条件已逐个对象判过，分组时不再按单个对象求值
    const plain = descriptors.map(descriptor => ({ ...descriptor, visibleWhen: undefined }))
    const original = new Map(plain.map((descriptor, index) => [descriptor, descriptors[index]!]))
    const grouped = groupProperties(plain, undefined, this.groupOrder ?? [])
    const kind = targets.length > 0 && targets.every(target => target.kind === targets[0]!.kind) ? targets[0]!.kind : ''
    const usedRows = new Set<string>()
    const groupElements: HTMLElement[] = []
    this.#shownGroups = []
    for (const group of grouped) {
      const groupKey = group.group ?? ''
      const container = this.#group(groupKey, group.group)
      groupElements.push(container.element)
      if (group.group !== undefined)
        this.#shownGroups.push(group.group)
      const rowElements: HTMLElement[] = []
      for (const item of group.properties) {
        const descriptor = original.get(item)!
        const row = this.#row(kind, descriptor, targets)
        usedRows.add(row.key)
        rowElements.push(row.element)
      }
      placeChildren(container.rows, rowElements)
    }
    for (const [key, row] of this.#rows) {
      if (!usedRows.has(key)) {
        row.control.destroy?.()
        this.#rows.delete(key)
      }
    }
    const shownGroups = new Set(grouped.map(group => group.group ?? ''))
    for (const key of this.#groups.keys()) {
      if (!shownGroups.has(key))
        this.#groups.delete(key)
    }
    const items = this.collapsible ? groupElements.filter(element => element.hasAttribute('data-xh-part')) : []
    // 可折叠且有带 id 的分组时才进手风琴；一个分组都没有时直接平铺，不建空的手风琴
    if (items.length > 0) {
      const accordion = this.#ensureAccordion()
      placeChildren(accordion.firstElementChild!, items)
      const open = this.#shownGroups.filter(group => !this.#collapsed.has(group))
      if (JSON.stringify(accordion.value ?? []) !== JSON.stringify(open))
        accordion.value = open
      placeChildren(parts.groups, [accordion, ...groupElements.filter(element => !element.hasAttribute('data-xh-part'))])
    }
    else {
      placeChildren(parts.groups, groupElements)
    }
  }

  #ensureAccordion(): HTMLElement & { value?: string[] } {
    if (this.#accordion)
      return this.#accordion
    const doc = this.ownerDocument
    const accordion: HTMLElement & { value?: string[] } = createAuthoredElement(doc, 'xh-accordion', { 'multiple': true, 'size': 'sm', 'data-part': 'accordion' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' })])
    accordion.addEventListener('value-change', (event) => {
      event.stopPropagation()
      const open = (event as CustomEvent<{ value: string[] }>).detail.value
      accordion.value = open
      for (const group of this.#shownGroups) {
        if (open.includes(group))
          this.#collapsed.delete(group)
        else
          this.#collapsed.add(group)
      }
    })
    this.#accordion = accordion
    return accordion
  }

  /** 分组容器：可折叠时是手风琴的一项，否则是带标题的一段；没有分组 id 的那组不带标题、也不进手风琴。 */
  #group(key: string, group: string | undefined): Group {
    const existing = this.#groups.get(key)
    const title = group === undefined ? undefined : (this.groupLabel?.(group) ?? group)
    if (existing) {
      if (existing.label && title !== undefined)
        setText(existing.label, title)
      return existing
    }
    const doc = this.ownerDocument
    const rows = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'group-rows' })
    let created: Group
    if (this.collapsible && group !== undefined) {
      const label = createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'group-label' }, [title!])
      const element = createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'value': group }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'header' }, [
          createAuthoredElement(doc, 'button', { 'data-xh-part': 'trigger', 'type': 'button' }, [label, createAuthoredElement(doc, 'span', { 'data-xh-part': 'indicator' })]),
        ]),
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [rows]),
      ])
      created = { key, element, label, rows }
    }
    else if (group !== undefined) {
      const label = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'group-label' }, [title!])
      const element = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'group', 'role': 'group' }, [label, rows])
      label.id = this.#ids.scopeId()
      element.setAttribute('aria-labelledby', label.id)
      created = { key, element, label, rows }
    }
    else {
      const element = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'group' }, [rows])
      created = { key, element, label: undefined, rows }
    }
    this.#groups.set(key, created)
    return created
  }

  #editorKey(kind: string, descriptor: DesignerPropertyDescriptor): { key: string, editor: DesignerPropertyEditor | undefined } {
    const editor = this.editors ? resolvePropertyEditor(this.editors, kind, descriptor) : undefined
    if (!editor)
      return { key: `builtin:${JSON.stringify(descriptor.control)}:${this.#builtinVariant(descriptor.control.kind)}`, editor }
    let id = this.#editorIds.get(editor)
    if (id === undefined) {
      id = ++this.#editorCount
      this.#editorIds.set(editor, id)
    }
    return { key: `editor:${id}`, editor }
  }

  /** 内建编辑器的元素随面板设置而变的那部分：select 看 toggle-limit，dataField 看有没有字段树。 */
  #builtinVariant(kind: string): string {
    if (kind === 'select')
      return String(this.toggleLimit ?? 0)
    if (kind === 'dataField')
      return this.dataFields === undefined ? 'path' : 'tree'
    return ''
  }

  #row(kind: string, descriptor: DesignerPropertyDescriptor, targets: readonly DesignerPropertyTarget[]): Row {
    const { key: editorKey, editor } = this.#editorKey(kind, descriptor)
    const key = `${formatJsonPath(descriptor.path)}\u0000${editorKey}\u0000${descriptor.required === true}`
    let row = this.#rows.get(key)
    if (!row) {
      row = this.#createRow(key, descriptor, editor, targets)
      this.#rows.set(key, row)
    }
    row.descriptor = descriptor
    this.#refresh(row, targets)
    return row
  }

  #createRow(key: string, descriptor: DesignerPropertyDescriptor, editor: DesignerPropertyEditor | undefined, targets: readonly DesignerPropertyTarget[]): Row {
    const doc = this.ownerDocument
    const element = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'property', 'data-path': formatJsonPath(descriptor.path) })
    const hint = createAuthoredElement(doc, 'p', { 'data-scope': SCOPE, 'data-part': 'property-hint', 'id': this.#ids.scopeId() })
    const error = createAuthoredElement(doc, 'p', { 'data-scope': SCOPE, 'data-part': 'property-error', 'id': this.#ids.scopeId() })
    const label = createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'property-label', 'id': this.#ids.scopeId() })
    const row: Row = { key, element, field: undefined, label, hint, error, control: {}, descriptor, localError: undefined }
    const builtin = editor ? undefined : builtinEditor(descriptor.control.kind)
    if (builtin) {
      const created: FieldInstance = builtin(this.#context(row, targets))
      Object.assign(row, { control: created })
      if (created.group) {
        setAttributes(element, { 'role': 'group', 'aria-labelledby': label.id })
        element.append(label, created.element, hint, error)
        return row
      }
      this.#placeInField(row, created.element)
      return row
    }
    if (editor) {
      const created = editor(plainContext(this.#context(row, targets), targets))
      Object.assign(row, { control: { update: (next: FieldContext) => created.update?.(plainContext(next, targets)), destroy: created.destroy } })
      const custom = createAuthoredElement(doc, 'div', { 'data-control': 'custom' }, [created.element])
      if (created.element.getAttribute('data-xh-part') === 'control') {
        this.#placeInField(row, custom)
        return row
      }
      setAttributes(element, { 'role': 'group', 'aria-labelledby': label.id })
      element.append(label, custom, hint, error)
      return row
    }
    element.append(createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'property-line' }, [
      label,
      createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-control': 'unsupported' }, [descriptor.control.kind]),
    ]), hint, error)
    return row
  }

  /** 把控件放进 xh-field：标签、说明与错误换成字段的部件，由字段接到控件上。 */
  #placeInField(row: Row, control: HTMLElement): void {
    const doc = this.ownerDocument
    const label = createAuthoredElement(doc, 'label', { 'data-xh-part': 'label' })
    setAttributes(row.hint, { 'data-scope': undefined, 'data-part': undefined, 'id': undefined, 'data-xh-part': 'description' })
    setAttributes(row.error, { 'data-scope': undefined, 'data-part': undefined, 'id': undefined, 'data-xh-part': 'error-text' })
    const field = createAuthoredElement(doc, 'xh-field', {}, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [label, control, row.hint, row.error])])
    row.element.append(field)
    Object.assign(row, { field, label })
  }

  #message(row: Row, targets: readonly DesignerPropertyTarget[]): string | undefined {
    if (row.localError !== undefined)
      return row.localError
    const key = formatJsonPath(row.descriptor.path)
    return this.errors?.find(error =>
      targets.some(target => target.kind === error.target.kind && target.id === error.target.id)
      && formatJsonPath(error.path) === key)?.message
  }

  #context(row: Row, targets: readonly DesignerPropertyTarget[]): FieldContext {
    const descriptor = row.descriptor
    const values = targets.map(target => getJsonAt(target.value, descriptor.path))
    const mixed = values.some(value => !jsonEquals(value, values[0]))
    const refs = targets.map(({ kind, id }) => ({ kind, id }))
    const merge = `property:${formatJsonPath(descriptor.path)}:${refs.map(ref => `${ref.kind}/${ref.id}`).join(',')}`
    return {
      ownerDocument: this.ownerDocument,
      value: mixed ? undefined : values[0],
      descriptor,
      target: targets,
      readonly: this.readonly,
      mixed,
      translations: this.#t,
      optionLabel: option => this.optionLabel?.(descriptor, option) ?? option.label ?? String(option.value),
      unitLabel: unit => this.unitLabel?.(unit) ?? unit,
      toggleLimit: this.toggleLimit ?? 0,
      dataFields: this.dataFields,
      setValue: (value) => {
        if (!this.readonly)
          emitEvent(this, 'property-change', { path: descriptor.path, value, targets: refs, merge })
      },
      commit: () => {
        if (!this.readonly)
          emitEvent(this, 'property-commit', { path: descriptor.path })
      },
      setLocalError: (message) => {
        if (row.localError === message)
          return
        row.localError = message
        this.#refresh(row, this.targets ?? [])
      },
    }
  }

  #refresh(row: Row, targets: readonly DesignerPropertyTarget[]): void {
    const descriptor = row.descriptor
    setText(row.label, this.labelOf?.(descriptor) ?? descriptor.label ?? formatJsonPath(descriptor.path))
    const hint = this.hintOf?.(descriptor)
    setText(row.hint, hint ?? '')
    row.hint.hidden = hint === undefined
    const message = this.#message(row, targets)
    setText(row.error, message ?? '')
    if (row.field) {
      row.field.toggleAttribute('invalid', message !== undefined)
      row.field.toggleAttribute('required', descriptor.required === true)
      row.field.toggleAttribute('read-only', this.readonly)
    }
    else {
      row.error.hidden = message === undefined
      row.label.toggleAttribute('data-required', descriptor.required === true)
      if (row.element.getAttribute('role') === 'group') {
        const described = [hint === undefined ? '' : row.hint.id, message === undefined ? '' : row.error.id].filter(Boolean).join(' ')
        setAttributes(row.element, { 'aria-describedby': described || undefined })
      }
    }
    row.element.toggleAttribute('data-invalid', message !== undefined)
    row.control.update?.(this.#context(row, targets))
  }

  /** 换了分组方式：丢掉现有的分组与字段，下一次全部重建。 */
  #clear(): void {
    for (const row of this.#rows.values())
      row.control.destroy?.()
    this.#rows.clear()
    this.#groups.clear()
    this.#accordion = undefined
    this.#parts?.groups.replaceChildren()
  }
}

function plainContext(context: FieldContext, targets: readonly DesignerPropertyTarget[]): PropertyEditorContext<DesignerPropertyDescriptor, readonly DesignerPropertyTarget[]> {
  return {
    value: context.value,
    descriptor: context.descriptor,
    target: targets,
    readonly: context.readonly,
    setValue: context.setValue,
    commit: context.commit,
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-properties': XhDesignerPropertiesElement
  }
}
