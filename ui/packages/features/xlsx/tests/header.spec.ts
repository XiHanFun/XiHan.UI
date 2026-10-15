import type { XlsxCell, XlsxHeaderNode } from '../src'
import { describe, expect, it } from 'vitest'
import { headerRows, writeXlsx, XlsxError } from '../src'

function text(value: string): XlsxCell {
  return { type: 'text', value, bold: true }
}

function node(label: string, children?: readonly XlsxHeaderNode[], span?: number): XlsxHeaderNode {
  return { cell: text(label), ...(children ? { children } : {}), ...(span === undefined ? {} : { span }) }
}

function labels(rows: readonly (readonly (XlsxCell | null | undefined)[])[]): (string | null)[][] {
  return rows.map(row => row.map(cell => (cell?.type === 'text' ? cell.value : null)))
}

describe('headerRows', () => {
  it('上层横跨下级叶子，没有下级的标签向内占满', () => {
    const layout = headerRows([node('华东', [node('上海'), node('杭州')]), node('合计')])
    expect(layout.depth).toBe(2)
    expect(layout.breadth).toBe(3)
    expect(labels(layout.rows)).toEqual([['华东', null, '合计'], ['上海', '杭州', null]])
    expect(layout.merges).toEqual([
      { row: 0, column: 0, rowSpan: 1, columnSpan: 2 },
      { row: 0, column: 2, rowSpan: 2, columnSpan: 1 },
    ])
  })

  it('span 让有下级的标签纵占多层，下级接在它之后', () => {
    const layout = headerRows([
      node('华东', [node('上海', [node('浦东', [node('金额'), node('数量')])]), node('小计', [node('金额'), node('数量')], 2)]),
    ])
    expect(layout.depth).toBe(4)
    expect(layout.breadth).toBe(4)
    expect(labels(layout.rows)).toEqual([
      ['华东', null, null, null],
      ['上海', null, '小计', null],
      ['浦东', null, null, null],
      ['金额', '数量', '金额', '数量'],
    ])
    expect(layout.merges).toEqual([
      { row: 0, column: 0, rowSpan: 1, columnSpan: 4 },
      { row: 1, column: 0, rowSpan: 1, columnSpan: 2 },
      { row: 1, column: 2, rowSpan: 2, columnSpan: 2 },
      { row: 2, column: 0, rowSpan: 1, columnSpan: 2 },
    ])
  })

  it('span 计入层数时，更浅的叶子仍占满到最内层', () => {
    const layout = headerRows([node('总计'), node('华东', [node('小计', [node('金额')], 2)])])
    expect(layout.depth).toBe(4)
    expect(layout.merges).toContainEqual({ row: 0, column: 0, rowSpan: 4, columnSpan: 1 })
    expect(labels(layout.rows).map(row => row[1])).toEqual(['华东', '小计', null, '金额'])
  })

  it('axis: row 时层从左到右、叶子自上而下', () => {
    const layout = headerRows([node('华东', [node('上海'), node('杭州')]), node('合计')], { axis: 'row' })
    expect(labels(layout.rows)).toEqual([['华东', '上海'], [null, '杭州'], ['合计', null]])
    expect(layout.merges).toEqual([
      { row: 0, column: 0, rowSpan: 2, columnSpan: 1 },
      { row: 2, column: 0, rowSpan: 1, columnSpan: 2 },
    ])
  })

  it('空标签只占位、不合并；空树没有行', () => {
    const layout = headerRows([{ children: [node('a'), node('b')] }, { cell: null }])
    expect(labels(layout.rows)).toEqual([[null, null, null], ['a', 'b', null]])
    expect(layout.merges).toEqual([])
    expect(headerRows([])).toEqual({ rows: [], merges: [], depth: 0, breadth: 0 })
  })

  it('span 不是正整数时抛 invalid-header，params 带节点路径', () => {
    for (const span of [0, 1.5, Number.NaN]) {
      let error: unknown
      try {
        headerRows([node('a', [node('b', [node('c')], span)])])
      }
      catch (caught) {
        error = caught
      }
      expect(error).toBeInstanceOf(XlsxError)
      expect((error as XlsxError).code).toBe('invalid-header')
      expect((error as XlsxError).params).toEqual({ path: [0, 0], span })
    }
  })

  it('展开结果可直接写成工作表', async () => {
    const layout = headerRows([node('华东', [node('上海'), node('杭州')]), node('合计')])
    const bytes = await writeXlsx({ sheets: [{ name: '表头', rows: layout.rows, merges: layout.merges }] }, { compression: 'store' })
    expect(bytes.byteLength).toBeGreaterThan(0)
  })
})
