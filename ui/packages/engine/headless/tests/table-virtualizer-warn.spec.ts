// @vitest-environment jsdom
// 表体里的视口自己滚时开发模式下提醒一次：滚动面在根节点上（ancestor）或桥没报滚动面时不提醒。
import type { TableSchema } from '../src/table'
import type { CollectionVirtualizer, VirtualizerScrollContainer } from '../src/virtualizer'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTable, tableMachine } from '../src/table'

type Props = TableSchema['props']

const ROWS = Array.from({ length: 10 }, (_, i) => ({ id: `r${i}` }))

function bridge(scrollContainer?: VirtualizerScrollContainer): CollectionVirtualizer {
  return {
    count: ROWS.length,
    scrollContainer,
    scrollToIndex: () => {},
    focusIndex: () => {},
    getRenderedItemRoots: () => [],
    getViewportElement: () => null,
  }
}

function render(virtualizer: CollectionVirtualizer): void {
  const runtime = createVanillaRuntime()
  const props: Props = { columns: [{ id: 'name' }], rows: ROWS, virtualizer }
  const service = createService(tableMachine, { props: () => props, runtime })
  runtime.start()
  connectTable(service, normalizeProps)
  runtime.stop()
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('表格接 Virtualizer：滚动面的提醒', () => {
  it('ancestor 与没报滚动面的桥都不提醒；viewport 提醒一次，之后不再重复', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(bridge('ancestor'))
    render(bridge())
    expect(warn).not.toHaveBeenCalled()
    render(bridge('viewport'))
    render(bridge('viewport'))
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]![0])).toContain('scrollContainer="ancestor"')
  })
})
