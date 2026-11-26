// 数据驱动模式的自定义筛选：filterMode 为 custom 的列，列头上筛选那一格放 renderFilter 的内容，
// 参数里有这一列的筛选值与写回方法；远程模式下写回只发回调，表体照 data 原样铺。
import type { TableColumnDef, TableFilterSlotData } from '@xihan-ui/headless'
import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { XhTableRoot } from '../src'

interface Person {
  id: string
  name: string
}

const DATA: Person[] = [
  { id: 'u1', name: '赵一' },
  { id: 'u2', name: '钱二' },
  { id: 'u3', name: '孙三' },
]

const COLUMNS: TableColumnDef<Person>[] = [
  { id: 'name', label: '姓名', filterMode: 'custom', filter: (record, values) => record.name.includes(values[0] ?? '') },
]

function setup(extra: { remote?: boolean } = {}) {
  let last!: TableFilterSlotData
  const onFilterValueChange = vi.fn()
  const view = render(
    <XhTableRoot
      data={DATA}
      columns={COLUMNS}
      onFilterValueChange={onFilterValueChange}
      renderFilter={(filter) => {
        last = filter
        return <input data-testid={`filter-${filter.column.id}`} aria-label={filter.label} defaultValue={filter.value[0] ?? ''} />
      }}
      {...extra}
    />,
  )
  const rowValues = (): (string | null)[] => [...view.container.querySelectorAll('[data-part="body"] [data-part="row"]')].map(row => row.getAttribute('data-value'))
  return { view, last: () => last, onFilterValueChange, rowValues }
}

describe('自定义筛选面板（renderFilter）', () => {
  it('作者内容放在那一列的列头里、排在列名之后；写回后按列的 filter 筛', () => {
    const t = setup()
    const input = t.view.getByTestId('filter-name')
    expect(input.closest('[data-part="column-header"]')?.getAttribute('data-value')).toBe('name')
    expect(input.previousElementSibling?.getAttribute('data-part')).toBe('column-label')
    expect(input.getAttribute('aria-label')).toBe('Filter 姓名')
    act(() => t.last().setValue(['钱']))
    expect(t.onFilterValueChange).toHaveBeenLastCalledWith({ value: { name: ['钱'] } })
    expect(t.rowValues()).toEqual(['u2'])
    expect(t.last().value).toEqual(['钱'])
  })

  it('远程模式：写回只发回调，表体照 data 原样铺', () => {
    const t = setup({ remote: true })
    act(() => t.last().setValue(['钱']))
    expect(t.onFilterValueChange).toHaveBeenLastCalledWith({ value: { name: ['钱'] } })
    expect(t.rowValues()).toEqual(['u1', 'u2', 'u3'])
  })
})
