// @vitest-environment jsdom
// 图表内核：度量缺省与令牌同值、系列色槽分配与校验、按键意图、分段记忆、摘要与提示框落点。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { describe, expect, it, vi } from 'vitest'
import {
  assignChartSeries,
  buildChartSummary,
  CHART_METRIC_SLOTS,
  CHART_METRICS,
  chartActiveSource,
  chartNavIntentFromKey,
  chartPageSize,
  defaultChartSummary,
  memoizeLast,
  placeChartTooltip,
  readChartMetrics,
  sameChartKey,
  sameChartMetrics,
} from '../src/shared/chart'

const TOKENS = JSON.parse(readFileSync(join(import.meta.dirname, '../../../design/tokens/tokens.json'), 'utf8')) as Record<string, string>

/** 令牌沿 var() 追到字面量，再换成 px（rem 按 16px）。 */
function tokenPx(name: string): number {
  let value = TOKENS[name]
  for (let i = 0; i < 10 && value?.startsWith('var('); i++)
    value = TOKENS[value.slice(4, -1)]
  if (value == null)
    throw new Error(`令牌 ${name} 不存在`)
  const hit = /^([\d.]+)(px|rem)$/.exec(value)
  if (!hit)
    throw new Error(`令牌 ${name} 的值 ${value} 不是长度`)
  return Number(hit[1]) * (hit[2] === 'rem' ? 16 : 1)
}

describe('度量', () => {
  it('缺省度量逐项与令牌同值', () => {
    expect(CHART_METRICS.barMax).toBe(tokenPx('--xh-chart-bar-max'))
    expect(CHART_METRICS.gap).toBe(tokenPx('--xh-chart-gap'))
    expect(CHART_METRICS.lineWidth).toBe(tokenPx('--xh-chart-line-width'))
    expect(CHART_METRICS.pointSize).toBe(tokenPx('--xh-chart-point-size'))
    expect(CHART_METRICS.hitMin).toBe(tokenPx('--xh-chart-hit-min'))
    expect(CHART_METRICS.tickLength).toBe(tokenPx('--xh-chart-tick-length'))
    expect(CHART_METRICS.labelGap).toBe(tokenPx('--xh-chart-label-gap'))
    expect(CHART_METRICS.font.size).toBe(tokenPx('--xh-text-caption-size'))
    expect(CHART_METRICS.font.lineHeight).toBe(CHART_METRICS.font.size * Number(TOKENS['--xh-leading-tight']))
  })

  it('从计算样式读私有槽：px 直接取、rem 按根字号换算，读不懂的写法退回缺省', () => {
    const el = document.createElement('div')
    document.body.append(el)
    el.style.setProperty(CHART_METRIC_SLOTS.barMax, '2rem')
    el.style.setProperty(CHART_METRIC_SLOTS.gap, '3px')
    el.style.setProperty(CHART_METRIC_SLOTS.pointSize, 'calc(4px * 2)')
    el.style.setProperty(CHART_METRIC_SLOTS.fontSize, '14px')
    el.style.setProperty(CHART_METRIC_SLOTS.leading, '1.5')
    const metrics = readChartMetrics(el)
    expect(metrics.barMax).toBe(32)
    expect(metrics.gap).toBe(3)
    expect(metrics.pointSize).toBe(CHART_METRICS.pointSize)
    expect(metrics.font.size).toBe(14)
    expect(metrics.font.lineHeight).toBe(21)
    el.remove()
  })

  it('逐项相同才算同一份度量', () => {
    expect(sameChartMetrics(CHART_METRICS, { ...CHART_METRICS })).toBe(true)
    expect(sameChartMetrics(CHART_METRICS, { ...CHART_METRICS, gap: 3 })).toBe(false)
    expect(sameChartMetrics(CHART_METRICS, { ...CHART_METRICS, font: { ...CHART_METRICS.font, size: 13 } })).toBe(false)
  })
})

describe('系列身份与色槽', () => {
  it('id 缺省取字段名，色槽按声明顺序分配', () => {
    const { series, issues } = assignChartSeries([{ field: 'a' }, { field: 'b', name: '乙' }, { field: 'c' }])
    expect(issues).toEqual([])
    expect(series.map(s => [s.id, s.name, s.slot])).toEqual([['a', 'a', 1], ['b', '乙', 2], ['c', 'c', 3]])
  })

  it('固定色槽先占位，其余系列按顺序取空着的槽', () => {
    const { series } = assignChartSeries([{ field: 'a' }, { field: 'b', slot: 1 }, { field: 'c' }])
    expect(series.map(s => s.slot)).toEqual([2, 1, 3])
  })

  it('语义系列不占色槽', () => {
    const { series, issues } = assignChartSeries([{ field: 'ok', tone: 'success' }, { field: 'bad', tone: 'danger' }])
    expect(issues).toEqual([])
    expect(series.map(s => [s.slot, s.tone])).toEqual([[null, 'success'], [null, 'danger']])
  })

  it('id 重复、色槽越界或撞槽、混用分类色与语气色、超过 8 个分类系列都报出来', () => {
    const codes = (inputs: Parameters<typeof assignChartSeries>[0]): string[] => assignChartSeries(inputs).issues.map(i => i.code)
    expect(codes([{ field: 'a' }, { field: 'a' }])).toEqual([DIAGNOSTIC_CODES.chartDuplicateSeries])
    expect(codes([{ field: 'a', slot: 9 }])).toEqual([DIAGNOSTIC_CODES.chartInvalidSlot])
    expect(codes([{ field: 'a', slot: 2 }, { field: 'b', slot: 2 }])).toEqual([DIAGNOSTIC_CODES.chartInvalidSlot])
    expect(codes([{ field: 'a' }, { field: 'b', tone: 'danger' }])).toEqual([DIAGNOSTIC_CODES.chartMixedColorRoles])
    expect(codes(Array.from({ length: 9 }, (_, i) => ({ field: `s${i}` })))).toEqual([DIAGNOSTIC_CODES.chartTooManySeries])
  })
})

