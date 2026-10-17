// field-array 的表格排布：表头与各行共用一套轨道，同一列左右边缘对齐，定宽的列取到给定的宽；
// 放进字段时表格本体拿到字段的标签；axe 不报表格结构问题；新增一行后行号与对齐照旧。
import type { Root } from 'react-dom/client'
import { runAxe } from '@xihan-ui/testing/a11y'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayColumnHeader,
  XhFieldArrayHeader,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemCell,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayItemLabel,
  XhFieldArrayRoot,
  XhFieldArrayTable,
  XhFieldLabel,
  XhFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

const COLUMNS = [
  { id: 'date', label: '日期', width: 120 },
  { id: 'amount', label: '金额', width: '8rem' },
  { id: 'note', label: '备注' },
]

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(layout: 'table' | 'list' = 'table'): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(
      <XhFieldRoot>
        <XhFieldLabel>费用明细</XhFieldLabel>
        <XhFieldArrayRoot layout={layout} columns={COLUMNS} defaultValue={[{}, {}]} createItem={() => ({})}>
          {({ items }) => (
            <>
              <XhFieldArrayTable>
                <XhFieldArrayHeader>
                  {COLUMNS.map(column => <XhFieldArrayColumnHeader key={column.id} value={column.id} />)}
                </XhFieldArrayHeader>
                {items.map(item => (
                  <XhFieldArrayItem key={item.key} index={item.index}>
                    <XhFieldArrayItemLabel>{String(item.index + 1)}</XhFieldArrayItemLabel>
                    {COLUMNS.map(column => (
                      <XhFieldArrayItemCell key={column.id} value={column.id}>
                        <input aria-label={`${column.label} ${item.index + 1}`} />
                      </XhFieldArrayItemCell>
                    ))}
                    <XhFieldArrayItemAction><XhFieldArrayItemDeleteTrigger /></XhFieldArrayItemAction>
                  </XhFieldArrayItem>
                ))}
              </XhFieldArrayTable>
              <XhFieldArrayAddTrigger>添加一行</XhFieldArrayAddTrigger>
            </>
          )}
        </XhFieldArrayRoot>
      </XhFieldRoot>,
    )
  })
  await settle()
}

const all = (part: string): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope="field-array"][data-part="${part}"]`)]

function expectAligned(): void {
  const headers = all('column-header')
  for (const row of all('item')) {
    const cells = [...row.querySelectorAll<HTMLElement>('[data-part="item-cell"]')]
    cells.forEach((cell, i) => {
      const a = headers[i]!.getBoundingClientRect()
      const b = cell.getBoundingClientRect()
      expect(Math.abs(a.left - b.left)).toBeLessThan(0.5)
      expect(Math.abs(a.right - b.right)).toBeLessThan(0.5)
    })
  }
}

describe('field-array 表格排布', () => {
  it('表头与各行同一列左右边缘对齐，定宽的列取到给定的宽，列头没写内容时显示列的 label', async () => {
    await mount()
    const headers = all('column-header')
    expect(headers.map(el => el.textContent)).toEqual(['日期', '金额', '备注'])
    expect(headers[0]!.getBoundingClientRect().width).toBeCloseTo(120, 0)
    expectAligned()
  })

  it('角色与行号：table / row / rowheader / cell，表头算第 1 行；表格本体拿到字段的标签；axe 不报结构问题', async () => {
    await mount()
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
    const { violations } = await runAxe(host!)
    expect(violations.map(v => v.id)).toEqual([])
  })

  it('列表排布：table 部件不带角色，也不接字段的名字与描述链', async () => {
    await mount('list')
    const table = all('table')[0]!
    expect(table.hasAttribute('role')).toBe(false)
    expect(table.hasAttribute('aria-labelledby')).toBe(false)
    expect(table.hasAttribute('aria-describedby')).toBe(false)
    expect(all('header')[0]!.hidden).toBe(true)
  })

  it('新增一行：行号接在后面，同一列仍然对齐', async () => {
    await mount()
    await userEvent.click(all('add-trigger')[0]!)
    await settle()
    expect(all('item').map(el => el.getAttribute('aria-rowindex'))).toEqual(['2', '3', '4'])
    expect(all('table')[0]!.getAttribute('aria-rowcount')).toBe('4')
    expectAligned()
  })

  it('删掉一行：原处淡出的那一行与表头仍是同一套列', async () => {
    await mount()
    await userEvent.click(all('item-delete-trigger')[0]!)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    const leaving = all('item').filter(el => el.getAttribute('data-state') === 'closed')
    expect(leaving.length).toBeGreaterThan(0)
    expectAligned()
  })
})
