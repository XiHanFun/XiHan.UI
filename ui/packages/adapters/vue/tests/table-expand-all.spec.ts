// @vitest-environment jsdom
// 表格的默认全部展开与全部展开 / 收起：判据在 Headless，这里核 Vue 这一侧的接线——prop 透传、数据晚到、插槽载荷里的两个动作。
import type { TableRootSlotProps } from '../src'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTableRoot } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

const COLUMNS = [{ id: 'name', label: '名称' }]
const ROWS = [
  { id: 'a' },
  { id: 'a1', parentId: 'a' },
  { id: 'a2', parentId: 'a1' },
  { id: 'note', expandable: true },
  { id: 'b' },
]

function mount(render: () => ReturnType<typeof h>): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup.push(() => app.unmount())
}

function dataRows(scope: TableRootSlotProps): string[] {
  return scope.visibleRows.filter(row => row.kind === 'data').map(row => row.id)
}

describe('xhTable 的全部展开', () => {
  it('defaultExpandAll：挂上即逐层展开，不发变更事件；载荷里的 collapseAll / expandAll 照常收展', async () => {
    const onChange = vi.fn()
    let scope!: TableRootSlotProps
    mount(() => h(XhTableRoot, { columns: COLUMNS, rows: ROWS, defaultExpandAll: true, onExpandedValueChange: onChange }, {
      default: (payload: TableRootSlotProps) => {
        scope = payload
        return null
      },
    }))
    await tick()
    expect(dataRows(scope)).toEqual(['a', 'a1', 'a2', 'note', 'b'])
    expect(onChange).not.toHaveBeenCalled()

    scope.collapseAll()
    await tick()
    expect(dataRows(scope)).toEqual(['a', 'note', 'b'])

    scope.expandAll()
    await tick()
    expect(dataRows(scope)).toEqual(['a', 'a1', 'a2', 'note', 'b'])
  })

  it('数据晚到：rows 先是空的，换上数据后才展开，并发一次变更事件', async () => {
    const rows = ref<typeof ROWS>([])
    const onChange = vi.fn()
    let scope!: TableRootSlotProps
    mount(() => h(XhTableRoot, { columns: COLUMNS, rows: rows.value, defaultExpandAll: true, onExpandedValueChange: onChange }, {
      default: (payload: TableRootSlotProps) => {
        scope = payload
        return null
      },
    }))
    await tick()
    expect(dataRows(scope)).toEqual([])

    rows.value = ROWS
    await tick()
    expect(dataRows(scope)).toEqual(['a', 'a1', 'a2', 'note', 'b'])
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ value: ['a', 'a1', 'note'] })
  })
})
