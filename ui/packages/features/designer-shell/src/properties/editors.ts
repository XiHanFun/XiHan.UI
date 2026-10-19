/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 属性面板的内建编辑器：每种内建编辑方式用库内元素。多数是一个字段元素，放在 <xh-field> 里作为它的 control 部件，
// 标签、说明、错误、必填、只读与无效由字段接到控件真正可聚焦的部件上；四边（sides）是一组控件，整行按组排。

import type { JsonObject, JsonValue } from '@xihan-ui/core/json'
import type { DataField, DataFieldKind } from '@xihan-ui/designer-kit'
import type { PropertyControl, PropertyDescriptor, PropertyEditorContext, PropertyNumberConstraints, PropertyOption, PropertyOptionValueType, PropertySide } from '@xihan-ui/designer-kit/properties'
import type { FilterField, FilterParameter } from '@xihan-ui/viz'
import type { DesignerPropertiesTranslations } from '../translations'
import { formatJsonPath, isJsonPathText, isPlainObject, jsonEquals } from '@xihan-ui/core/json'
import { createIdAllocator, listDataFields, listFilterFields } from '@xihan-ui/designer-kit'
import { PROPERTY_SIDES } from '@xihan-ui/designer-kit/properties'
import { createAuthoredElement, setAttributes, setText } from '@xihan-ui/web-components/authoring'
import { placeChildren } from '../internal/dom'

/** 属性面板生成的部件都带这个 data-scope，样式只认它。 */
export const PROPERTIES_SCOPE = 'designer-properties'

/** 内建编辑器在通用上下文之外拿到的东西。 */
export interface FieldContext extends PropertyEditorContext<PropertyDescriptor<{ readonly kind: string }>, unknown> {
  readonly ownerDocument: Document
  /** 各对象取值不同。 */
  readonly mixed: boolean
  /** 面板的文案：取值不同时的占位、编辑框自己发现的错误。 */
  readonly translations: DesignerPropertiesTranslations
  readonly optionLabel: (option: PropertyOption) => string
  readonly unitLabel: (unit: string) => string
  /** select 的 appearance 为 auto、单选且选项不超过它时改用切换按钮组；0 不用。 */
  readonly toggleLimit: number
  /** 面板给的字段树：dataField 的描述没写 fields 时用它；两处都没有时 dataField 是输入路径的文本框。 */
  readonly dataFields: readonly DataField[] | undefined
  /** 报告编辑框自己发现的错误（如文字不是 JSON），undefined 表示没有。 */
  readonly setLocalError: (message: string | undefined) => void
}

/**
 * 内建编辑器实例：element 是放进字段的 control 部件；group 为 true 时它是一组控件，整行按组排、不进字段。
 * nestedIssues 为 true 时编辑器自己把里层的问题标到子项上，行下不重复。
 */
export interface FieldInstance {
  readonly element: HTMLElement
  readonly update: (context: FieldContext) => void
  readonly group?: boolean
  readonly nestedIssues?: boolean
}

type FieldEditor = (context: FieldContext) => FieldInstance

/** 库内字段元素上受控的值。 */
interface ControlElement extends HTMLElement {
  value?: unknown
  checked?: boolean
  autoSize?: unknown
}

/** 树选择上受控的数据、值与展开集合。 */
interface TreeSelectControl extends ControlElement {
  collection?: TreeSelectItem[]
  expandedValue?: string[]
}

/** 树选择的一个节点。 */
interface TreeSelectItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
  children?: TreeSelectItem[]
}

/** 格式输入上受控的格式说明与选项。 */
interface FormatControl extends HTMLElement {
  value?: JsonValue | null
  kinds?: readonly string[]
  clearable?: boolean
  mixed?: boolean
}

/** 条件编辑器上受控的条件树与选项。 */
interface FilterControl extends HTMLElement {
  value?: JsonValue
  readonly currentValue?: JsonValue | null
  fields?: readonly FilterField[]
  parameters?: readonly FilterParameter[]
  maxDepth?: number
  createId?: (kind: 'condition' | 'group') => string
  translations?: { readonly empty?: string }
}

type ValueChange<T> = CustomEvent<{ value: T }>

const EDITORS: Readonly<Record<PropertyControl['kind'], FieldEditor>> = {
  text: textEditor,
  number: numberEditor,
  boolean: booleanEditor,
  select: selectEditor,
  tags: tagsEditor,
  color: colorEditor,
  json: jsonEditor,
  dataField: dataFieldEditor,
  sides: sidesEditor,
  format: formatEditor,
  filter: filterEditor,
  swatch: swatchEditor,
  options: optionsEditor,
}

/** 按编辑方式取内建编辑器；不是内建种类时为 undefined。 */
export function builtinEditor(kind: string): FieldEditor | undefined {
  return Object.hasOwn(EDITORS, kind) ? EDITORS[kind as PropertyControl['kind']] : undefined
}

function controlOf<K extends PropertyControl['kind']>(context: FieldContext): Extract<PropertyControl, { kind: K }> {
  return context.descriptor.control as Extract<PropertyControl, { kind: K }>
}

/** 空的条件树：没写取值或多个对象取值不同时显示它。 */
const EMPTY_FILTER: JsonValue = { logic: 'and', conditions: [] }

/** 条件树里已有的 id：新节点按前缀取未用的号。 */
function filterIds(node: JsonValue | null | undefined, out: string[] = []): string[] {
  if (!isPlainObject(node))
    return out
  if (typeof node.id === 'string')
    out.push(node.id)
  if (Array.isArray(node.conditions)) {
    for (const child of node.conditions)
      filterIds(child, out)
  }
  return out
}

/** 条件编辑器的字段：描述写了 fields 就用它，没写时由面板的字段树按 listFilterFields 列出值字段。 */
export function filterFieldsOf(control: { readonly fields?: readonly FilterField[] }, panel: readonly DataField[] | undefined): readonly FilterField[] {
  return control.fields ?? (panel === undefined ? [] : listFilterFields(panel))
}

/**
 * 条件树：库内 xh-filter-builder，参数与嵌套层数取描述；一次增删改就是一步，写入即封口。
 * ids 为 true 时新建的条件与组按 c1、g1 这样取树里没用过的 id。多个对象取值不同时显示空树，空态写「多个值」，
 * 在上面加的条件整体写给这几个对象。
 */
