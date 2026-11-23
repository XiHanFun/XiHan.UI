// @vitest-environment jsdom
// 表格的默认全部展开与全部展开 / 收起：判据在 Headless，这里核 React 这一侧的接线——prop 透传、数据晚到、函数式 children 载荷里的两个动作。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { TableRootSlotProps } from '../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhTableRoot } from '../src'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let host: HTMLElement | null = null
let root: Root | null = null

afterEach(async () => {
  if (root)
    await act(async () => root!.unmount())
  host?.remove()
  document.body.innerHTML = ''
  root = null
  host = null
})

const COLUMNS = [{ id: 'name', label: '名称' }]
const ROWS = [
  { id: 'a' },
  { id: 'a1', parentId: 'a' },
  { id: 'a2', parentId: 'a1' },
  { id: 'note', expandable: true },
  { id: 'b' },
]

async function render(node: ReactNode): Promise<void> {
  if (!root) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  }
  await act(async () => root!.render(node))
}

function dataRows(scope: TableRootSlotProps): string[] {
  return scope.visibleRows.filter(row => row.kind === 'data').map(row => row.id)
}

describe('xhTable 的全部展开', () => {
  it('defaultExpandAll：挂上即逐层展开，不发变更回调；载荷里的 collapseAll / expandAll 照常收展', async () => {
    const onChange = vi.fn()
    let scope!: TableRootSlotProps
    await render(
      <XhTableRoot columns={COLUMNS} rows={ROWS} defaultExpandAll onExpandedValueChange={onChange}>
        {(payload) => {
          scope = payload
          return null
        }}
      </XhTableRoot>,
    )
    expect(dataRows(scope)).toEqual(['a', 'a1', 'a2', 'note', 'b'])
    expect(onChange).not.toHaveBeenCalled()

    await act(async () => scope.collapseAll())
    expect(dataRows(scope)).toEqual(['a', 'note', 'b'])

    await act(async () => scope.expandAll())
    expect(dataRows(scope)).toEqual(['a', 'a1', 'a2', 'note', 'b'])
  })

  it('数据晚到：rows 先是空的，换上数据后才展开，并发一次变更回调', async () => {
    const onChange = vi.fn()
    let scope!: TableRootSlotProps
    const view = (rows: typeof ROWS): ReactNode => (
      <XhTableRoot columns={COLUMNS} rows={rows} defaultExpandAll onExpandedValueChange={onChange}>
        {(payload) => {
          scope = payload
          return null
        }}
      </XhTableRoot>
    )
    await render(view([]))
    expect(dataRows(scope)).toEqual([])

    await render(view(ROWS))
    expect(dataRows(scope)).toEqual(['a', 'a1', 'a2', 'note', 'b'])
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ value: ['a', 'a1', 'note'] })
  })
})
