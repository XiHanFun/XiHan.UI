/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 独立的属性字段：按一种内建编辑方式建出一行字段（标签、控件、说明与错误），给复合编辑器拼装。
// 控件、单位、就地校验与文案都和属性面板里的同一套。

import type { JsonValue } from '@xihan-ui/core/json'
import type { DataField } from '@xihan-ui/designer-kit'
import type { PropertyControl, PropertyIssue, PropertyOption } from '@xihan-ui/designer-kit/properties'
import type { DesignerPropertiesTranslations } from '../translations'
import type { FieldContext, FieldInstance } from './editors'
import { createCounterIdGenerator } from '@xihan-ui/core'
import { resolveXhConfig } from '@xihan-ui/web-components'
import { builtinEditor } from './editors'
import { createFieldRow, placeAsGroup, placeInField, refreshFieldRow } from './field-row'

/** 属性面板与独立字段的缺省文案（英文）；配置里 xh-designer-properties 那一桶压在它上面。 */
export const DEFAULT_PROPERTIES_TRANSLATIONS: DesignerPropertiesTranslations = {
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
  customColor: 'Custom color',
  optionColumns: { value: 'Value', label: 'Label', disabled: 'Disabled' },
  optionCell: (column, row) => `${column}, option ${row}`,
  optionBoolean: { true: 'Yes', false: 'No' },
}

/** createPropertyField 的选项：建好后不再变的部分。 */
export interface PropertyFieldOptions {
  readonly ownerDocument: Document
  /** 内建的编辑方式。 */
  readonly control: PropertyControl
  /** 字段的标题。 */
  readonly label: string
  /** 必填：标题带必填标记，select 与颜色不带清空钮。 */
  readonly required?: boolean
  /** 写入新值，undefined 表示清除；复合编辑器通常在这里拼出整个值，再交给自己的 setValue。 */
  readonly setValue: (value: JsonValue | undefined) => void
  /** 一次编辑结束（失焦、改选、切换）。 */
  readonly commit: () => void
  /** select 选项的文案，缺省取 option.label，再缺省取值本身。 */
  readonly optionLabel?: (option: PropertyOption) => string
  /** number 与 sides 后缀的单位文案，缺省原样显示，空串时不显示。 */
  readonly unitLabel?: (unit: string) => string
  /** dataField 的描述没写 fields 时用的字段树；两处都没有时 dataField 是输入字段路径的文本框。 */
  readonly dataFields?: readonly DataField[]
  /** select 的 appearance 为 auto、单选且选项不超过它时改用切换按钮组；缺省不用。 */
  readonly toggleLimit?: number
  /** 压在配置文案之上的文案。 */
  readonly translations?: Partial<DesignerPropertiesTranslations>
}

/** 字段此刻的状态：每次 update 整份给。 */
export interface PropertyFieldState {
  readonly value: JsonValue | undefined
  /** 标题；给了就换掉建字段时的 label（如切换语言后）。 */
  readonly label?: string
  readonly readonly?: boolean
  /** 多个对象取值不同：字段留空，显示占位「多个值」。 */
  readonly mixed?: boolean
  /** 字段下面的说明。 */
  readonly hint?: string
  /** 外面给的错误（如校验问题的文案）；控件自己发现的错误（如数字越界）优先显示。 */
  readonly error?: string
  /** 落在这个字段值里层的问题，路径相对字段的值；四边这类有子项的编辑方式按它标出对应的一项。行下的文字仍取 error。 */
  readonly issues?: readonly PropertyIssue[]
}

/** 一个独立的属性字段。 */
export interface PropertyField {
  /** 放进复合编辑器的一行：控件在 xh-field 里；sides 这类一组控件时整行是 role=group。 */
  readonly element: HTMLElement
  readonly update: (state: PropertyFieldState) => void
}

/**
 * 按内建编辑方式建一个字段。数字的上下限与单位、JSON 与字段路径的写法这些就地校验，以及空值、多个值与只读，
 * 都和属性面板里的同一套；文案取字段所在位置的配置（xh-designer-properties 那一桶），再压上 translations。
 * 只认内建的编辑方式，别的种类抛 TypeError。
 */
export function createPropertyField(options: PropertyFieldOptions, initial: PropertyFieldState): PropertyField {
  const editor = builtinEditor(options.control.kind)
  if (editor === undefined)
    throw new TypeError(`[xh] createPropertyField 只认内建的编辑方式，${options.control.kind} 不是`)
  const doc = options.ownerDocument
  const row = createFieldRow(doc, createCounterIdGenerator('xh-designer-field'))
  const descriptor = { path: [], control: options.control, label: options.label, ...(options.required ? { required: true } : {}) }
  let state = initial
  let localError: string | undefined
  let instance: FieldInstance | undefined

  const translations = (): DesignerPropertiesTranslations => {
    const bucket = (resolveXhConfig(row.element).translations as Readonly<Record<string, Partial<DesignerPropertiesTranslations> | undefined>> | undefined)?.['xh-designer-properties']
    const out: Record<string, unknown> = { ...DEFAULT_PROPERTIES_TRANSLATIONS }
    for (const layer of [bucket, options.translations]) {
      for (const [key, value] of Object.entries(layer ?? {})) {
        if (value !== undefined)
          out[key] = value
      }
    }
    return out as unknown as DesignerPropertiesTranslations
  }
  const context = (): FieldContext => ({
    ownerDocument: doc,
    value: state.mixed ? undefined : state.value,
    descriptor,
    target: undefined,
    issues: state.issues ?? [],
    readonly: state.readonly === true,
    mixed: state.mixed === true,
    translations: translations(),
    optionLabel: options.optionLabel ?? (option => option.label ?? String(option.value)),
    unitLabel: options.unitLabel ?? (unit => unit),
    toggleLimit: options.toggleLimit ?? 0,
    dataFields: options.dataFields,
    setValue: (value) => {
      if (state.readonly !== true)
        options.setValue(value)
    },
    commit: () => {
      if (state.readonly !== true)
        options.commit()
    },
    setLocalError: (message) => {
      if (localError === message)
        return
      localError = message
      refresh()
    },
  })
  function refresh(): void {
    refreshFieldRow(row, {
      label: state.label ?? options.label,
      hint: state.hint,
      error: localError ?? state.error,
      required: options.required === true,
      readonly: state.readonly === true,
    })
    instance?.update(context())
  }

  instance = editor(context())
  if (instance.group)
    placeAsGroup(row, instance.element)
  else
    placeInField(doc, row, instance.element)
  refresh()
  return {
    element: row.element,
    update: (next) => {
      state = next
      refresh()
    },
  }
}