function filterEditor(initial: FieldContext): FieldInstance {
  const control = controlOf<'filter'>(initial)
  const field: FilterControl = createAuthoredElement(initial.ownerDocument, 'xh-filter-builder', { 'data-xh-part': 'control', 'size': 'sm' })
  if (control.parameters !== undefined)
    field.parameters = control.parameters
  if (control.maxDepth !== undefined)
    field.maxDepth = control.maxDepth
  if (control.ids === true)
    field.createId = kind => createIdAllocator(kind === 'condition' ? 'c' : 'g', filterIds(field.currentValue)).next()
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as ValueChange<JsonValue>).detail
    field.value = value
    context.setValue(value)
    context.commit()
  })
  let source: readonly DataField[] | undefined
  let fields: readonly FilterField[] | undefined
  const update = (next: FieldContext): void => {
    context = next
    // 字段树没换时沿用上一份清单
    if (fields === undefined || (control.fields === undefined && next.dataFields !== source)) {
      source = next.dataFields
      fields = filterFieldsOf(control, source)
      field.fields = fields
    }
    const empty = next.mixed ? next.translations.mixed : undefined
    if (field.translations?.empty !== empty)
      field.translations = empty === undefined ? undefined : { empty }
    const value = !next.mixed && isPlainObject(next.value) ? next.value : EMPTY_FILTER
    if (field.value === undefined || !jsonEquals(field.value, value))
      field.value = value
  }
  update(initial)
  return { element: field, update }
}

function textOf(value: JsonValue | undefined): string {
  if (value === undefined || value === null)
    return ''
  return typeof value === 'string' ? value : JSON.stringify(value)
}

/** 取值不同时把占位换成「多个值」，否则用编辑方式自己的占位。 */
function placeholder(field: HTMLElement, context: FieldContext, own: string | undefined): void {
  const text = context.mixed ? context.translations.mixed : own
  if (text === undefined)
    field.removeAttribute('placeholder')
  else if (field.getAttribute('placeholder') !== text)
    field.setAttribute('placeholder', text)
}

function textEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const control = controlOf<'text'>(initial)
  if (control.secret)
    return secretEditor(initial)
  const input = createAuthoredElement(doc, control.multiline ? 'textarea' : 'input', { 'data-xh-part': 'input' })
  const field: ControlElement = createAuthoredElement(doc, 'xh-text-field', { 'data-xh-part': 'control', 'size': 'sm' }, [
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [input])]),
  ])
  if (control.multiline)
    field.autoSize = { minRows: 2, maxRows: 6 }
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as ValueChange<string>).detail
    field.value = value
    context.setValue(value === '' ? undefined : value)
  })
  field.addEventListener('focusout', () => context.commit())
  const update = (next: FieldContext): void => {
    context = next
    placeholder(field, next, control.placeholder)
    const value = next.mixed ? '' : textOf(next.value)
    if (field.value !== value)
      field.value = value
  }
  update(initial)
  return { element: field, update }
}

/** 密钥这类文字：库内 xh-password-input，缺省不显示明文，浏览器不代填也不记住。 */
function secretEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const control = controlOf<'text'>(initial)
  const field: ControlElement = createAuthoredElement(doc, 'xh-password-input', { 'data-xh-part': 'control', 'size': 'sm', 'auto-complete': 'off' }, [
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }),
  ])
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as ValueChange<string>).detail
    field.value = value
    context.setValue(value === '' ? undefined : value)
  })
  field.addEventListener('focusout', () => context.commit())
  const update = (next: FieldContext): void => {
    context = next
    placeholder(field, next, control.placeholder)
    const value = next.mixed ? '' : textOf(next.value)
    if (field.value !== value)
      field.value = value
  }
  update(initial)
  return { element: field, update }
}

/** 一个数字框：库内 xh-number-field，带约束的上下限与步长，单位放在 suffix；给了 label 时它是框上方的标题。 */
interface NumberBox {
  readonly field: ControlElement
  readonly input: HTMLElement
  /** 换单位文案，空串时撤掉 suffix。 */
  readonly setUnit: (unit: string) => void
}

function numberBox(doc: Document, constraints: PropertyNumberConstraints, part: string | undefined, label?: HTMLElement): NumberBox {
  const input = createAuthoredElement(doc, 'input', { 'data-xh-part': 'input' })
  const increment = createAuthoredElement(doc, 'button', { 'data-xh-part': 'increment-trigger', 'type': 'button' })
  const suffix = createAuthoredElement(doc, 'span', { 'data-xh-part': 'suffix' })
  const box = createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [
    createAuthoredElement(doc, 'button', { 'data-xh-part': 'decrement-trigger', 'type': 'button' }),
    input,
    increment,
  ])
  const field: ControlElement = createAuthoredElement(doc, 'xh-number-field', {
    'data-xh-part': part,
    'size': 'sm',
    'min': constraints.min,
    'max': constraints.max,
    'step': constraints.step ?? (constraints.integer ? 1 : undefined),
  }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, label ? [label, box] : [box])])
  const setUnit = (unit: string): void => {
    if (unit === '') {
      suffix.remove()
      return
    }
    setText(suffix, unit)
    if (suffix.parentElement !== box)
      box.insertBefore(suffix, increment)
  }
  return { field, input, setUnit }
}

/** 数字违反的约束，依次看整数、开区间下限、下限与上限；合法时为 undefined。 */
function numberProblem(constraints: PropertyNumberConstraints, value: number, context: FieldContext): string | undefined {
  const t = context.translations
  const unit = constraints.unit === undefined ? '' : context.unitLabel(constraints.unit)
  const bound = (limit: number): string => (unit === '' ? String(limit) : `${limit} ${unit}`)
  if (constraints.integer && !Number.isInteger(value))
    return t.notInteger
  if (constraints.exclusiveMin !== undefined && value <= constraints.exclusiveMin)
    return t.notAboveMinimum(bound(constraints.exclusiveMin))
  if (constraints.min !== undefined && value < constraints.min)
    return t.belowMinimum(bound(constraints.min))
  if (constraints.max !== undefined && value > constraints.max)
    return t.aboveMaximum(bound(constraints.max))
  return undefined
}

/** 框里的文字与这个值一致：没有值时框里为空，有值时框里的数等于它。 */
function showsNumber(field: ControlElement, value: JsonValue | undefined): boolean {
  const shown = typeof field.value === 'string' ? field.value.trim() : ''
  return value === undefined ? shown === '' : shown !== '' && Number(shown) === value
}

function numberEditor(initial: FieldContext): FieldInstance {
  const control = controlOf<'number'>(initial)
  const { field, setUnit } = numberBox(initial.ownerDocument, control, 'control')
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value, valueAsNumber } = (event as CustomEvent<{ value: string, valueAsNumber: number }>).detail
    field.value = value
    if (value.trim() === '') {
      context.setLocalError(undefined)
      context.setValue(undefined)
      return
    }
    if (!Number.isFinite(valueAsNumber))
      return
    const message = numberProblem(control, valueAsNumber, context)
    context.setLocalError(message)
    if (message === undefined)
      context.setValue(valueAsNumber)
  })
  field.addEventListener('focusout', () => context.commit())
  // 上一次从对象里读到的值：没变就保留框里的文字（哪怕违反约束），变了才按新值重写
  let seen: JsonValue | undefined
  let first = true
  const update = (next: FieldContext): void => {
    context = next
    setUnit(control.unit === undefined ? '' : next.unitLabel(control.unit))
    placeholder(field, next, undefined)
    const target = next.mixed ? undefined : next.value
    if (!first && jsonEquals(target, seen))
      return
    first = false
    seen = target
    if (!showsNumber(field, target)) {
      field.value = textOf(target)
      next.setLocalError(undefined)
    }
  }
  update(initial)
  return { element: field, update }
}

function booleanEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const field: ControlElement = createAuthoredElement(doc, 'xh-switch', { 'data-xh-part': 'control', 'size': 'sm' }, [
    createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [createAuthoredElement(doc, 'span', { 'data-xh-part': 'thumb' })]),
  ])
  let context = initial
  field.addEventListener('checked-change', (event) => {
    const { checked } = (event as CustomEvent<{ checked: boolean }>).detail
    field.checked = checked
    context.setValue(checked)
    context.commit()
  })
  const update = (next: FieldContext): void => {
    context = next
    const checked = !next.mixed && next.value === true
    if (field.checked !== checked)
      field.checked = checked
    field.toggleAttribute('data-mixed', next.mixed)
  }
  update(initial)
  return { element: field, update }
}

/** 取值在 options 里的下标（字段元素的 value 用下标串）；对不上的值略过。 */
function optionKeys(control: Extract<PropertyControl, { kind: 'select' }>, value: JsonValue | undefined): string[] {
  const values = control.multiple ? (Array.isArray(value) ? value : []) : value === undefined ? [] : [value]
  return values.flatMap((item) => {
    const index = control.options.findIndex(option => option.value === item)
    return index < 0 ? [] : [String(index)]
  })
}

/** appearance 为 toggle 时用切换按钮组，dropdown 时用下拉；auto 时单选且选项不超过 toggleLimit 才用切换按钮组。 */
function selectEditor(initial: FieldContext): FieldInstance {
  const control = controlOf<'select'>(initial)
  const appearance = control.appearance ?? 'auto'
  if (appearance === 'toggle' || (appearance === 'auto' && !control.multiple && initial.toggleLimit > 0 && control.options.length <= initial.toggleLimit))
    return toggleEditor(initial)
  const doc = initial.ownerDocument
  const options: readonly PropertyOption[] = control.options
  const box: HTMLElement[] = [createAuthoredElement(doc, 'button', { 'data-xh-part': 'trigger', 'type': 'button' }, [
    createAuthoredElement(doc, 'span', { 'data-xh-part': 'value-text' }),
    createAuthoredElement(doc, 'span', { 'data-xh-part': 'indicator' }),
  ])]
  if (!initial.descriptor.required)
    box.push(createAuthoredElement(doc, 'button', { 'data-xh-part': 'clear-trigger', 'type': 'button' }))
  const texts = options.map(() => createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-text' }))
  const items = options.map((_, index) => createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'value': String(index) }, [
    texts[index]!,
    createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-indicator' }),
  ]))
  const field: ControlElement = createAuthoredElement(doc, 'xh-select', { 'data-xh-part': 'control', 'size': 'sm', 'multiple': control.multiple === true }, [
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, box),
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'list' }, items)])]),
    ]),
  ])
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const keys = (event as ValueChange<string[]>).detail.value
    field.value = keys
    const values = keys.map(key => options[Number(key)]!.value)
    context.setValue(control.multiple ? (values.length === 0 ? undefined : values) : values[0])
    context.commit()
  })
  const update = (next: FieldContext): void => {
    context = next
    options.forEach((option, index) => {
      const text = next.optionLabel(option)
      if (texts[index]!.textContent !== text)
        texts[index]!.textContent = text
    })
    placeholder(field, next, undefined)
    const keys = next.mixed ? [] : optionKeys(control, next.value)
    const current = Array.isArray(field.value) ? field.value as string[] : []
    if (current.length !== keys.length || current.some((key, index) => key !== keys[index]))
      field.value = keys
  }
  update(initial)
  return { element: field, update }
}

function toggleEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const control = controlOf<'select'>(initial)
  const options: readonly PropertyOption[] = control.options
  const multiple = control.multiple === true
  const items = options.map((_, index) => createAuthoredElement(doc, 'button', { 'data-xh-part': 'item', 'type': 'button', 'value': String(index) }))
  const field: ControlElement = createAuthoredElement(doc, 'xh-toggle-group', { 'data-xh-part': 'control', 'size': 'sm', 'multiple': multiple }, [
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, items),
  ])
  /** 单选时字段元素的 value 是一个下标串，没选时为空数组；多选时是下标串数组。 */
  const shown = (keys: readonly string[]): string | readonly string[] => (multiple ? keys : keys[0] ?? [])
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as CustomEvent<{ value: string | string[] | null }>).detail
    const keys = Array.isArray(value) ? value : value === null ? [] : [value]
    field.value = shown(keys)
    const values = keys.map(key => options[Number(key)]!.value)
    context.setValue(multiple ? (values.length === 0 ? undefined : values) : values[0])
    context.commit()
  })
  const update = (next: FieldContext): void => {
    context = next
    options.forEach((option, index) => {
      const text = next.optionLabel(option)
      if (items[index]!.textContent !== text)
        items[index]!.textContent = text
    })
    const target = shown(next.mixed ? [] : optionKeys(control, next.value))
    if (JSON.stringify(field.value ?? []) !== JSON.stringify(target))
      field.value = target
  }
  update(initial)
  return { element: field, update }
}

function tagsEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const input = createAuthoredElement(doc, 'input', { 'data-xh-part': 'input' })
  const box = createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [input])
  const field: ControlElement = createAuthoredElement(doc, 'xh-tags-input', { 'data-xh-part': 'control', 'size': 'sm' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [box])])
  const render = (tags: readonly string[]): void => {
    const alive = new Map<string, Element>()
    for (const item of Array.from(box.querySelectorAll('[data-xh-part="item"]')))
      alive.set(item.getAttribute('value') ?? '', item)
    for (const [value, item] of alive) {
      if (!tags.includes(value))
        item.remove()
    }
    for (const tag of tags) {
      if (alive.has(tag))
        continue
      box.insertBefore(createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'value': tag }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'item-preview' }, [
          createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-text' }, [tag]),
          createAuthoredElement(doc, 'button', { 'data-xh-part': 'item-delete-trigger', 'type': 'button' }),
        ]),
      ]), input)
    }
  }
  const tagsOf = (value: JsonValue | undefined): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const tags = (event as ValueChange<string[]>).detail.value
    field.value = tags
    render(tags)
    context.setValue(tags.length === 0 ? undefined : tags)
    context.commit()
  })
  const update = (next: FieldContext): void => {
    context = next
    placeholder(field, next, undefined)
    const tags = next.mixed ? [] : tagsOf(next.value)
    const current = Array.isArray(field.value) ? field.value as string[] : []
    if (current.length !== tags.length || current.some((tag, index) => tag !== tags[index])) {
      field.value = tags
      render(tags)
    }
  }
  update(initial)
  return { element: field, update }
}

function colorEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const box: HTMLElement[] = [createAuthoredElement(doc, 'span', { 'data-xh-part': 'swatch' }), createAuthoredElement(doc, 'input', { 'data-xh-part': 'input' })]
  if (!initial.descriptor.required)
    box.push(createAuthoredElement(doc, 'button', { 'data-xh-part': 'clear-trigger', 'type': 'button' }))
  const field: ControlElement = createAuthoredElement(doc, 'xh-color-field', { 'data-xh-part': 'control', 'size': 'sm' }, [
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, box)]),
  ])
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as ValueChange<string>).detail
    field.value = value
    context.setValue(value === '' ? undefined : value)
    context.commit()
  })
  const update = (next: FieldContext): void => {
    context = next
    placeholder(field, next, '#rrggbb')
    const value = !next.mixed && typeof next.value === 'string' ? next.value : ''
    if (field.value !== value)
      field.value = value
  }
  update(initial)
  return { element: field, update }
}

/** 色板上受控的格子与选中的颜色串。 */
interface SwatchControl extends HTMLElement {
  value?: string
  swatches?: { value: string, label?: string }[]
}

/**
 * 颜色预设：库内 xh-color-swatch-picker 一格一项，格子画选项的 color，选中写入选项的 value；
 * custom 为 true 时下面另有一个颜色框，填任意颜色，取值不在选项里时显示在这里、色板不选中任何一格。整组按一组控件排。
 */
function swatchEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const control = controlOf<'swatch'>(initial)
  const picker: SwatchControl = createAuthoredElement(doc, 'xh-color-swatch-picker', { size: 'sm' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' })])
  picker.swatches = control.options.map(option => ({ value: option.color, ...(option.label === undefined ? {} : { label: option.label }) }))
  const custom: ControlElement | undefined = control.custom
    ? createAuthoredElement(doc, 'xh-color-field', { size: 'sm' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [
          createAuthoredElement(doc, 'span', { 'data-xh-part': 'swatch' }),
          createAuthoredElement(doc, 'input', { 'data-xh-part': 'input' }),
        ])]),
      ])
    : undefined
  const element = createAuthoredElement(doc, 'div', { 'data-scope': PROPERTIES_SCOPE, 'data-part': 'swatch' }, custom ? [picker, custom] : [picker])
  let context = initial
  picker.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as ValueChange<string | null>).detail
    const option = control.options.find(item => item.color === value)
    if (!option)
      return
    picker.value = option.color
    if (custom)
      custom.value = ''
    context.setValue(option.value)
    context.commit()
  })
  custom?.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as ValueChange<string>).detail
    custom.value = value
    if (value === '')
      return
    picker.value = ''
    context.setValue(value)
    context.commit()
  })
  const update = (next: FieldContext): void => {
    context = next
    const label = next.descriptor.label
    setAttributes(picker, { 'aria-label': label })
    picker.toggleAttribute('read-only', next.readonly)
    const option = next.mixed ? undefined : control.options.find(item => item.value === next.value)
    const color = option?.color ?? ''
    if (picker.value !== color)
      picker.value = color
    if (custom) {
      setAttributes(custom, { 'aria-label': next.translations.customColor })
      custom.toggleAttribute('read-only', next.readonly)
      placeholder(custom, next, '#rrggbb')
      const text = !next.mixed && !option && typeof next.value === 'string' ? next.value : ''
      if (custom.value !== text)
        custom.value = text
    }
  }
  update(initial)
  return { element, update, group: true }
}

function jsonEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const field: ControlElement = createAuthoredElement(doc, 'xh-text-field', { 'data-xh-part': 'control', 'size': 'sm', 'data-json': '' }, [
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [createAuthoredElement(doc, 'textarea', { 'data-xh-part': 'input', 'spellcheck': 'false' })])]),
  ])
  field.autoSize = { minRows: 3, maxRows: 10 }
  const format = (value: JsonValue | undefined): string => value === undefined ? '' : JSON.stringify(value, null, 2)
  const parse = (text: string): { ok: true, value: JsonValue | undefined } | { ok: false } => {
    if (text.trim() === '')
      return { ok: true, value: undefined }
    try {
      return { ok: true, value: JSON.parse(text) as JsonValue }
    }
    catch {
      return { ok: false }
    }
  }
  let context = initial
  // 上一次从对象里读到的值：没变就保留框里的文字（哪怕还不是合法 JSON），变了才按新值重写
  let seen: JsonValue | undefined = initial.mixed ? undefined : initial.value
  field.value = format(seen)
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as ValueChange<string>).detail
    field.value = value
    const parsed = parse(value)
    if (parsed.ok) {
      context.setLocalError(undefined)
      context.setValue(parsed.value)
    }
    else {
      context.setLocalError(context.translations.invalidJson)
    }
  })
  field.addEventListener('focusout', () => context.commit())
  const update = (next: FieldContext): void => {
    context = next
    placeholder(field, next, undefined)
    const value = next.mixed ? undefined : next.value
    if (!jsonEquals(value, seen)) {
      seen = value
      const shown = parse(typeof field.value === 'string' ? field.value : '')
      if (!shown.ok || !jsonEquals(shown.value, value)) {
        field.value = format(value)
        next.setLocalError(undefined)
      }
    }
  }
  update(initial)
  return { element: field, update }
}

/**
 * 字段树换成树选择的节点：按 listDataFields 列出起点之下的字段，kinds 里的种类可选；
 * 不可选的 object 留作禁用的分支，没有可选后代的字段不列。branches 收集所有分支的值。
 */
function dataFieldItems(fields: readonly DataField[], control: Extract<PropertyControl, { kind: 'dataField' }>, branches: string[]): TreeSelectItem[] {
  interface Draft {
    readonly item: TreeSelectItem
    readonly selectable: boolean
    readonly children: Draft[]
  }
  const kinds: readonly DataFieldKind[] | undefined = control.kinds
  const drafts = new Map<string, Draft>()
  const roots: Draft[] = []
  for (const entry of listDataFields(fields, control.base === undefined ? {} : { base: control.base })) {
    const label = entry.field.label ?? entry.field.name
    const draft: Draft = {
      item: { value: entry.text, label, ...(label === entry.text ? {} : { description: entry.text }) },
      selectable: kinds === undefined || kinds.includes(entry.field.kind),
      children: [],
    }
    drafts.set(entry.text, draft)
    const parent = entry.path.length > 1 ? drafts.get(formatJsonPath(entry.path.slice(0, -1))) : undefined
    if (parent)
      parent.children.push(draft)
    else
      roots.push(draft)
  }
  const build = (level: readonly Draft[]): TreeSelectItem[] => level.flatMap((draft) => {
    const children = build(draft.children)
    if (!draft.selectable && children.length === 0)
      return []
    if (children.length > 0)
      branches.push(draft.item.value)
    return [{ ...draft.item, ...(draft.selectable ? {} : { disabled: true }), ...(children.length > 0 ? { children } : {}) }]
  })
  return build(roots)
}

