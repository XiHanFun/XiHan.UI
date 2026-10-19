// 属性面板的选项表在真实布局与真实键盘、指针下：落在某一项某一格的问题标在那一格的控件上，读屏名、aria-invalid 与描述都落在那里；
// 新增一项后焦点落到它的值上；上移、下移、删除与新增都能只用键盘完成；窄的属性面板里各格看得见、不压到相邻的格、页面不横向溢出；
// 分组可折叠、放不下整张表时表格横向滚动，行尾把手不被裁掉。
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerPropertiesEventMap, DesignerPropertyTarget, XhDesignerPropertiesElement } from '../../src'
import { mergeXhConfig } from '@xihan-ui/web-components'
import { defineXhElement, XhConfigElement } from '@xihan-ui/web-components/define'
import { zhCN } from '@xihan-ui/web-components/locale'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page, userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import { designerShellZhCN } from '../../src/locale'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()
defineXhElement('xh-config', XhConfigElement)

let panel: XhDesignerPropertiesElement | null = null
let wrapper: HTMLElement | null = null

afterEach(() => {
  panel?.remove()
  panel = null
  wrapper?.remove()
  wrapper = null
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

/** 按住把手的中心，分八步拖到 target，松开。 */
async function drag(handle: HTMLElement, target: { x: number, y: number }): Promise<void> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  const scale = await seen
  const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
  const box = handle.getBoundingClientRect()
  const start = { x: box.left + box.width / 2, y: box.top + box.height / 2 }
  const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(start.x, start.y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(start.x, start.y) })
  for (let i = 1; i <= 8; i++) {
    await frame()
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(start.x + ((target.x - start.x) * i) / 8, start.y + ((target.y - start.y) * i) / 8) })
  }
  await frame()
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(target.x, target.y) })
  await frame()
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

  it('按住拖动把手把第 1 项拖到第 3 项之下：整份选项按新顺序写回，各格跟着行走', async () => {
    const written = await mount([{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }])
    const rows = (): HTMLElement[] => [...panel!.querySelectorAll<HTMLElement>('[data-scope="field-array"][data-part="item"]:not([data-xh-ghost])')]
    const handle = rows()[0]!.querySelector<HTMLElement>('[data-scope="field-array"][data-part="item-drag-trigger"]')!
    expect([handle.getAttribute('tabindex'), handle.getAttribute('aria-hidden')]).toEqual(['-1', 'true'])
    const last = rows()[2]!.getBoundingClientRect()
    await drag(handle, { x: last.left + last.width / 2, y: last.bottom - 4 })
    await until(() => JSON.stringify(written.at(-1)) === JSON.stringify([{ value: 'b', label: 'B' }, { value: 'c', label: 'C' }, { value: 'a', label: 'A' }]))
    await until(() => (page.getByRole('textbox', { name: 'Value, option 3' }).element() as HTMLInputElement).value === 'a')
    expect((page.getByRole('textbox', { name: 'Label, option 1' }).element() as HTMLInputElement).value).toBe('B')
  })

  it('280px 的面板里每格的控件看得见、有宽度、落在自己那一格里，页面不横向溢出', async () => {
    await mount([{ value: 'beijing', label: 'Beijing', disabled: true }, { value: 'shanghai', label: 'Shanghai' }])
    for (const name of ['Value, option 1', 'Label, option 1', 'Value, option 2', 'Label, option 2']) {
      const box = page.getByRole('textbox', { name }).element().getBoundingClientRect()
      expect(box.width, name).toBeGreaterThan(40)
    }
    await expect.element(page.getByRole('checkbox', { name: 'Disabled, option 1' })).toBeChecked()
    // 文本框的原生宽不把格里的字段撑出这一列、压到相邻的格上
    for (const cell of panel!.querySelectorAll<HTMLElement>('[data-scope="field-array"][data-part="item-cell"]')) {
      const outer = cell.getBoundingClientRect()
      const inner = cell.firstElementChild!.getBoundingClientRect()
      expect(inner.right, cell.dataset.value).toBeLessThanOrEqual(outer.right + 0.5)
    }
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
  })

  it('290px、分组可折叠、中文的面板里放不下整张选项表：表格横向滚动，行尾的拖动、上移、下移与删除把手整个落在面板里', async () => {
    const box = document.createElement('div')
    box.style.cssText = 'display: flex; inline-size: 290px; overflow: hidden'
    const scope = document.createElement('xh-config') as HTMLElement & { translations?: unknown }
    scope.translations = mergeXhConfig(zhCN, designerShellZhCN).translations
    scope.style.cssText = 'display: block; flex: 1; min-inline-size: 0'
    const element = document.createElement('xh-designer-properties')
    element.collapsible = true
    element.targets = [{
      ...target([{ value: 'beijing', label: '北京' }, { value: 'shanghai', label: '上海' }]),
      descriptors: [{ path: ['data', 'options'], control: { kind: 'options' }, label: '选项', group: 'data' }],
    }]
    scope.append(element)
    box.append(scope)
    document.body.append(box)
    wrapper = box
    await element.updateComplete
    await until(() => element.querySelectorAll('[data-part="item-cell"] input').length > 0)

    const bounds = element.getBoundingClientRect()
    const table = element.querySelector<HTMLElement>('[data-scope="field-array"][data-part="table"]')!
    expect(table.getBoundingClientRect().right).toBeLessThanOrEqual(bounds.right)
    expect(table.scrollWidth).toBeGreaterThan(table.clientWidth)
    for (const part of ['item-drag-trigger', 'move-up-trigger', 'move-down-trigger', 'item-delete-trigger']) {
      for (const handle of element.querySelectorAll(`[data-scope="field-array"][data-part="${part}"]`)) {
        const rect = handle.getBoundingClientRect()
        expect(rect.width, part).toBeGreaterThan(0)
        expect(rect.left, part).toBeGreaterThanOrEqual(bounds.left)
        expect(rect.right, part).toBeLessThanOrEqual(bounds.right)
      }
    }
  })
})
