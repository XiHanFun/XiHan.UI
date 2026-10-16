/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 属性面板的内建编辑器：七种内建编辑方式各用一个库内字段元素，放在 <xh-field> 里作为它的 control 部件；
// 标签、说明、错误、必填、只读与无效由字段接到控件真正可聚焦的部件上。

import type { JsonValue } from '@xihan-ui/core/json'
import type { PropertyControl, PropertyDescriptor, PropertyEditorContext, PropertyOption } from '@xihan-ui/designer-kit/properties'
import type { DesignerPropertiesTranslations } from '../translations'
import { jsonEquals } from '@xihan-ui/core/json'
import { createAuthoredElement, setText } from '@xihan-ui/web-components/authoring'

/** 内建编辑器在通用上下文之外拿到的东西。 */
export interface FieldContext extends PropertyEditorContext<PropertyDescriptor<{ readonly kind: string }>, unknown> {
  readonly ownerDocument: Document
  /** 各对象取值不同。 */
  readonly mixed: boolean
  /** 面板的文案：取值不同时的占位、编辑框自己发现的错误。 */
  readonly translations: DesignerPropertiesTranslations
  readonly optionLabel: (option: PropertyOption) => string
  readonly unitLabel: (unit: string) => string
  /** select 单选且选项不超过它时改用切换按钮组；0 不用。 */
  readonly toggleLimit: number
  /** 报告编辑框自己发现的错误（如文字不是 JSON），undefined 表示没有。 */
  readonly setLocalError: (message: string | undefined) => void
}

/** 内建编辑器实例：element 是放进字段的 control 部件。 */
export interface FieldInstance {
  readonly element: HTMLElement
  readonly update: (context: FieldContext) => void
}

type FieldEditor = (context: FieldContext) => FieldInstance

/** 库内字段元素上受控的值。 */
interface ControlElement extends HTMLElement {
  value?: unknown
  checked?: boolean
  autoSize?: unknown
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
}

/** 按编辑方式取内建编辑器；不是内建种类时为 undefined。 */
export function builtinEditor(kind: string): FieldEditor | undefined {
  return Object.hasOwn(EDITORS, kind) ? EDITORS[kind as PropertyControl['kind']] : undefined
}

function controlOf<K extends PropertyControl['kind']>(context: FieldContext): Extract<PropertyControl, { kind: K }> {
  return context.descriptor.control as Extract<PropertyControl, { kind: K }>
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

function numberEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const control = controlOf<'number'>(initial)
  const increment = createAuthoredElement(doc, 'button', { 'data-xh-part': 'increment-trigger', 'type': 'button' })
  const suffix = createAuthoredElement(doc, 'span', { 'data-xh-part': 'suffix' })
  const box = createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [
    createAuthoredElement(doc, 'button', { 'data-xh-part': 'decrement-trigger', 'type': 'button' }),
    createAuthoredElement(doc, 'input', { 'data-xh-part': 'input' }),
    increment,
  ])
  const field: ControlElement = createAuthoredElement(doc, 'xh-number-field', {
    'data-xh-part': 'control',
    'size': 'sm',
    'min': control.min,
    'max': control.max,
    'step': control.step ?? (control.integer ? 1 : undefined),
  }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [box])])
  let context = initial
  const unitText = (): string => (control.unit === undefined ? '' : context.unitLabel(control.unit))
  const bound = (value: number): string => {
    const unit = unitText()
    return unit === '' ? String(value) : `${value} ${unit}`
  }
  /** 违反的约束；合法时为 undefined。 */
  const problem = (value: number): string | undefined => {
    const t = context.translations
    if (control.integer && !Number.isInteger(value))
      return t.notInteger
    if (control.exclusiveMin !== undefined && value <= control.exclusiveMin)
      return t.notAboveMinimum(bound(control.exclusiveMin))
    if (control.min !== undefined && value < control.min)
      return t.belowMinimum(bound(control.min))
    if (control.max !== undefined && value > control.max)
      return t.aboveMaximum(bound(control.max))
    return undefined
  }
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
    const message = problem(valueAsNumber)
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
    const unit = unitText()
    if (unit === '') {
      suffix.remove()
    }
    else {
      setText(suffix, unit)
      if (suffix.parentElement !== box)
        box.insertBefore(suffix, increment)
    }
    placeholder(field, next, undefined)
    const target = next.mixed ? undefined : next.value
    if (!first && jsonEquals(target, seen))
      return
    first = false
    seen = target
    const shown = typeof field.value === 'string' ? field.value : ''
    const same = target === undefined ? shown.trim() === '' : shown.trim() !== '' && Number(shown) === target
    if (!same) {
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

function selectEditor(initial: FieldContext): FieldInstance {
  const control = controlOf<'select'>(initial)
  if (!control.multiple && initial.toggleLimit > 0 && control.options.length <= initial.toggleLimit)
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
  const keysOf = (value: JsonValue | undefined): string[] => {
    const values = control.multiple ? (Array.isArray(value) ? value : []) : value === undefined ? [] : [value]
    return values.flatMap((item) => {
      const index = options.findIndex(option => option.value === item)
      return index < 0 ? [] : [String(index)]
    })
  }
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
    const keys = next.mixed ? [] : keysOf(next.value)
    const current = Array.isArray(field.value) ? field.value as string[] : []
    if (current.length !== keys.length || current.some((key, index) => key !== keys[index]))
      field.value = keys
  }
  update(initial)
  return { element: field, update }
}

function toggleEditor(initial: FieldContext): FieldInstance {
  const doc = initial.ownerDocument
  const options: readonly PropertyOption[] = controlOf<'select'>(initial).options
  const items = options.map((_, index) => createAuthoredElement(doc, 'button', { 'data-xh-part': 'item', 'type': 'button', 'value': String(index) }))
  const field: ControlElement = createAuthoredElement(doc, 'xh-toggle-group', { 'data-xh-part': 'control', 'size': 'sm' }, [
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, items),
  ])
  let context = initial
  field.addEventListener('value-change', (event) => {
    event.stopPropagation()
    const { value } = (event as CustomEvent<{ value: string | string[] | null }>).detail
    const key = Array.isArray(value) ? value[0] : value
    field.value = key ?? []
    context.setValue(key === undefined || key === null ? undefined : options[Number(key)]!.value)
    context.commit()
  })
  const update = (next: FieldContext): void => {
    context = next
    options.forEach((option, index) => {
      const text = next.optionLabel(option)
      if (items[index]!.textContent !== text)
        items[index]!.textContent = text
    })
    const index = next.mixed ? -1 : options.findIndex(option => option.value === next.value)
    const key = index < 0 ? [] : String(index)
    if (JSON.stringify(field.value ?? []) !== JSON.stringify(key))
      field.value = key
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
