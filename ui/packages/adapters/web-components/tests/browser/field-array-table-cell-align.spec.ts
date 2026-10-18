// xh-field-array 表格排布里一行的格子落在同一条中线上：格子与行头、把手一样至少占一条控件高并在里面居中，
// 控件高按这一行字段的尺寸档取；复选框、开关这类比控件矮的放进去，也和文本框的控件同一条中线。
import type { XhFieldArrayElement } from '../../src/elements/field-array'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

const COLUMNS = [
  { id: 'name', label: '变量名', minWidth: 120 },
  { id: 'required', label: '必填', width: 64 },
  { id: 'enabled', label: '启用', width: 72 },
]

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(size: 'sm' | 'md' | 'lg'): Promise<HTMLElement> {
  document.body.innerHTML = `
    <div style="inline-size: 480px">
      <xh-field-array layout="table" aria-label="启动变量">
        <div data-xh-part="root">
          <div data-xh-part="table">
            <div data-xh-part="header">${COLUMNS.map(column => `<div data-xh-part="column-header" value="${column.id}"></div>`).join('')}</div>
            <div data-xh-part="item">
              <span data-xh-part="item-label">1</span>
              <div data-xh-part="item-cell" value="name"><xh-text-field size="${size}" aria-label="变量名"></xh-text-field></div>
              <div data-xh-part="item-cell" value="required"><xh-checkbox size="${size}" aria-label="必填"></xh-checkbox></div>
              <div data-xh-part="item-cell" value="enabled"><xh-switch size="${size}" aria-label="启用"></xh-switch></div>
              <div data-xh-part="item-action"><button data-xh-part="item-delete-trigger"></button></div>
            </div>
          </div>
        </div>
      </xh-field-array>
    </div>`
  const el = document.querySelector<XhFieldArrayElement>('xh-field-array')!
  el.columns = COLUMNS
  el.defaultValue = [{}]
  await settle()
  return document.querySelector<HTMLElement>('[data-scope="field-array"][data-part="item"]')!
}

function middle(el: Element): number {
  const rect = el.getBoundingClientRect()
  return rect.top + rect.height / 2
}

function part(row: HTMLElement, scope: string, name: string): HTMLElement {
  return row.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!
}

/** 语义尺寸令牌在元素上解到的像素值。 */
function tokenPx(token: string, scope: Element): number {
  const probe = document.createElement('div')
  probe.style.blockSize = `var(${token})`
  scope.append(probe)
  const value = probe.getBoundingClientRect().height
  probe.remove()
  return value
}

describe('xh-field-array 表格格子的中线', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`${size} 档：文本框、复选框、开关、行头与把手落在同一条中线上，相差不超过 1px`, async () => {
      const row = await mount(size)
      const line = middle(part(row, 'text-field', 'control'))
      const others = {
        checkbox: middle(part(row, 'checkbox', 'root')),
        switch: middle(part(row, 'switch', 'root')),
        label: middle(part(row, 'field-array', 'item-label')),
        action: middle(part(row, 'field-array', 'item-delete-trigger')),
      }
      for (const [name, value] of Object.entries(others))
        expect(Math.abs(value - line), name).toBeLessThanOrEqual(1)
    })
  }

  it('格子至少占一条这一行字段那一档的控件高（加上格内衬），复选框那一格不比文本框那一格矮', async () => {
    const row = await mount('sm')
    const control = part(row, 'text-field', 'control').getBoundingClientRect().height
    expect(control).toBeCloseTo(tokenPx('--xh-control-h-sm', row), 0)
    const cells = [...row.querySelectorAll<HTMLElement>('[data-scope="field-array"][data-part="item-cell"]')]
    const heights = cells.map(cell => cell.getBoundingClientRect().height)
    for (const height of heights)
      expect(height).toBeCloseTo(heights[0]!, 0)
    const style = getComputedStyle(cells[1]!)
    expect(heights[1]! - Number.parseFloat(style.paddingBlockStart) - Number.parseFloat(style.paddingBlockEnd)).toBeGreaterThanOrEqual(control - 0.5)
  })
})
