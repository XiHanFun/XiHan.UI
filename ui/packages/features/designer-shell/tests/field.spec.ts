// @vitest-environment jsdom

import type { JsonValue } from '@xihan-ui/core/json'
import type { PropertyFieldState } from '../src'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, describe, expect, it } from 'vitest'
import { createPropertyField, defineDesignerShell } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
})

function emit(target: Element, type: string, detail: unknown): void {
  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
}

function mountField(control: Parameters<typeof createPropertyField>[0]['control'], state: PropertyFieldState, extra: Partial<Parameters<typeof createPropertyField>[0]> = {}) {
  const values: (JsonValue | undefined)[] = []
  let commits = 0
  const field = createPropertyField({
    ownerDocument: document,
    control,
    label: 'Width',
    setValue: value => void values.push(value),
    commit: () => void commits++,
    ...extra,
  }, state)
  document.body.append(field.element)
  return { field, values, commits: () => commits }
}

describe('createPropertyField', () => {
  it('建出与属性面板同一套的一行：控件放进 xh-field，单位后缀、就地校验不派发，合法值与失焦照常写入与封口', () => {
    const { field, values, commits } = mountField({ kind: 'number', min: 0, unit: 'mm', step: 0.1 }, { value: 2 }, { unitLabel: unit => (unit === 'mm' ? '毫米' : unit), required: true })
    const xhField = field.element.querySelector('xh-field')!
    const number = field.element.querySelector<HTMLElement & { value?: string }>('xh-number-field')!
    expect([field.element.dataset.part, xhField.querySelector('[data-xh-part="label"]')!.textContent, xhField.hasAttribute('required')]).toEqual(['property', 'Width', true])
    expect([number.value, number.querySelector('[data-xh-part="suffix"]')!.textContent]).toEqual(['2', '毫米'])

    emit(number, 'value-change', { value: '-1', valueAsNumber: -1 })
    expect([values, xhField.hasAttribute('invalid'), xhField.querySelector('[data-xh-part="error-text"]')!.textContent]).toEqual([[], true, 'Must be at least 0 毫米'])
    emit(number, 'value-change', { value: '3', valueAsNumber: 3 })
    number.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    expect([values, commits(), xhField.hasAttribute('invalid')]).toEqual([[3], 1, false])
  })

  it('update 换状态：外面给的错误与说明，多个值时留空并显示占位，只读时字段只读、不写入', () => {
    const { field, values } = mountField({ kind: 'text' }, { value: 'a' })
    const text = field.element.querySelector<HTMLElement & { value?: string }>('xh-text-field')!
    field.update({ value: 'b', error: 'Required', hint: 'Shown on the label' })
    const xhField = field.element.querySelector('xh-field')!
    expect([text.value, xhField.querySelector('[data-xh-part="error-text"]')!.textContent, xhField.querySelector('[data-xh-part="description"]')!.textContent]).toEqual(['b', 'Required', 'Shown on the label'])
    field.update({ value: undefined, mixed: true })
    expect([text.value, text.getAttribute('placeholder'), xhField.hasAttribute('invalid')]).toEqual(['', 'Multiple values', false])
    field.update({ value: 'c', readonly: true })
    emit(text, 'value-change', { value: 'd' })
    expect([xhField.hasAttribute('read-only'), values]).toEqual([true, []])
  })

  it('sides 这类一组控件整行是 role=group，标题经 aria-labelledby 接上', () => {
    const { field, values } = mountField({ kind: 'sides', min: 0 }, { value: { top: 1, right: 1, bottom: 1, left: 1 } })
    expect(field.element.getAttribute('role')).toBe('group')
    expect(document.getElementById(field.element.getAttribute('aria-labelledby')!)!.textContent).toBe('Width')
    emit(field.element.querySelector('xh-number-field')!, 'value-change', { value: '2', valueAsNumber: 2 })
    expect(values).toEqual([{ top: 2, right: 2, bottom: 2, left: 2 }])
  })

  it('文案取字段所在位置的配置，translations 再压在上面', () => {
    setXhConfig(designerShellZhCN)
    const { field } = mountField({ kind: 'number', integer: true, min: 0 }, { value: 1 }, { translations: { notInteger: '要填整数' } })
    const number = field.element.querySelector('xh-number-field')!
    const error = (): string | null => field.element.querySelector('[data-xh-part="error-text"]')!.textContent
    emit(number, 'value-change', { value: '-1', valueAsNumber: -1 })
    expect(error()).toBe('不能小于 0')
    emit(number, 'value-change', { value: '1.5', valueAsNumber: 1.5 })
    expect(error()).toBe('要填整数')
  })

  it('只认内建的编辑方式，别的种类抛 TypeError', () => {
    expect(() => createPropertyField({ ownerDocument: document, control: { kind: 'stroke' } as never, label: 'x', setValue: () => {}, commit: () => {} }, { value: undefined })).toThrow(TypeError)
  })
})
