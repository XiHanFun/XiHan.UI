// 复合编辑器把里层的问题标到子项上（运行时册「复合编辑器里的字段」的写法）：宿主编辑器每个子项用 createPropertyField
// 拼一行，把落在那一项的问题交给它的 error；子项控件的读屏名仍是子项自己的标题，aria-invalid 与错误文字的描述落在那一项上，
// 行下不重复；问题清掉后收回。axe 没有违规。
import type { DesignerPropertyEditor, PropertyField, XhDesignerPropertiesElement } from '../../src'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createPropertyField, defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let panel: XhDesignerPropertiesElement | undefined

afterEach(() => {
  panel?.remove()
  panel = undefined
})

/** 选项表：每个选项一行文本字段，标题「选项 N」；落在 [i, 'label'] 的问题交给第 i 行的 error。 */
const optionTable: DesignerPropertyEditor = (initial) => {
  let context = initial
  const element = document.createElement('div')
  let fields: PropertyField[] = []
  const labels = (): unknown[] => Array.isArray(context.value) ? context.value : []
  const render = (): void => {
    if (fields.length !== labels().length) {
      fields = labels().map((_, index) => createPropertyField({
        ownerDocument: document,
        control: { kind: 'text' },
        label: `选项 ${index + 1}`,
        setValue: () => {},
        commit: () => {},
      }, { value: undefined }))
      element.replaceChildren(...fields.map(field => field.element))
    }
    fields.forEach((field, index) => field.update({
      value: (labels()[index] as { label?: string } | undefined)?.label,
      error: context.issues.find(issue => issue.path[0] === index && issue.path[1] === 'label')?.message,
      readonly: context.readonly,
    }))
  }
  render()
  return { element, nestedIssues: true, update: (next) => {
    context = next
    render()
  } }
}

describe('复合编辑器的里层问题（Chromium）', () => {
  it('第 3 项的问题落在第 3 项的控件上：读屏名不变、aria-invalid 与描述接上，行下不重复；清掉后收回', async () => {
    panel = document.createElement('xh-designer-properties')
    panel.style.inlineSize = '320px'
    panel.editors = { byControl: { 'option-table': optionTable } }
    panel.targets = [{
      kind: 'field',
      id: 'f1',
      value: { options: [{ label: '是' }, { label: '否' }, { label: '' }] },
      descriptors: [{ path: ['options'], control: { kind: 'option-table' }, label: '选项' }],
    }]
    panel.errors = [{ target: { kind: 'field', id: 'f1' }, path: ['options', 2, 'label'], message: '选项文字不能为空' }]
    document.body.append(panel)
    await panel.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))

    const third = page.getByRole('textbox', { name: '选项 3' })
    await expect.element(third).toHaveAttribute('aria-invalid', 'true')
    await expect.element(third).toHaveAccessibleDescription('选项文字不能为空')
    await expect.element(page.getByRole('textbox', { name: '选项 1' })).not.toHaveAttribute('aria-invalid', 'true')
    const row = panel.querySelector<HTMLElement>('[data-part="property"][data-path="options"]')!
    const rowError = row.querySelector<HTMLElement>(':scope > [data-part="property-error"]')
    expect(rowError === null || rowError.hidden || rowError.textContent === '').toBe(true)
    await expectNoAxeViolations(panel)

    panel.errors = []
    await panel.updateComplete
    await expect.element(third).not.toHaveAttribute('aria-invalid', 'true')
  })
})
