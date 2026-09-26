// @vitest-environment jsdom
// 热力图接入图表引擎与 Chart 家族配方：分档由分档比例尺完成、分界值的整理与诊断、详情条与对照条投影家族部件。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { HeatmapSchema } from '../src/heatmap'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { scaleQuantize } from '@xihan-ui/viz'
import { afterEach, describe, expect, it } from 'vitest'
import { buildHeatmapGrid, buildHeatmapThresholds, connectHeatmap, heatmapLevelOf, heatmapMachine, normalizeHeatmapThresholds } from '../src/heatmap'

type Dict = Record<string, any>

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
})

function mount(props: Partial<HeatmapSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(heatmapMachine, { props: () => props, runtime })
  runtime.start()
  stops.push(() => runtime.stop())
  return connectHeatmap(service, normalizeProps)
}

describe('分档', () => {
  it('档数给定时有数据的几档把 (0, 最大值] 等宽分开：分界与等宽分档比例尺取整后一致', () => {
    const edges = scaleQuantize({ domain: [0, 20], levels: 4 }).thresholds()
    expect(buildHeatmapThresholds(20, 5)).toEqual([1, ...edges.map(Math.ceil)])
  })

  it('计数按分界落档：与越过几条分界的数法相同，没有数据恒是第 0 档', () => {
    const thresholds = [1, 3, 5, 8]
    expect([0, 1, 2, 3, 7, 8, 100].map(c => heatmapLevelOf(c, thresholds))).toEqual([0, 1, 1, 2, 3, 4, 4])
  })

  it('分界值整理成有限、升序、互不相同', () => {
    expect(normalizeHeatmapThresholds([5, 2, 5, Number.NaN, 9])).toEqual([2, 5, 9])
  })

  it('分界值里有重复：剔除后档数按剩下的算，并在诊断通道报一声', () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => records.push(r)))
    const grid = buildHeatmapGrid({ startDate: '2024-01-01', endDate: '2024-01-07', value: [], thresholds: [4, 2, 4] })
    expect(grid.thresholds).toEqual([2, 4])
    expect(grid.levels).toBe(3)
    mount({ startDate: '2024-01-01', endDate: '2024-01-07', thresholds: [4, 2, 4] })
    expect(records.some(r => r.code === DIAGNOSTIC_CODES.chartInvalidRange && r.scope === 'heatmap')).toBe(true)
  })
})

describe('chart 家族配方', () => {
  it('详情条与对照条投影家族部件名，格子与对照格不投影', () => {
    const api = mount({ startDate: '2024-01-01', endDate: '2024-01-07', palette: 'amber' })
    expect((api.getTooltipProps() as Dict)['data-xh-chart-part']).toBe('tooltip')
    expect((api.getLegendProps() as Dict)['data-xh-chart-part']).toBe('legend')
    expect((api.getLegendItemProps({ level: 1 }) as Dict)['data-xh-chart-part']).toBeUndefined()
    expect((api.getCellProps({ date: '2024-01-02' }) as Dict)['data-xh-chart-part']).toBeUndefined()
    expect((api.getRootProps() as Dict)['data-palette']).toBe('amber')
  })
})
