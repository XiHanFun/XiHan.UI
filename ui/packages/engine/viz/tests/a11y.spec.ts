import type { Mark, SeriesInput } from '../src'
import { describe, expect, it } from 'vitest'
import { buildLinkTableModel, buildSummaryModel, buildTableModel, buildTraversal, createScene, navigate, summarize } from '../src'

const online: SeriesInput = { id: 'online', name: '线上', points: [{ key: '一月', value: 100 }, { key: '二月', value: 80 }, { key: '三月', value: 150 }] }
const retail: SeriesInput = { id: 'retail', name: '门店', points: [{ key: '一月', value: 60 }, { key: '二月', value: null }, { key: '四月', value: 60 }] }

describe('摘要模型', () => {
  it('系列数、自变量范围、最值及其位置、首末变化率', () => {
    const model = buildSummaryModel([online, retail])
    expect(model.seriesCount).toBe(2)
    expect(model.keys).toEqual({ first: '一月', last: '四月', count: 4 })
    expect(model.series[0]).toMatchObject({
      count: 3,
      min: { key: '二月', value: 80, index: 1 },
      max: { key: '三月', value: 150, index: 2 },
      first: { key: '一月', value: 100 },
      last: { key: '三月', value: 150 },
      change: 0.5,
    })
  })

  it('缺失值不计；最值相同时取先出现的；首值为 0 时没有变化率', () => {
    const model = buildSummaryModel([retail, { id: 'z', name: 'z', points: [{ key: 1, value: 0 }, { key: 2, value: 5 }] }])
    expect(model.series[0]).toMatchObject({ count: 2, min: { index: 0 }, max: { index: 0 }, change: 0 })
    expect(model.series[1]!.change).toBeNull()
  })

  it('没有点时自变量范围为 null', () => {
    expect(buildSummaryModel([]).keys).toBeNull()
  })

  it('摘要文字由调用方的模板生成', () => {
    expect(summarize([online], m => `${m.seriesCount} 个系列，${String(m.keys?.first)} 至 ${String(m.keys?.last)}`)).toBe('1 个系列，一月 至 三月')
  })
})

describe('数据表模型', () => {
  it('自变量一列、每个系列一列，行是全部键按首次出现的次序去重', () => {
    const table = buildTableModel({ keyLabel: '月份', series: [online, retail], missingText: '无数据', formatValue: v => v.toFixed(1) })
    expect(table.columns.map(c => c.label)).toEqual(['月份', '线上', '门店'])
    expect(table.rows.map(r => r.cells.map(c => c.text))).toEqual([
      ['一月', '100.0', '60.0'],
      ['二月', '80.0', '无数据'],
      ['三月', '150.0', '无数据'],
      ['四月', '无数据', '60.0'],
    ])
    expect(table.rows[1]!.cells[2]!.value).toBeNull()
  })

  it('日期键按时间值归并', () => {
    const a: SeriesInput = { id: 'a', name: 'A', points: [{ key: new Date(2026, 0, 1), value: 1 }] }
    const b: SeriesInput = { id: 'b', name: 'B', points: [{ key: new Date(2026, 0, 1), value: 2 }] }
    expect(buildTableModel({ keyLabel: 'd', series: [a, b], missingText: '-' }).rows).toHaveLength(1)
  })

  it('系列 id 重复时报错', () => {
    expect(() => buildTableModel({ keyLabel: 'k', series: [online, online], missingText: '-' })).toThrow(/重复/)
  })

  it('流向表：source / target / value 三列', () => {
    const table = buildLinkTableModel({ labels: { source: '来源', target: '去向', value: '流量' }, links: [{ source: '官网', target: '注册', value: 1200 }] })
    expect(table.columns.map(c => c.id)).toEqual(['source', 'target', 'value'])
    expect(table.rows[0]!.cells.map(c => c.text)).toEqual(['官网', '注册', '1200'])
  })
})

describe('键盘遍历', () => {
  const bar = (key: string, seriesId: string, index: number): Mark => ({
    kind: 'rect',
    key,
    part: 'bar',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    datum: { seriesId, index },
    a11y: { label: key, focusable: true },
  })
  const scene = createScene({
    version: 1,
    layers: {
      back: [{ ...bar('grid', 'g', 0) }],
      data: [
        bar('a1', 'a', 1),
        bar('a0', 'a', 0),
        bar('a2', 'a', 2),
        bar('b0', 'b', 0),
        { ...bar('muted', 'c', 0), a11y: { label: 'x', focusable: false } },
        { kind: 'line', key: 'l', part: 'line', curve: 'linear', datum: { seriesId: 'l', index: 0 }, a11y: { label: 'l', focusable: true }, points: [{ key: 'p0', x: 0, y: 0 }, { key: 'p1', x: 1, y: 1, defined: false }, { key: 'p2', x: 2, y: 2 }] },
      ],
    },
    bounds: { x: 0, y: 0, width: 10, height: 10 },
  })
  const traversal = buildTraversal(scene)

  it('按系列分行、行内按数据位置排序；折线按点展开，缺失的点跳过', () => {
    expect(traversal.rows.map(row => row.map(item => item.id))).toEqual([['a0', 'a1', 'a2'], ['b0'], ['l:p0', 'l:p2']])
    expect(traversal.rows[2]![1]).toMatchObject({ markKey: 'l', pointKey: 'p2', datum: { seriesId: 'l', index: 2 } })
  })

  it('系列内移动到头不回绕，换系列保持位置', () => {
    expect(navigate(traversal, null, 'next')).toBe('a0')
    expect(navigate(traversal, 'a0', 'next')).toBe('a1')
    expect(navigate(traversal, 'a2', 'next')).toBe('a2')
    expect(navigate(traversal, 'a0', 'prev')).toBe('a0')
    expect(navigate(traversal, 'a2', 'down')).toBe('b0')
    expect(navigate(traversal, 'b0', 'down')).toBe('l:p0')
    expect(navigate(traversal, 'l:p2', 'up')).toBe('b0')
    expect(navigate(traversal, 'a0', 'up')).toBe('a0')
    expect(navigate(traversal, 'a1', 'last')).toBe('a2')
    expect(navigate(traversal, 'a2', 'first')).toBe('a0')
    expect(navigate(traversal, 'a0', 'page-next', 2)).toBe('a2')
    expect(navigate(traversal, 'a2', 'page-prev')).toBe('a0')
  })

  it('没有可聚焦的标记时没有落点', () => {
    const empty = buildTraversal(createScene({ version: 1, layers: {}, bounds: { x: 0, y: 0, width: 1, height: 1 } }))
    expect(navigate(empty, null, 'next')).toBeNull()
  })
})
