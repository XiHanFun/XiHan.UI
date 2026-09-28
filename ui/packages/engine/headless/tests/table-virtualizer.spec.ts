// @vitest-environment jsdom
import type { TableSchema } from '../src/table'
import type { CollectionVirtualizer } from '../src/virtualizer'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectTable, tableMachine } from '../src/table'

type Props = TableSchema['props']

const ROWS = Array.from({ length: 100 }, (_, i) => ({ id: `r${i}`, disabled: i === 99 }))

function fakeVirtualizer(count: number): CollectionVirtualizer & { focusIndex: ReturnType<typeof vi.fn> } {
  return {
    count,
    scrollToIndex: vi.fn(),
    focusIndex: vi.fn(),
    getRenderedItemRoots: () => [],
    getViewportElement: () => null,
  }
}

function mount(initial: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(tableMachine, { props: () => ({ columns: [{ id: 'name' }], rows: ROWS, ...initial }), runtime })
  runtime.start()
  return { api: () => connectTable(service, normalizeProps), service }
}

function keydown(api: ReturnType<typeof connectTable>, key: string): KeyboardEvent {
  const body = document.createElement('div')
  const event = new KeyboardEvent('keydown', { key, cancelable: true })
  Object.defineProperty(event, 'currentTarget', { value: body })
  ;(api.getBodyProps() as { onKeyDown: (e: KeyboardEvent) => void }).onKeyDown(event)
  return event
}

describe('表格接 Virtualizer', () => {
  it('count 与可见数据行的条数对不上时明确报错', () => {
    expect(() => mount({ virtualizer: fakeVirtualizer(3) }).api()).toThrow(RangeError)
  })

  it('方向键按完整行序求落点：锚点先记下，再让 Virtualizer 滚进来交焦点；禁用行跳过', () => {
    const virtualizer = fakeVirtualizer(ROWS.length)
    const t = mount({ virtualizer })
    t.service.send({ type: 'ROW.FOCUS', value: 'r0' })
    const end = keydown(t.api(), 'End')
    expect(end.defaultPrevented).toBe(true)
    // 最后一行禁用，End 落在倒数第二行
    expect(virtualizer.focusIndex).toHaveBeenLastCalledWith(98, expect.objectContaining({ align: 'auto' }))
    expect(t.service.context.get('focusedRow')).toBe('r98')
    keydown(t.api(), 'ArrowUp')
    expect(virtualizer.focusIndex).toHaveBeenLastCalledWith(97, expect.anything())
    expect(t.service.context.get('focusedRow')).toBe('r97')
  })

  it('接了 Virtualizer 的表格行拖不动：窗口外的行没有落点', () => {
    const t = mount({ virtualizer: fakeVirtualizer(ROWS.length), rowReorderable: true })
    expect(t.api().rowReorderDisabledReason).toBe('virtualized')
  })
})
