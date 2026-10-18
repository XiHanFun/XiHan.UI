// 属性面板的选项表在真实布局与真实键盘、指针下：落在某一项某一格的问题标在那一格的控件上，读屏名、aria-invalid 与描述都落在那里；
// 新增一项后焦点落到它的值上；上移、下移、删除与新增都能只用键盘完成；窄的属性面板里各格看得见、页面不横向溢出。
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerPropertiesEventMap, DesignerPropertyTarget, XhDesignerPropertiesElement } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let panel: XhDesignerPropertiesElement | null = null

afterEach(() => {
  panel?.remove()
  panel = null
})

async function until(check: () => boolean): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 2000)
      throw new Error('等了 2 秒仍没到期望的状态')
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

function target(options: JsonValue): DesignerPropertyTarget {
  return {
    kind: 'field',
    id: 'f1',
    value: { data: { options } },
    descriptors: [{ path: ['data', 'options'], control: { kind: 'options' }, label: 'Options' }],
  }
}

/** 挂一个 280px 宽的属性面板，选项写回时照样换上新值，像设计器那样。 */
async function mount(options: JsonValue, errors: readonly { path: (string | number)[], message: string }[] = []): Promise<JsonValue[]> {
  const element = document.createElement('xh-designer-properties')
  element.style.inlineSize = '280px'
  element.targets = [target(options)]
  element.errors = errors.map(error => ({ target: { kind: 'field', id: 'f1' }, ...error }))
  const written: JsonValue[] = []
  element.addEventListener('property-change', (event) => {
    const { value } = (event as DesignerPropertiesEventMap['property-change']).detail
    written.push(value ?? null)
    element.targets = [target(value ?? [])]
  })
  document.body.append(element)
  panel = element
  await element.updateComplete
  await until(() => element.querySelectorAll('[data-part="item-cell"] input').length > 0 || !Array.isArray(options) || options.length === 0)
  return written
}

/** 控件的可及描述：aria-describedby 指向的各节点的文字。 */
function description(element: Element): string {
  return (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean).map(id => document.getElementById(id)?.textContent?.trim() ?? '').filter(Boolean).join(' ')
}

describe('属性面板的选项表', () => {
  it('第 3 项的值出错：问题标在第 3 行值那一格的输入框上，读屏名、aria-invalid 与描述都落在那里，属性那一行下面不重复', async () => {
    await mount([{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: '', label: 'C' }], [
      { path: ['data', 'options', 2, 'value'], message: 'The value is required' },
    ])
    const input = page.getByRole('textbox', { name: 'Value, option 3' }).element()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(description(input)).toContain('The value is required')
    const others = Array.from(panel!.querySelectorAll('[data-part="item-cell"] input')).filter(item => item !== input)
    expect(others.map(item => item.getAttribute('aria-invalid'))).not.toContain('true')
    const row = panel!.querySelector('[data-part="property"][data-path="data.options"]')!
    const rowError = row.querySelector(':scope > xh-field > [data-xh-part="error-text"], :scope > xh-field [data-scope="field"][data-part="error-text"]:not(xh-field-array *)')
    expect(rowError === null || (rowError as HTMLElement).hidden || rowError.textContent === '').toBe(true)
    const message = Array.from(panel!.querySelectorAll('[data-part="item-cell"] *')).find(node => node.textContent === 'The value is required' && node.children.length === 0)!
    expect(message.checkVisibility()).toBe(true)
  })

  it('点「新增」加一项，焦点落到它的值上；键盘把它上移、删掉，再用键盘新增', async () => {
    const written = await mount([{ value: 'a' }, { value: 'b' }])
    const add = panel!.querySelector<HTMLElement>('[data-scope="field-array"][data-part="add-trigger"]')!
    await userEvent.click(add)
    await until(() => document.activeElement === page.getByRole('textbox', { name: 'Value, option 3' }).element())
    expect(written.at(-1)).toEqual([{ value: 'a' }, { value: 'b' }, { value: '' }])
    await userEvent.keyboard('c')
    expect(written.at(-1)).toEqual([{ value: 'a' }, { value: 'b' }, { value: 'c' }])

    const moveUp = panel!.querySelectorAll<HTMLElement>('[data-scope="field-array"][data-part="move-up-trigger"]')[2]!
    moveUp.focus()
    await userEvent.keyboard('{Enter}')
    await until(() => JSON.stringify(written.at(-1)) === JSON.stringify([{ value: 'a' }, { value: 'c' }, { value: 'b' }]))
    expect(page.getByRole('textbox', { name: 'Value, option 2' }).element()).toHaveProperty('value', 'c')

    const remove = panel!.querySelectorAll<HTMLElement>('[data-scope="field-array"][data-part="item-delete-trigger"]')[0]!
    remove.focus()
    await userEvent.keyboard('{Enter}')
    await until(() => JSON.stringify(written.at(-1)) === JSON.stringify([{ value: 'c' }, { value: 'b' }]))

    add.focus()
    await userEvent.keyboard('{Enter}')
    await until(() => JSON.stringify(written.at(-1)) === JSON.stringify([{ value: 'c' }, { value: 'b' }, { value: '' }]))
  })

  it('280px 的面板里每格的控件看得见、有宽度，页面不横向溢出', async () => {
    await mount([{ value: 'beijing', label: 'Beijing', disabled: true }, { value: 'shanghai', label: 'Shanghai' }])
    for (const name of ['Value, option 1', 'Label, option 1', 'Value, option 2', 'Label, option 2']) {
      const box = page.getByRole('textbox', { name }).element().getBoundingClientRect()
      expect(box.width, name).toBeGreaterThan(40)
    }
    await expect.element(page.getByRole('checkbox', { name: 'Disabled, option 1' })).toBeChecked()
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
  })
})