/** 绑定字段的字段树：描述里写了 fields 就用它，没写时用面板给的；都没有时为 undefined。 */
export function dataFieldsOf(control: { readonly kind: string, readonly fields?: readonly DataField[] }, panel: readonly DataField[] | undefined): readonly DataField[] | undefined {
  return control.fields ?? panel
}

/** 绑定字段：有字段树时是可搜索的树选择，分支起初都展开；没有时是输入路径的文本框。 */
function dataFieldEditor(initial: FieldContext): FieldInstance {
  const control = controlOf<'dataField'>(initial)
  if (dataFieldsOf(control, initial.dataFields) === undefined)
    return dataPathEditor(initial)
  const field: TreeSelectControl = createAuthoredElement(initial.ownerDocument, 'xh-tree-select', {
    'data-xh-part': 'control',
    'size': 'sm',
    'searchable': true,
    'clearable': initial.descriptor.required !== true,
  })
  let context = initial
  let fields: readonly DataField[] | undefined
  let branches: string[] = []
  const collapsed = new Set<string>()
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const [value] = (event as ValueChange<string[]>).detail.value
    field.value = value === undefined ? [] : [value]
    context.setValue(value)
    context.commit()
  })
  field.addEventListener('expanded-value-change', (event) => {
    event.stopPropagation()
    const open = (event as ValueChange<string[]>).detail.value
    field.expandedValue = open
    for (const branch of branches) {
      if (open.includes(branch))
        collapsed.delete(branch)
      else
        collapsed.add(branch)
    }
  })
  const update = (next: FieldContext): void => {
    context = next
    const source = dataFieldsOf(control, next.dataFields)
    if (source !== fields) {
      fields = source
      branches = []
      field.collection = dataFieldItems(fields ?? [], control, branches)
      field.expandedValue = branches.filter(branch => !collapsed.has(branch))
    }
    placeholder(field, next, undefined)
    const value = !next.mixed && typeof next.value === 'string' && next.value !== '' ? [next.value] : []
    // 起初就写 value，树选择从一开始就是受控的
    const current = Array.isArray(field.value) ? field.value as string[] : undefined
    if (current === undefined || current.length !== value.length || current[0] !== value[0])
      field.value = value
  }
  update(initial)
  return { element: field, update }
}

/** 没有字段树时的绑定字段：文本框里直接写字段路径，写法不对时就地报错、不派发，框里保留输入。 */
function dataPathEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const field: ControlElement = createAuthoredElement(doc, 'xh-text-field', { 'data-xh-part': 'control', 'size': 'sm' }, [
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [createAuthoredElement(doc, 'input', { 'data-xh-part': 'input', 'spellcheck': 'false' })]),
    ]),
  ])
  let context = initial
  // 上一次从对象里读到的值：没变就保留框里的文字（哪怕写法不对），变了才按新值重写
  let seen: JsonValue | undefined = initial.mixed ? undefined : initial.value
  field.value = textOf(seen)
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as ValueChange<string>).detail
    field.value = value
    const text = value.trim()
    if (text !== '' && !isJsonPathText(text)) {
      context.setLocalError(context.translations.invalidDataField)
      return
    }
    context.setLocalError(undefined)
    context.setValue(text === '' ? undefined : text)
  })
  field.addEventListener('focusout', () => context.commit())
  const update = (next: FieldContext): void => {
    context = next
    placeholder(field, next, undefined)
    const value = next.mixed ? undefined : next.value
    if (jsonEquals(value, seen))
      return
    seen = value
    const shown = typeof field.value === 'string' ? field.value.trim() : ''
    if (shown !== textOf(value)) {
      field.value = textOf(value)
      next.setLocalError(undefined)
    }
  }
  update(initial)
  return { element: field, update }
}

/** 取值里四边各自的数字，不是数字的边为 undefined。 */
function sidesOf(value: JsonValue | undefined): Readonly<Record<PropertySide, number | undefined>> {
  const sides = isPlainObject(value) ? value : {}
  return Object.fromEntries(PROPERTY_SIDES.map(side => [side, typeof sides[side] === 'number' ? sides[side] : undefined])) as Record<PropertySide, number | undefined>
}

/**
 * 四边：「四边相同」开关加一个数字框，关掉时换成上、右、下、左四个，各自带标题；四边都按描述的数值约束校验，
 * 有边没填或违反约束时就地报错、不派发。取值不同时开关禁用，只能四边一起改。
 */
function sidesEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const control = controlOf<'sides'>(initial)
  const linkText = createAuthoredElement(doc, 'span', { 'data-xh-part': 'text' })
  const link: ControlElement = createAuthoredElement(doc, 'xh-switch', { size: 'sm' }, [
    createAuthoredElement(doc, 'label', { 'data-xh-part': 'label' }, [
      createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [createAuthoredElement(doc, 'span', { 'data-xh-part': 'thumb' })]),
      linkText,
    ]),
  ])
  const all = numberBox(doc, control, undefined)
  const labels = new Map<PropertySide, HTMLElement>()
  const sides = new Map<PropertySide, NumberBox>(PROPERTY_SIDES.map((side) => {
    const label = createAuthoredElement(doc, 'label', { 'data-xh-part': 'label' })
    labels.set(side, label)
    return [side, numberBox(doc, control, undefined, label)]
  }))
  const boxes = [all, ...sides.values()]
  const fields = createAuthoredElement(doc, 'div', { 'data-scope': PROPERTIES_SCOPE, 'data-part': 'sides-fields' })
  const element = createAuthoredElement(doc, 'div', { 'data-scope': PROPERTIES_SCOPE, 'data-part': 'sides' }, [link, fields])
  let context = initial
  let linked = true
  // 自己最近一次写出的值：对象里的值等于它时是自己写入的回声，不改开关、不重写框里的文字
  let written: JsonValue | undefined
  let seen: JsonValue | undefined
  let first = true
  const write = (value: JsonValue | undefined): void => {
    written = value
    context.setValue(value)
  }
  const uniform = (value: number): JsonValue => Object.fromEntries(PROPERTY_SIDES.map(side => [side, value]))
  // 自己就地发现错误的那个框
  let local: NumberBox | undefined
  // 标出无效的框：就地发现错误的那个，加上外面的问题落在的那一边（四边相同时是那一个框）
  const paint = (): void => {
    const marked = new Set<NumberBox>()
    for (const issue of context.issues) {
      const side = issue.path[0]
      if (typeof side === 'string' && (PROPERTY_SIDES as readonly string[]).includes(side))
        marked.add(linked ? all : sides.get(side as PropertySide)!)
    }
    for (const box of boxes)
      box.field.toggleAttribute('invalid', box === local || marked.has(box))
  }
  const report = (box: NumberBox | undefined, message: string | undefined): void => {
    local = message === undefined ? undefined : box
    paint()
    context.setLocalError(message)
  }
  const layout = (): void => {
    link.checked = linked
    element.toggleAttribute('data-linked', linked)
    placeChildren(fields, linked ? [all.field] : PROPERTY_SIDES.map(side => sides.get(side)!.field))
    paint()
  }
  const fill = (value: JsonValue | undefined): void => {
    const numbers = sidesOf(value)
    all.field.value = linked ? textOf(numbers.top) : ''
    for (const side of PROPERTY_SIDES)
      sides.get(side)!.field.value = textOf(numbers[side])
  }
  all.field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value, valueAsNumber } = (event as CustomEvent<{ value: string, valueAsNumber: number }>).detail
    all.field.value = value
    if (value.trim() === '') {
      report(undefined, undefined)
      write(undefined)
      return
    }
    if (!Number.isFinite(valueAsNumber))
      return
    const message = numberProblem(control, valueAsNumber, context)
    report(all, message)
    if (message === undefined)
      write(uniform(valueAsNumber))
  })
  const writeSides = (): void => {
    const texts = PROPERTY_SIDES.map(side => String(sides.get(side)!.field.value ?? '').trim())
    if (texts.every(text => text === '')) {
      report(undefined, undefined)
      write(undefined)
      return
    }
    const value: Record<string, number> = {}
    for (const [index, side] of PROPERTY_SIDES.entries()) {
      const box = sides.get(side)!
      if (texts[index] === '') {
        report(box, context.translations.sidesIncomplete)
        return
      }
      const number = Number(texts[index])
      if (!Number.isFinite(number))
        return
      const message = numberProblem(control, number, context)
      if (message !== undefined) {
        report(box, message)
        return
      }
      value[side] = number
    }
    report(undefined, undefined)
    write(value)
  }
  for (const box of sides.values()) {
    box.field.addEventListener('value-change', (event) => {
      event.stopPropagation()
      box.field.value = (event as ValueChange<string>).detail.value
      writeSides()
    })
  }
  link.addEventListener('checked-change', (event) => {
    linked = (event as CustomEvent<{ checked: boolean }>).detail.checked
    report(undefined, undefined)
    let value = context.value
    const numbers = sidesOf(value)
    // 打开开关时四边不同就按上边统一
    if (linked && numbers.top !== undefined && PROPERTY_SIDES.some(side => numbers[side] !== numbers.top)) {
      value = uniform(numbers.top)
      write(value)
    }
    fill(value)
    layout()
    context.commit()
  })
  element.addEventListener('focusout', () => context.commit())
  const update = (next: FieldContext): void => {
    context = next
    const t = next.translations
    setText(linkText, t.sidesLinked)
    if (all.field.getAttribute('aria-label') !== t.sides.all)
      all.field.setAttribute('aria-label', t.sides.all)
    for (const side of PROPERTY_SIDES) {
      setText(labels.get(side)!, t.sides[side])
    }
    const unit = control.unit === undefined ? '' : next.unitLabel(control.unit)
    for (const box of boxes) {
      box.setUnit(unit)
      box.field.toggleAttribute('read-only', next.readonly)
    }
    link.toggleAttribute('read-only', next.readonly)
    link.toggleAttribute('disabled', next.mixed)
    placeholder(all.field, next, undefined)
    const value = next.mixed ? undefined : next.value
    if (first || !jsonEquals(value, seen)) {
      const echo = !first && jsonEquals(value, written)
      first = false
      seen = value
      if (!echo) {
        const numbers = sidesOf(value)
        linked = next.mixed || PROPERTY_SIDES.every(side => numbers[side] === numbers.top)
        fill(value)
        report(undefined, undefined)
      }
    }
    layout()
  }
  update(initial)
  return { element, update, group: true }
}

/** 格式：库内 xh-format-input，种类限在描述的 kinds；不是必填时可选「不设格式」，选它即清除。多个对象取值不同时种类显示「多个值」。 */
function formatEditor(initial: FieldContext): FieldInstance {
  const control = controlOf<'format'>(initial)
  const field: FormatControl = createAuthoredElement(initial.ownerDocument, 'xh-format-input', { 'data-xh-part': 'control', 'size': 'sm' })
  if (control.kinds !== undefined)
    field.kinds = control.kinds
  field.clearable = initial.descriptor.required !== true
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as ValueChange<JsonValue | null>).detail
    field.value = value
    context.setValue(value ?? undefined)
  })
  field.addEventListener('focusout', () => context.commit())
  const update = (next: FieldContext): void => {
    context = next
    if (field.mixed !== next.mixed)
      field.mixed = next.mixed
    const value = !next.mixed && isPlainObject(next.value) ? next.value : null
    if (field.value === undefined || !jsonEquals(field.value, value))
      field.value = value
  }
  update(initial)
  return { element: field, update }
}

/** 字段数组上受控的行与表格排布。 */
interface FieldArrayControl extends HTMLElement {
  value?: unknown[]
  readonly items?: readonly { readonly key: string, readonly value: unknown }[]
  readonly updateComplete?: Promise<unknown>
  createItem?: () => unknown
  layout?: string
  movable?: boolean
  readOnly?: boolean
  columns?: readonly { readonly id: string, readonly label?: string, readonly width?: string | number, readonly minWidth?: string | number }[]
}

/** 字段上受控的错误文案与校验态。 */
interface FieldHost extends HTMLElement {
  errorText?: string
  invalid?: boolean
}

/** 选项表的三列，也是一项里这三格写的键。 */
const OPTION_COLUMNS = ['value', 'label', 'disabled'] as const

type OptionColumn = (typeof OPTION_COLUMNS)[number]

/** 选项表的一行：每列一个字段，字段的控件是这一格的输入；不许禁用时没有禁用那一格。 */
interface OptionRow {
  readonly fields: Readonly<Partial<Record<OptionColumn, FieldHost>>>
  readonly controls: Readonly<Partial<Record<OptionColumn, ControlElement>>>
  /** 写上行 key 之后为 true。 */
  placed: boolean
}

/** 值与文字两列的最小宽：面板放不下时表格横向滚动，行号与把手钉在两侧。 */
const OPTION_TEXT_MIN_WIDTH = '5rem'

/**
 * 一列的宽：文字与按文字写的值不窄过 OPTION_TEXT_MIN_WIDTH；数字、日期与日期时间的值不窄过框的最小内容宽，
 * 整个数、整个日期都放得下；禁用那一列按内容取宽，列头一行放得下。
 */
function optionColumnWidth(column: OptionColumn, valueType: PropertyOptionValueType): { width?: string, minWidth: string } {
  if (column === 'disabled')
    return { width: 'auto', minWidth: 'max-content' }
  if (column === 'value' && valueType !== 'string' && valueType !== 'boolean')
    return { minWidth: 'min-content' }
  return { minWidth: OPTION_TEXT_MIN_WIDTH }
}

