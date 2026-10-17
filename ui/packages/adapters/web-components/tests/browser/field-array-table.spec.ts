// field-array 的表格排布：表头与各行共用一套轨道，同一列左右边缘对齐，定宽的列取到给定的宽；
// 放进字段时表格本体拿到字段的标签，不在字段里时宿主上的 aria-label 转给它；axe 不报表格结构问题；新增一行后行号与对齐照旧。
import type { XhFieldArrayElement } from '../../src/elements/field-array'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

const COLUMNS = [
  { id: 'date', label: '日期', width: 120 },
  { id: 'amount', label: '金额', width: '8rem' },
  { id: 'note', label: '备注' },
]

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function row(index: number): string {
  const cells = COLUMNS.map(column => `<div data-xh-part="item-cell" value="${column.id}"><input aria-label="${column.label} ${index + 1}"></div>`).join('')
  return `<div data-xh-part="item"><span data-xh-part="item-label">${index + 1}</span>${cells}<div data-xh-part="item-action"><button data-xh-part="item-delete-trigger"></button></div></div>`
}

function ARRAY(attrs: string) {
  return `
  <xh-field-array layout="table" ${attrs}>
    <div data-xh-part="root">
      <div data-xh-part="table">
        <div data-xh-part="header">${COLUMNS.map(column => `<div data-xh-part="column-header" value="${column.id}"></div>`).join('')}</div>
        ${row(0)}${row(1)}
      </div>
      <button data-xh-part="add-trigger">添加一行</button>
    </div>
  </xh-field-array>`
}

async function mount(markup: string): Promise<XhFieldArrayElement> {
  document.body.innerHTML = `<div style="inline-size: 640px">${markup}</div>`
  const el = document.querySelector<XhFieldArrayElement>('xh-field-array')!
  el.columns = COLUMNS
  el.defaultValue = [{}, {}]
  el.createItem = () => ({})
  // 行节点归作者：值变了按行数补行
  el.addEventListener('value-change', (event) => {
    const value = (event as CustomEvent<{ value: unknown[] }>).detail.value
    const table = el.querySelector('[data-xh-part="table"]')!
    for (let i = table.querySelectorAll('[data-xh-part="item"]').length; i < value.length; i++)
      table.insertAdjacentHTML('beforeend', row(i))
  })
  await settle()
  return el
}

const all = (part: string): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope="field-array"][data-part="${part}"]`)]

function expectAligned(): void {
  const headers = all('column-header')
  for (const item of all('item')) {
    const cells = [...item.querySelectorAll<HTMLElement>('[data-part="item-cell"]')]
    cells.forEach((cell, i) => {
      const a = headers[i]!.getBoundingClientRect()
      const b = cell.getBoundingClientRect()
      expect(Math.abs(a.left - b.left)).toBeLessThan(0.5)
      expect(Math.abs(a.right - b.right)).toBeLessThan(0.5)
    })
  }
}

const IN_FIELD = `<xh-field><div data-xh-part="root"><label data-xh-part="label">费用明细</label>${ARRAY('')}</div></xh-field>`

describe('field-array 表格排布', () => {
  it('表头与各行同一列左右边缘对齐，定宽的列取到给定的宽，列头留空时由元素填入列的 label', async () => {
    await mount(IN_FIELD)
    const headers = all('column-header')
    expect(headers.map(el => el.textContent)).toEqual(['日期', '金额', '备注'])
    expect(headers[0]!.getBoundingClientRect().width).toBeCloseTo(120, 0)
    expectAligned()
  })

  it('角色与行号：table / row / rowheader / cell，表头算第 1 行；表格本体拿到字段的标签；axe 不报结构问题', async () => {
    await mount(IN_FIELD)
    const table = all('table')[0]!
    expect(table.getAttribute('role')).toBe('table')
    expect(all('root')[0]!.hasAttribute('role')).toBe(false)
    const label = document.querySelector<HTMLElement>('[data-scope="field"][data-part="label"]')!
    expect(table.getAttribute('aria-labelledby')?.split(/\s+/)).toContain(label.id)
    expect(all('header')[0]!.getAttribute('aria-rowindex')).toBe('1')
    expect(all('item').map(el => [el.getAttribute('role'), el.getAttribute('aria-rowindex')])).toEqual([['row', '2'], ['row', '3']])
    expect(all('item-label')[0]!.getAttribute('role')).toBe('rowheader')
    expect(all('item-action')[0]!.getAttribute('role')).toBe('cell')
    expect(all('root')[0]!.lastElementChild).toBe(all('add-trigger')[0])
    const { violations } = await runAxe(document.body)
    expect(violations.map(v => v.id)).toEqual([])
  })

  it('不在字段里：宿主上的 aria-label 转给表格本体', async () => {
    await mount(ARRAY('aria-label="同行人员"'))
    expect(all('table')[0]!.getAttribute('aria-label')).toBe('同行人员')
  })

  it('新增一行：行号接在后面，同一列仍然对齐', async () => {
    await mount(IN_FIELD)
    await userEvent.click(all('add-trigger')[0]!)
    await settle()
    expect(all('item').map(el => el.getAttribute('aria-rowindex'))).toEqual(['2', '3', '4'])
    expect(all('table')[0]!.getAttribute('aria-rowcount')).toBe('4')
    expectAligned()
  })
})
