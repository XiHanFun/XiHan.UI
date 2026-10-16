// 属性面板在真实 Chromium 里：数字字段在真实输入与失焦下的约束（开区间下限拦住不派发，越出上限的值失焦时夹回端点）；
// 没有编辑器的占位与宿主编辑器的外包不当字段控件，必填、只读、报错时 axe 也没有违规。
import type { DesignerPropertiesEventMap, XhDesignerPropertiesElement } from '../../src'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '../../style.css'

defineDesignerShell()

let panel: XhDesignerPropertiesElement | undefined

afterEach(() => {
  panel?.remove()
  panel = undefined
})

async function mount(): Promise<{ changes: unknown[], input: (path: string) => HTMLInputElement, error: (path: string) => string | undefined }> {
  panel = document.createElement('xh-designer-properties')
  panel.targets = [{
    kind: 'column',
    id: 'c1',
    value: { width: 80, span: 2 },
    descriptors: [
      { path: ['width'], control: { kind: 'number', exclusiveMin: 0 }, label: 'Width' },
      { path: ['span'], control: { kind: 'number', integer: true, min: 1, max: 4 }, label: 'Span' },
    ],
  }]
  const changes: unknown[] = []
  panel.addEventListener('property-change', event => changes.push((event as DesignerPropertiesEventMap['property-change']).detail.value))
  document.body.append(panel)
  await panel.updateComplete
  const row = (path: string): HTMLElement => panel!.querySelector<HTMLElement>(`[data-part="property"][data-path="${path}"]`)!
  return {
    changes,
    input: path => row(path).querySelector('input')!,
    error: (path) => {
      const field = row(path).querySelector('xh-field')!
      return field.hasAttribute('invalid') ? field.querySelector('[data-xh-part="error-text"]')!.textContent! : undefined
    },
  }
}

describe('属性面板的数字约束（Chromium）', () => {
  it('不大于开区间下限时就地报错、不派发，失焦后框里保留输入', async () => {
    const { changes, input, error } = await mount()
    await userEvent.clear(input('width'))
    await userEvent.type(input('width'), '0')
    expect(error('width')).toBe('Must be greater than 0')
    await userEvent.tab()
    expect([input('width').value, error('width')]).toEqual(['0', 'Must be greater than 0'])
    expect(changes).toEqual([undefined])
  })

  it('越出上限的值输入时报错，失焦时夹回上限并派发、错误清掉', async () => {
    const { changes, input, error } = await mount()
    await userEvent.clear(input('span'))
    await userEvent.type(input('span'), '7')
    expect(error('span')).toBe('Must be at most 4')
    await userEvent.tab()
    expect([input('span').value, error('span')]).toEqual(['4', undefined])
    expect(changes.at(-1)).toBe(4)
  })

  it('没有编辑器的占位与宿主编辑器的外包不当字段控件：必填、只读、报错时 axe 也没有违规', async () => {
    panel = document.createElement('xh-designer-properties')
    panel.readonly = true
    panel.editors = { byControl: { picker: () => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = 'Choose people'
      return { element: button }
    } } }
    panel.targets = [{
      kind: 'task',
      id: 't1',
      value: {},
      descriptors: [
        { path: ['who'], control: { kind: 'assignees' }, label: 'Assignees', required: true },
        { path: ['owner'], control: { kind: 'picker' }, label: 'Owner', required: true },
      ],
    }]
    panel.errors = [
      { target: { kind: 'task', id: 't1' }, path: ['who'], message: 'Required' },
      { target: { kind: 'task', id: 't1' }, path: ['owner'], message: 'Required' },
    ]
    document.body.append(panel)
    await panel.updateComplete
    for (const name of ['unsupported', 'custom']) {
      const placeholder = panel.querySelector(`[data-control="${name}"]`)!
      expect(placeholder.getAttributeNames().filter(attribute => attribute.startsWith('aria-') || attribute === 'id')).toEqual([])
    }
    await expectNoAxeViolations(panel)
  })
})