/** 还不知道行 key 时格子内容的 slot：对不上任何格子，字段数组不把它当作者写的结构。 */
const PENDING_SLOT = 'designer-option-pending'

/** 选项里某个键的文字；不是对象、没有这个键时为空串。 */
function optionText(item: JsonValue | undefined, key: 'value' | 'label'): string {
  return isPlainObject(item) ? textOf(item[key]) : ''
}

/** 改一项的一个键：value 清空、label 为空、disabled 为 false 时去掉这个键；这一项不是对象时换成只有这个键的对象。 */
function withOptionKey(item: JsonValue | undefined, key: OptionColumn, value: string | number | boolean | undefined): JsonObject {
  const next: Record<string, JsonValue> = isPlainObject(item) ? { ...item } : {}
  if (value === undefined || (key === 'label' && value === '') || (key === 'disabled' && value === false))
    delete next[key]
  else
    next[key] = value
  return next
}

/** 布尔选项固定的两行：先 true 后 false，文字与禁用取值里同一个值的那一项。 */
function booleanOptions(value: JsonValue | undefined): JsonObject[] {
  const list = Array.isArray(value) ? value : []
  return [true, false].map(flag => (list.find(item => isPlainObject(item) && item.value === flag) as JsonObject | undefined) ?? { value: flag })
}

/** 问题落在一项的哪一格：值、文字、禁用三个键落在各自那一格（没有禁用那一列时落在值上），别的键与这一项本身落在值上。 */
function optionColumnOf(path: PropertyEditorContext['issues'][number]['path'], columns: readonly OptionColumn[]): OptionColumn {
  const key = path[1]
  return (key === 'label' || key === 'disabled') && columns.includes(key) ? key : 'value'
}

/**
 * 选项列表：库内 xh-field-array 的表格排布，一项一行，三格依次是值、文字与禁用（allowDisabled 为 false 时没有禁用这一列），
 * 行号、拖动、上移下移与删除把手、新增把手由它铺出。值格按 valueType 换控件：string 文本框，number 数字框（写回数值，清空即去掉 value），
 * date / datetime 日期框（到日 / 到分）；boolean 固定 true、false 两行，值格只读、显示「是 / 否」，不能增删换序，写回时两项都写、true 在前。
 * 每格是一个字段，控件以「列名 + 第几项」为名。值与文字边输入边写入、失焦封口；勾选禁用，以及增删与换序，各是一步。
 * 新增的一项只有空的 value（数字不带 value），新增后焦点落到它的值上。文字为空、不禁用时不写这两个键，别的键（tone、description）原样留着。
 * 里层的问题按路径标到格上：[i, "value"] 等落在那一格的字段上（aria-invalid 与错误文案由字段接到控件上），
 * 落在这一项别的键上或这一项本身的标在它的值上。多个对象取值不同时没有行，新增的一项整体写给这几个对象。
 */
function optionsEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const optionsControl = controlOf<'options'>(initial)
  const columns: readonly OptionColumn[] = optionsControl.allowDisabled === false ? ['value', 'label'] : OPTION_COLUMNS
  const valueType = optionsControl.valueType ?? 'string'
  const fixed = valueType === 'boolean'
  /** 读到的值换成显示的各项：布尔固定两行，其余不是数组时没有行。 */
  const shownOf = (value: JsonValue | undefined): readonly JsonValue[] => (fixed ? booleanOptions(value) : Array.isArray(value) ? value : [])
  const array: FieldArrayControl = createAuthoredElement(doc, 'xh-field-array', { 'data-xh-part': 'control' })
  array.layout = 'table'
  // 布尔的两行不换序：拖动与上移下移把手收起
  array.movable = !fixed
  array.createItem = () => ({})
  // 面板窄：格子用表格的紧凑内衬
  array.style.setProperty('--xh-field-array-cell-px', 'var(--xh-table-cell-px-sm)')
  array.style.setProperty('--xh-field-array-cell-py', 'var(--xh-table-cell-py-sm)')
  let context = initial
  /** 显示着的选项：最近一次读到或写出的值。 */
  let options: readonly JsonValue[] = []
  /** 一项一个令牌对象，交给字段数组作行数据：它按令牌跟踪行，换序时行内容跟着走。 */
  let tokens: object[] = []
  const rows = new Map<object, OptionRow>()
  /** 删掉的行已放进格子的内容：离场的替身克隆完、回到字段数组下面后再摘掉。 */
  const departing = new Set<HTMLElement>()
  new MutationObserver(() => {
    for (const node of departing) {
      if (node.parentElement !== array)
        continue
      node.remove()
      departing.delete(node)
    }
  }).observe(array, { childList: true })

  const write = (next: readonly JsonValue[]): void => {
    options = next
    context.setValue(next.length === 0 ? undefined : [...next])
  }
  const edit = (token: object, key: OptionColumn, value: string | number | boolean | undefined): void => {
    const index = tokens.indexOf(token)
    if (index >= 0)
      write(options.map((item, at) => (at === index ? withOptionKey(item, key, value) : item)))
  }

  /** 值格的控件：按值类型换，布尔是只读的文本框。 */
  const valueControl = (token: object): ControlElement => {
    if (valueType === 'number') {
      const control: ControlElement = createAuthoredElement(doc, 'xh-number-field', { slot: 'control', size: 'sm' })
      control.addEventListener('value-change', (event) => {
        event.stopPropagation()
        const { value, valueAsNumber } = (event as CustomEvent<{ value: string, valueAsNumber: number }>).detail
        control.value = value
        if (value.trim() === '')
          edit(token, 'value', undefined)
        else if (Number.isFinite(valueAsNumber))
          edit(token, 'value', valueAsNumber)
      })
      control.addEventListener('focusout', () => context.commit())
      return control
    }
    if (valueType === 'date' || valueType === 'datetime') {
      const control: ControlElement = createAuthoredElement(doc, 'xh-date-field', { slot: 'control', size: 'sm', granularity: valueType === 'date' ? 'day' : 'minute' })
      control.addEventListener('value-change', (event) => {
        event.stopPropagation()
        const { value } = (event as ValueChange<string | null>).detail
        control.value = value
        edit(token, 'value', value ?? undefined)
      })
      control.addEventListener('focusout', () => context.commit())
      return control
    }
    const control: ControlElement = createAuthoredElement(doc, 'xh-text-field', { 'slot': 'control', 'size': 'sm', 'read-only': fixed })
    if (!fixed) {
      control.addEventListener('value-change', (event) => {
        event.stopPropagation()
        const { value } = (event as ValueChange<string>).detail
        control.value = value
        edit(token, 'value', value)
      })
      control.addEventListener('focusout', () => context.commit())
    }
    return control
  }

  const createCell = (token: object, column: OptionColumn): { field: FieldHost, control: ControlElement } => {
    const control: ControlElement = column === 'value' ? valueControl(token) : createAuthoredElement(doc, column === 'disabled' ? 'xh-checkbox' : 'xh-text-field', { slot: 'control', size: 'sm' })
    const field: FieldHost = createAuthoredElement(doc, 'xh-field', { slot: PENDING_SLOT, hidden: true }, [control])
    field.errorText = ''
    if (column === 'disabled') {
      control.addEventListener('checked-change', (event) => {
        event.stopPropagation()
        const { checked } = (event as CustomEvent<{ checked: boolean }>).detail
        control.checked = checked
        edit(token, column, checked)
        context.commit()
      })
    }
    else if (column === 'label') {
      control.addEventListener('value-change', (event) => {
        event.stopPropagation()
        const { value } = (event as ValueChange<string>).detail
        control.value = value
        edit(token, column, value)
      })
      control.addEventListener('focusout', () => context.commit())
    }
    array.append(field)
    return { field, control }
  }
  const createRow = (token: object): OptionRow => {
    const cells = columns.map(column => createCell(token, column))
    return {
      fields: Object.fromEntries(columns.map((column, index) => [column, cells[index]!.field])),
      controls: Object.fromEntries(columns.map((column, index) => [column, cells[index]!.control])),
      placed: false,
    }
  }

  /** 按令牌对上字段数组的 items，给还没写上 slot 的行写上；对不上时等它更新完再对一次。 */
  const place = (deferred: boolean): void => {
    const items = array.items ?? []
    if (items.length !== tokens.length || items.some((item, index) => item.value !== tokens[index])) {
      if (!deferred)
        void array.updateComplete?.then(() => place(true))
      return
    }
    tokens.forEach((token, index) => {
      const row = rows.get(token)
      if (row === undefined || row.placed)
        return
      for (const column of columns) {
        row.fields[column]!.setAttribute('slot', `item-cell:${items[index]!.key}:${column}`)
        row.fields[column]!.hidden = false
      }
      row.placed = true
    })
  }

  /** 按这一项与这一轮的上下文刷新一行：格里的值、控件的名字、只读，以及落在这一项的问题。 */
  const paint = (row: OptionRow, index: number): void => {
    const item = options[index]
    const t = context.translations
    const issues = context.issues.filter(issue => issue.path[0] === index)
    for (const column of columns) {
      const control = row.controls[column]!
      setAttributes(control, { 'aria-label': t.optionCell(t.optionColumns[column], index + 1) })
      control.toggleAttribute('read-only', context.readonly || (fixed && column === 'value'))
      const message = issues.find(issue => optionColumnOf(issue.path, columns) === column)?.message
      const field = row.fields[column]!
      if (field.errorText !== (message ?? ''))
        field.errorText = message ?? ''
      if (field.invalid !== (message !== undefined))
        field.invalid = message !== undefined
    }
    const checkbox = row.controls.disabled
    const checked = isPlainObject(item) && item.disabled === true
    if (checkbox && checkbox.checked !== checked)
      checkbox.checked = checked
    const label = optionText(item, 'label')
    if (row.controls.label!.value !== label)
      row.controls.label!.value = label
    const valueField = row.controls.value!
    const value = isPlainObject(item) ? item.value : undefined
    if (valueType === 'number') {
      // 框里的数与取值一致就不重写（哪怕写法不同，如 1.50），没有取值时框里为空
      if (!showsNumber(valueField, typeof value === 'number' ? value : undefined))
        valueField.value = typeof value === 'number' ? textOf(value) : ''
    }
    else if (valueType === 'date' || valueType === 'datetime') {
      const iso = typeof value === 'string' && value !== '' ? value : null
      if (valueField.value !== iso)
        valueField.value = iso
    }
    else {
      const text = fixed ? (typeof value === 'boolean' ? t.optionBoolean[value ? 'true' : 'false'] : '') : optionText(item, 'value')
      if (valueField.value !== text)
        valueField.value = text
    }
  }

  /** 按显示着的选项对行：令牌按位置截短或补齐，删掉的行连格子一起摘掉，新的行建好格子，再交给字段数组。 */
  const reconcile = (): void => {
    if (tokens.length !== options.length)
      tokens = [...tokens.slice(0, options.length), ...Array.from({ length: Math.max(0, options.length - tokens.length) }, () => ({}))]
    const alive = new Set(tokens)
    for (const [token, row] of rows) {
      if (alive.has(token))
        continue
      for (const field of Object.values(row.fields)) {
        if (row.placed && array.isConnected)
          departing.add(field)
        else
          field.remove()
      }
      rows.delete(token)
    }
    tokens.forEach((token, index) => {
      let row = rows.get(token)
      if (row === undefined) {
        row = createRow(token)
        rows.set(token, row)
      }
      paint(row, index)
    })
    if (array.value !== tokens)
      array.value = tokens
    place(false)
  }

  array.addEventListener('value-change', (event) => {
    if (event.target !== array)
      return
    event.stopPropagation()
    const { value, mutation } = (event as CustomEvent<{ value: object[], mutation?: FieldArrayMutation }>).detail
    if (mutation === undefined || mutation.type === 'replace')
      return
    const next = [...options]
    // 新增的一项：数字没有空值可写，不带 value；其余写空串，待填
    if (mutation.type === 'insert')
      next.splice(mutation.index, 0, valueType === 'number' ? {} : { value: '' })
    else if (mutation.type === 'remove')
      next.splice(mutation.index, 1)
    else
      next.splice(mutation.to, 0, ...next.splice(mutation.from, 1))
    tokens = value
    write(next)
    reconcile()
    context.commit()
    if (mutation.type === 'insert') {
      const row = rows.get(tokens[mutation.index]!)
      void array.updateComplete?.then(() => row?.controls.value!.querySelector<HTMLElement>('input, [role="spinbutton"]')?.focus())
    }
  })

  const update = (next: FieldContext): void => {
    context = next
    const t = next.translations
    if (array.columns === undefined || array.columns.some(column => column.label !== t.optionColumns[column.id as OptionColumn]))
      array.columns = columns.map(id => ({ id, label: t.optionColumns[id], ...optionColumnWidth(id, valueType) }))
    // 布尔的两行不能增删：新增与删除把手按只读铺成按不动
    array.readOnly = next.readonly || fixed
    const value = shownOf(next.mixed ? undefined : next.value)
    if (!jsonEquals(value, options)) {
      options = value
      reconcile()
      return
    }
    tokens.forEach((token, index) => paint(rows.get(token)!, index))
  }
  update(initial)
  return { element: array, update, nestedIssues: true }
}

/** 字段数组一次增删换序的载荷。 */
type FieldArrayMutation
  = | { readonly type: 'insert', readonly index: number }
    | { readonly type: 'remove', readonly index: number }
    | { readonly type: 'move', readonly from: number, readonly to: number }
    | { readonly type: 'replace', readonly length: number }