describe('按键意图', () => {
  it('纵向：左右走键、上下换系列；横向两对互换；饼图右下是下一个', () => {
    const intent = (key: string, layout: 'vertical' | 'horizontal' | 'radial'): string | null => chartNavIntentFromKey({ key }, layout)
    expect(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].map(k => intent(k, 'vertical'))).toEqual(['next', 'prev', 'series-next', 'series-prev'])
    expect(['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].map(k => intent(k, 'horizontal'))).toEqual(['next', 'prev', 'series-next', 'series-prev'])
    expect(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].map(k => intent(k, 'radial'))).toEqual(['next', 'next', 'prev', 'prev'])
    expect(['Home', 'End', 'PageDown', 'PageUp'].map(k => intent(k, 'vertical'))).toEqual(['first', 'last', 'page-next', 'page-prev'])
  })

  it('带修饰键的按键与其余按键不归绘图区', () => {
    expect(chartNavIntentFromKey({ key: 'ArrowRight', ctrlKey: true }, 'vertical')).toBeNull()
    expect(chartNavIntentFromKey({ key: 'a' }, 'vertical')).toBeNull()
  })

  it('翻页跨 10% 的键，至少 1 个', () => {
    expect([3, 10, 25, 100].map(chartPageSize)).toEqual([1, 1, 3, 10])
  })
})

describe('分段记忆', () => {
  it('参数逐个引用相同就复用上一次的结果', () => {
    const fn = vi.fn((a: object, b: number) => ({ a, b }))
    const memo = memoizeLast(fn)
    const a = {}
    const first = memo(a, 1)
    expect(memo(a, 1)).toBe(first)
    expect(fn).toHaveBeenCalledTimes(1)
    memo({}, 1)
    memo(a, 2)
    expect(fn).toHaveBeenCalledTimes(3)
  })
})

describe('激活与键', () => {
  const base = { hover: null, focused: null, focusWithin: false, dismissed: false }
  const ref = { seriesId: 's', index: 0 }
  it('指针压过键盘，Escape 收起后两路都不取', () => {
    expect(chartActiveSource(base)).toBeNull()
    expect(chartActiveSource({ ...base, focused: ref, focusWithin: true })).toBe('keyboard')
    expect(chartActiveSource({ ...base, focused: ref, focusWithin: true, hover: { ref, x: 0, y: 0 } })).toBe('pointer')
    expect(chartActiveSource({ ...base, hover: { ref, x: 0, y: 0 }, dismissed: true })).toBeNull()
  })

  it('日期键按时间值比', () => {
    expect(sameChartKey(new Date(2024, 0, 1), new Date(2024, 0, 1))).toBe(true)
    expect(sameChartKey('a', 'a')).toBe(true)
    expect(sameChartKey(1, '1')).toBe(false)
  })
})

describe('摘要', () => {
  const series = [
    { id: 'a', name: '线上', points: [{ key: '一月', value: 3 }, { key: '二月', value: 9 }, { key: '三月', value: null }] },
    { id: 'b', name: '线下', points: [{ key: '一月', value: 5 }, { key: '二月', value: 5 }] },
  ]
  const model = buildChartSummary(series, { formatKey: String, formatValue: value => value.toFixed(1) })

  it('键与数值按给定格式写好，缺失不计', () => {
    expect(model.range).toEqual({ first: '一月', last: '三月', count: 3 })
    expect(model.series[0]).toMatchObject({ count: 2, min: { key: '一月', value: '3.0' }, max: { key: '二月', value: '9.0' } })
  })

  it('缺省摘要写出系列数、范围与各系列最值，全部相等的系列只报一次', () => {
    expect(defaultChartSummary(model)).toBe('2 series, 3 points from 一月 to 三月. 线上: lowest 3.0 at 一月, highest 9.0 at 二月. 线下: 5.0 at 一月.')
    expect(defaultChartSummary(buildChartSummary([], { formatKey: String, formatValue: String }))).toBe('No data.')
  })
})

describe('提示框落点', () => {
  it('锚点换成相对根的坐标，右半边长在左侧、下半边向上长', () => {
    const size = { width: 400, height: 200 }
    expect(placeChartTooltip({ x: 100, y: 50 }, size, { x: 10, y: 30 })).toEqual({ x: 110, y: 80, side: 'end', block: 'below' })
    expect(placeChartTooltip({ x: 300, y: 150 }, size, { x: 0, y: 0 })).toEqual({ x: 300, y: 150, side: 'start', block: 'above' })
  })
})
