// grid 的跨行：与跨列同一套收值规则——1 至 12 的整数才落，断点对象逐档落，越界与非整数按没写算。
import { describe, expect, it } from 'vitest'
import { connectGrid } from '../src/grid'

const normalize = { element: (p: Record<string, unknown>) => p } as never

function item(rowSpan: Parameters<ReturnType<typeof connectGrid>['getItemProps']>[0]): Record<string, unknown> {
  return connectGrid({}, normalize).getItemProps(rowSpan) as unknown as Record<string, unknown>
}

describe('grid 跨行', () => {
  it('不写就不落：按文档序占一行', () => {
    const attrs = item({})
    for (const key of ['data-row-span', 'data-row-span-sm', 'data-row-span-md', 'data-row-span-lg', 'data-row-span-xl'])
      expect(attrs[key]).toBeUndefined()
  })

  it('整数只落不带档位的那个', () => {
    expect(item({ rowSpan: 3 })).toMatchObject({ 'data-row-span': '3' })
    expect(item({ rowSpan: 3 })['data-row-span-md']).toBeUndefined()
  })

  it('断点对象逐档落，没写的档不落', () => {
    const attrs = item({ rowSpan: { base: 1, md: 2, xl: 4 } })
    expect(attrs).toMatchObject({ 'data-row-span': '1', 'data-row-span-md': '2', 'data-row-span-xl': '4' })
    expect(attrs['data-row-span-sm']).toBeUndefined()
    expect(attrs['data-row-span-lg']).toBeUndefined()
  })

  it('越界、0、负数与小数按没写算，断点档同理', () => {
    for (const bad of [0, -1, 13, 1.5])
      expect(item({ rowSpan: bad as never })['data-row-span']).toBeUndefined()
    expect(item({ rowSpan: { md: 13 as never } })['data-row-span-md']).toBeUndefined()
  })

  it('与跨列、错列互不干扰，三组属性各落各的', () => {
    expect(item({ span: 2, offset: 1, rowSpan: 2 })).toMatchObject({ 'data-span': '2', 'data-offset': '1', 'data-row-span': '2' })
  })
})
