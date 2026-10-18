/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 一行属性的外壳：标签、说明与错误。控件放进 <xh-field> 由字段接线，或整行按一组控件排、经 aria-labelledby 接上。
// 属性面板与独立的属性字段共用这一套。

import type { IdGenerator } from '@xihan-ui/core'
import { createAuthoredElement, setAttributes, setText } from '@xihan-ui/web-components/authoring'
import { PROPERTIES_SCOPE } from './editors'

/** 一行属性的各部件；控件放进字段后 field 是那个 <xh-field>，label 换成字段的标题部件。 */
export interface FieldRow {
  readonly element: HTMLElement
  field: HTMLElement | undefined
  label: HTMLElement
  readonly hint: HTMLElement
  readonly error: HTMLElement
}

/** 刷新一行时要的东西。 */
export interface FieldRowState {
  readonly label: string
  readonly hint?: string | undefined
  readonly error?: string | undefined
  readonly required: boolean
  readonly readonly: boolean
}

/** 建一行的外壳：data-part 为 property，attrs 补在它上面（如 data-path）。 */
export function createFieldRow(doc: Document, ids: IdGenerator, attrs: Readonly<Record<string, string>> = {}): FieldRow {
  const element = createAuthoredElement(doc, 'div', { 'data-scope': PROPERTIES_SCOPE, 'data-part': 'property', ...attrs })
  const hint = createAuthoredElement(doc, 'div', { 'data-scope': PROPERTIES_SCOPE, 'data-part': 'property-hint', 'id': ids.scopeId() })
  const error = createAuthoredElement(doc, 'div', { 'data-scope': PROPERTIES_SCOPE, 'data-part': 'property-error', 'id': ids.scopeId() })
  const label = createAuthoredElement(doc, 'span', { 'data-scope': PROPERTIES_SCOPE, 'data-part': 'property-label', 'id': ids.scopeId() })
  return { element, field: undefined, label, hint, error }
}

/** 把控件放进 xh-field：标签、说明与错误换成字段的部件，由字段接到控件上。 */
export function placeInField(doc: Document, row: FieldRow, control: HTMLElement): void {
  const label = createAuthoredElement(doc, 'label', { 'data-xh-part': 'label' })
  setAttributes(row.hint, { 'data-scope': undefined, 'data-part': undefined, 'id': undefined, 'data-xh-part': 'description' })
  setAttributes(row.error, { 'data-scope': undefined, 'data-part': undefined, 'id': undefined, 'data-xh-part': 'error-text' })
  const field = createAuthoredElement(doc, 'xh-field', {}, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [label, control, row.hint, row.error])])
  row.element.append(field)
  row.field = field
  row.label = label
}

/** 整行按一组控件排：role=group，标签经 aria-labelledby 接上。 */
export function placeAsGroup(row: FieldRow, control: HTMLElement): void {
  setAttributes(row.element, { 'role': 'group', 'aria-labelledby': row.label.id })
  row.element.append(row.label, control, row.hint, row.error)
}

/** 刷新标签、说明、错误与必填、只读、无效：放进字段的交给字段，按组排的写在行上并接好 aria-describedby。 */
export function refreshFieldRow(row: FieldRow, state: FieldRowState): void {
  setText(row.label, state.label)
  setText(row.hint, state.hint ?? '')
  row.hint.hidden = state.hint === undefined
  setText(row.error, state.error ?? '')
  if (row.field) {
    row.field.toggleAttribute('invalid', state.error !== undefined)
    row.field.toggleAttribute('required', state.required)
    row.field.toggleAttribute('read-only', state.readonly)
  }
  else {
    row.error.hidden = state.error === undefined
    row.label.toggleAttribute('data-required', state.required)
    if (row.element.getAttribute('role') === 'group') {
      const described = [state.hint === undefined ? '' : row.hint.id, state.error === undefined ? '' : row.error.id].filter(Boolean).join(' ')
      setAttributes(row.element, { 'aria-describedby': described || undefined })
    }
  }
  row.element.toggleAttribute('data-invalid', state.error !== undefined)
}
