/**
 * 键盘导航要真实的活 DOM：格子集合是在事件那一刻现查的，方向键把焦点搬到哪一格
 * 只有活节点才立得住，纯逻辑环境里演不出来。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/machine'
import type { HeatmapCellFocusDetails, HeatmapSchema } from '../src/heatmap'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import {
  buildHeatmapGrid,
  buildHeatmapMatrixGrid,
  buildHeatmapMonthGrid,
  buildHeatmapThresholds,
  connectHeatmap,
  heatmapActiveCell,
  heatmapActiveSource,
  heatmapActiveTip,
  heatmapDetailsOf,
  heatmapLevelOf,
  heatmapLevelPercent,
  heatmapMachine,
  heatmapMatrixKey,
  heatmapMatrixNavTarget,
  heatmapMonthNavTarget,
  heatmapNavIntentFromKey,
  heatmapNavTarget,
  heatmapStatsOf,
  heatmapTipPlacement,
  parseHeatmapDate,
  resolveHeatmapTip,
  sameHeatmapTip,
} from '../src/heatmap'

type Props = HeatmapSchema['props']

/** 2024-01-01 是星期一，2024-01-31 是星期三；周首日缺省也是星期一，于是首行不必错列。 */
const RANGE: Props = { startDate: '2024-01-01', endDate: '2024-01-31' }

/** 两天有数据，最大值 10：分档的边界能落在中间几档上。 */
const VALUE = [
  { date: '2024-01-01', count: 1 },
  { date: '2024-01-02', count: 10 },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与两个适配器同一套翻译规则（on 之后全小写做事件名，其余落属性，
 * style 里的自定义属性走 setProperty）。
 * 有它才跑得到真实事件流——纯比对 connect 的返回值只能验静态属性。
 */
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(props)) {
    if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z') {
      const type = key.slice(2).toLowerCase()
      const map = listeners.get(el) ?? new Map<string, EventListener>()
      listeners.set(el, map)
      const prev = map.get(type)
      if (prev)
        el.removeEventListener(type, prev)
      if (typeof raw === 'function') {
        el.addEventListener(type, raw as EventListener)
        map.set(type, raw as EventListener)
      }
      continue
    }
    if (key === 'style') {
      const style = (raw ?? {}) as Record<string, string>
      for (const [name, value] of Object.entries(style)) {
        if (name.startsWith('--'))
          el.style.setProperty(name, value)
      }
      continue
    }
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface Harness {
  service: Service<HeatmapSchema>
  root: HTMLElement
  grid: HTMLElement
  cell: (date: string) => HTMLElement
  render: () => void
  focuses: HeatmapCellFocusDetails[]
}

const apiOf = (service: Service<HeatmapSchema>) => connectHeatmap(service, normalizeProps)

/** 按 connect 给出的网格铺出 root > grid > 行 > 格的整棵树，并把属性打上去。 */
function mount(initial: Props = {}): Harness {
  const focuses: HeatmapCellFocusDetails[] = []
  const props: Props = { ...initial, onCellFocus: details => focuses.push(details) }
  const runtime = createVanillaRuntime()
  const service = createService(heatmapMachine, { props: () => props, runtime })
  runtime.start()

  const root = document.createElement('div')
  const grid = document.createElement('div')
  root.append(grid)
  document.body.append(root)

  const cells = new Map<string, HTMLElement>()
  const rows: HTMLElement[] = []
  for (const row of apiOf(service).grid.rows) {
    const rowEl = document.createElement('div')
    rows.push(rowEl)
    for (const meta of row.cells) {
      const cellEl = document.createElement('div')
      cells.set(meta.date, cellEl)
      rowEl.append(cellEl)
    }
    grid.append(rowEl)
  }

  const render = (): void => {
    const api = apiOf(service)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(grid, api.getGridProps() as Record<string, unknown>)
    api.grid.rows.forEach((row, index) => {
      spread(rows[index]!, api.getRowProps({ weekDay: row.weekDay }) as Record<string, unknown>)
    })
    for (const [date, el] of cells)
      spread(el, api.getCellProps({ date }) as Record<string, unknown>)
  }
  render()

  return {
    service,
    root,
    grid,
    cell: date => cells.get(date)!,
    render,
    focuses,
  }
}

/** 派一次真按键并重渲染；返回是否被拦下（拦下 = 这个键归网格管）。 */
function press(harness: Harness, key: string, init: KeyboardEventInit = {}): boolean {
  const target = (document.activeElement as HTMLElement | null) ?? harness.grid
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  harness.render()
  return event.defaultPrevented
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('heatmap 日期解析', () => {
  it('只认 YYYY-MM-DD，写法不对一律给 null：脏值当合法日期用会把整张网格错位', () => {
    expect(parseHeatmapDate('2024-01-01')).toBe(Date.UTC(2024, 0, 1))
    expect(parseHeatmapDate('2024-1-1')).toBeNull()
    expect(parseHeatmapDate('2024-01-01T00:00:00Z')).toBeNull()
    expect(parseHeatmapDate('')).toBeNull()
    expect(parseHeatmapDate(undefined)).toBeNull()
  })

  it('不存在的日期给 null：Date.UTC 会把 2 月 31 日顺延到 3 月，回读一遍才认得出来', () => {
    expect(parseHeatmapDate('2024-02-31')).toBeNull()
    expect(parseHeatmapDate('2023-02-29')).toBeNull()
    // 2024 是闰年，这一天真的存在
    expect(parseHeatmapDate('2024-02-29')).not.toBeNull()
  })
})

describe('heatmap 分档', () => {
  it('各档下界严格递增：数据只有一两个不同取值时低档也不会被挤空', () => {
    expect(buildHeatmapThresholds(10, 5)).toEqual([1, 3, 5, 8])
    expect(buildHeatmapThresholds(1, 5)).toEqual([1, 2, 3, 4])
    // 没有数据时最大值按 1 计，标尺仍然成立
    expect(buildHeatmapThresholds(0, 5)).toEqual([1, 2, 3, 4])
  })

  it('计数为 0 恒是第 0 档，越过一条下界就进一档', () => {
    const thresholds = [1, 3, 5, 8]
    expect(heatmapLevelOf(0, thresholds)).toBe(0)
    expect(heatmapLevelOf(-5, thresholds)).toBe(0)
    expect(heatmapLevelOf(1, thresholds)).toBe(1)
    expect(heatmapLevelOf(4, thresholds)).toBe(2)
    expect(heatmapLevelOf(10, thresholds)).toBe(4)
  })

  it('档位换成色阶位置：首档 0、末档 100，档数随便改公式都成立', () => {
    expect(heatmapLevelPercent(0, 5)).toBe(0)
    expect(heatmapLevelPercent(1, 5)).toBe(25)
    expect(heatmapLevelPercent(4, 5)).toBe(100)
    expect(heatmapLevelPercent(1, 3)).toBe(50)
    // 越界的档位夹回两端，不会算出负数或超过 100 的百分比
    expect(heatmapLevelPercent(9, 5)).toBe(100)
    expect(heatmapLevelPercent(-1, 5)).toBe(0)
  })

  it('档数不是有限数时退回缺省：NaN 一路漏下去会让标尺为空、色阶位置写成 NaN%', () => {
    // <xh-heatmap levels="abc"> 经数字转换器拿到的就是 NaN
    const broken = buildHeatmapGrid({ ...RANGE, value: VALUE, levels: Number.NaN })
    expect(broken.levels).toBe(5)
    expect(broken.thresholds.length).toBe(4)
    expect(heatmapLevelPercent(broken.cells.get('2024-01-02')!.level, broken.levels)).toBe(100)
    // 小于两档也夹回两档：一档的色阶没有两端
    expect(buildHeatmapGrid({ ...RANGE, levels: 1 }).levels).toBe(2)
  })

  it('区间外的日期单独查也给 0 档 0 计数，与网格里查不到那一格的取值一致', () => {
    const options = { ...RANGE, value: [...VALUE, { date: '2024-06-01', count: 99 }] }
    expect(heatmapStatsOf(options, '2024-01-02')).toEqual({ count: 10, level: 4, levels: 5 })
    expect(heatmapStatsOf(options, '2024-06-01')).toEqual({ count: 0, level: 0, levels: 5 })
    expect(heatmapStatsOf(options, '不是日期')).toEqual({ count: 0, level: 0, levels: 5 })
  })

  it('给了 thresholds 就以它为准，档数随之定死，levels 不再起作用', () => {
    const grid = buildHeatmapGrid({ ...RANGE, value: VALUE, levels: 9, thresholds: [5, 2] })
    // 入参乱序也照样升序解读
    expect(grid.thresholds).toEqual([2, 5])
    expect(grid.levels).toBe(3)
    expect(grid.cells.get('2024-01-01')!.level).toBe(0)
    expect(grid.cells.get('2024-01-02')!.level).toBe(2)
  })
})

describe('buildHeatmapGrid 摊网格', () => {
  it('七行恒在，列是周次；区间起点正好是周首日时各行都不错列', () => {
    const grid = buildHeatmapGrid(RANGE)
    expect(grid.rows).toHaveLength(7)
    expect(grid.weekCount).toBe(5)
    expect(grid.rows.every(row => row.offset === 0)).toBe(true)
    expect(grid.rows[0]!.cells.map(cell => cell.date)).toEqual([
      '2024-01-01',
      '2024-01-08',
      '2024-01-15',
      '2024-01-22',
      '2024-01-29',
    ])
    // 一月只到 31 号，星期四那一行少一格
    expect(grid.rows[3]!.cells).toHaveLength(4)
    expect(grid.cells.size).toBe(31)
  })

  it('起点不在周首日时，排在它前面的几行整行往后错一列，且不铺没有日期的占位格', () => {
    // 2024-01-03 是星期三，星期一与星期二那两行的第 0 列早于起点
    const grid = buildHeatmapGrid({ startDate: '2024-01-03', endDate: '2024-01-31' })
    expect(grid.rows.map(row => row.offset)).toEqual([1, 1, 0, 0, 0, 0, 0])
    expect(grid.rows[0]!.cells[0]!.date).toBe('2024-01-08')
    expect(grid.rows[0]!.cells[0]!.weekIndex).toBe(1)
    expect(grid.rows[2]!.cells[0]!.date).toBe('2024-01-03')
    expect(grid.rows[2]!.cells[0]!.weekIndex).toBe(0)
    // 头一格与末一格按文档序取，不是按日期大小取
    expect(grid.firstDate).toBe('2024-01-08')
    expect(grid.lastDate).toBe('2024-01-28')
  })

  it('起止日期非法或区间倒置时给一张空网格，档位标尺照样算得出来', () => {
    const grid = buildHeatmapGrid({ startDate: '2024-02-31', endDate: '2024-03-10', value: VALUE })
    expect(grid.rows).toEqual([])
    expect(grid.cells.size).toBe(0)
    expect(grid.firstDate).toBeNull()
    expect(grid.weekDays).toHaveLength(7)
    expect(grid.thresholds.length).toBeGreaterThan(0)

    const reversed = buildHeatmapGrid({ startDate: '2024-03-10', endDate: '2024-01-01' })
    expect(reversed.cells.size).toBe(0)
  })

  it('同一天出现多次即累加，区间外的数据既不进网格也不顶高标尺', () => {
    const grid = buildHeatmapGrid({
      ...RANGE,
      value: [
        { date: '2024-01-05', count: 2 },
        { date: '2024-01-05', count: 3 },
        // 区间之外，不该影响最大值
        { date: '2024-06-01', count: 999 },
        // 日期串不合法，整条丢掉
        { date: '不是日期', count: 40 },
      ],
    })
    expect(grid.cells.get('2024-01-05')!.count).toBe(5)
    expect(grid.max).toBe(5)
    expect(grid.total).toBe(5)
    expect(grid.cells.has('2024-06-01')).toBe(false)
  })

  it('月份按列成段：连着同一个月的列并成一段，段宽就是它占的列数', () => {
    const grid = buildHeatmapGrid({ startDate: '2024-01-01', endDate: '2024-02-29' })
    expect(grid.months.map(month => month.value)).toEqual(['2024-01', '2024-02'])
    const total = grid.months.reduce((sum, month) => sum + month.weeks, 0)
    expect(total).toBe(grid.weekCount)
    expect(grid.months[0]!.weekIndex).toBe(0)
  })

  it('整年十二段，每段起在这个月头一天所在的那一列上', () => {
    const grid = buildHeatmapGrid({ startDate: '2024-01-01', endDate: '2024-12-31' })
    expect(grid.weekCount).toBe(53)
    expect(grid.months).toHaveLength(12)
    for (const month of grid.months) {
      // 1 号不在周首日时它落在上个月尾巴那一列里，月份名要跟着落在同一列
      const first = grid.cells.get(`${month.value}-01`)
      expect(first?.weekIndex).toBe(month.weekIndex)
    }
    expect(grid.months.reduce((sum, month) => sum + month.weeks, 0)).toBe(grid.weekCount)
  })

  it('区间起点在月中时，头一段仍从第 0 列起', () => {
    // 2024-01-15 是星期一，1 月只剩半个月，2 月 1 日（星期四）落在 1-29 那一列
    const grid = buildHeatmapGrid({ startDate: '2024-01-15', endDate: '2024-03-31' })
    expect(grid.months.map(month => month.value)).toEqual(['2024-01', '2024-02', '2024-03'])
    expect(grid.months[0]!.weekIndex).toBe(0)
    expect(grid.months[1]!.weekIndex).toBe(grid.cells.get('2024-02-01')!.weekIndex)
    expect(grid.months[2]!.weekIndex).toBe(grid.cells.get('2024-03-01')!.weekIndex)
  })

  it('起点落在月末时，头一个月照样有名字', () => {
    // 2024-01-29 是星期一，第 0 列是 01-29..02-04，跨 1 月与 2 月两个月
    const grid = buildHeatmapGrid({ startDate: '2024-01-29', endDate: '2024-02-25' })
    expect(grid.months.map(month => month.value)).toEqual(['2024-01', '2024-02'])
    // 第 0 列归 1 月，2 月从第 1 列起：这一列里 1 月只露出 29/30/31 三天
    expect(grid.months[0]!.weeks).toBe(1)
    expect(grid.months[1]!.weekIndex).toBe(1)
    expect(grid.months.reduce((sum, month) => sum + month.weeks, 0)).toBe(grid.weekCount)
  })

  it('第 0 列不跨月时不另起一段', () => {
    // 2024-02-01 是星期四，第 0 列里落在区间内的日子全是 2 月
    const grid = buildHeatmapGrid({ startDate: '2024-02-01', endDate: '2024-02-25' })
    expect(grid.months.map(month => month.value)).toEqual(['2024-02'])
  })
})

describe('heatmap 方向键落点', () => {
  it('列是周、行是天：左右键走相邻的周，上下键走相邻的一天', () => {
    expect(heatmapNavIntentFromKey({ key: 'ArrowRight' })).toBe('inline.next')
    expect(heatmapNavIntentFromKey({ key: 'ArrowLeft' })).toBe('inline.prev')
    expect(heatmapNavIntentFromKey({ key: 'ArrowDown' })).toBe('block.next')
    expect(heatmapNavIntentFromKey({ key: 'ArrowUp' })).toBe('block.prev')
  })

  it('rtl 下左右键语义对调，上下键不受影响', () => {
    expect(heatmapNavIntentFromKey({ key: 'ArrowRight' }, 'rtl')).toBe('inline.prev')
    expect(heatmapNavIntentFromKey({ key: 'ArrowLeft' }, 'rtl')).toBe('inline.next')
    expect(heatmapNavIntentFromKey({ key: 'ArrowDown' }, 'rtl')).toBe('block.next')
  })

  it('ctrl/Meta 只配 Home/End；带 Alt 或 Shift 的组合一律不归导航管', () => {
    expect(heatmapNavIntentFromKey({ key: 'Home' })).toBe('row.start')
    expect(heatmapNavIntentFromKey({ key: 'End' })).toBe('row.end')
    expect(heatmapNavIntentFromKey({ key: 'Home', ctrlKey: true })).toBe('grid.start')
    expect(heatmapNavIntentFromKey({ key: 'End', metaKey: true })).toBe('grid.end')
    expect(heatmapNavIntentFromKey({ key: 'ArrowRight', ctrlKey: true })).toBeNull()
    expect(heatmapNavIntentFromKey({ key: 'ArrowRight', shiftKey: true })).toBeNull()
    expect(heatmapNavIntentFromKey({ key: 'Home', altKey: true })).toBeNull()
    expect(heatmapNavIntentFromKey({ key: 'a' })).toBeNull()
  })

  it('走出区间就给 null，让焦点原地不动', () => {
    const grid = buildHeatmapGrid(RANGE)
    expect(heatmapNavTarget(grid, '2024-01-01', 'inline.next')).toBe('2024-01-08')
    expect(heatmapNavTarget(grid, '2024-01-01', 'block.next')).toBe('2024-01-02')
    expect(heatmapNavTarget(grid, '2024-01-01', 'block.prev')).toBeNull()
    expect(heatmapNavTarget(grid, '2024-01-29', 'inline.next')).toBeNull()
    // 行首行尾按本行实际有的格子取，不按日历上的周界取
    expect(heatmapNavTarget(grid, '2024-01-17', 'row.start')).toBe('2024-01-03')
    expect(heatmapNavTarget(grid, '2024-01-17', 'row.end')).toBe('2024-01-31')
    expect(heatmapNavTarget(grid, '2024-01-17', 'grid.start')).toBe('2024-01-01')
    expect(heatmapNavTarget(grid, '2024-01-17', 'grid.end')).toBe('2024-01-28')
    // 起点不在网格里时无从起步
    expect(heatmapNavTarget(grid, '2023-12-31', 'block.next')).toBeNull()
  })
})

describe('connectHeatmap 网格与格子的属性', () => {
  it('网格是只读的 grid，行是 row、格是 gridcell，且行列数如实报出', () => {
    const harness = mount(RANGE)
    expect(harness.grid.getAttribute('role')).toBe('grid')
    expect(harness.grid.getAttribute('aria-readonly')).toBe('true')
    expect(harness.grid.getAttribute('aria-rowcount')).toBe('7')
    expect(harness.grid.getAttribute('aria-colcount')).toBe('5')
    expect(harness.cell('2024-01-01').getAttribute('role')).toBe('gridcell')
    // 各行格子数不一定齐，列号显式给出来读屏报的才对得上
    expect(harness.cell('2024-01-08').getAttribute('aria-colindex')).toBe('2')
  })

  it('每格的可及名字带日期与计数，档位与色阶位置一并落到格子上', () => {
    const harness = mount({ ...RANGE, value: VALUE })
    const busy = harness.cell('2024-01-02')
    expect(busy.getAttribute('aria-label')).toBe('10 on 2024-01-02')
    expect(busy.getAttribute('data-level')).toBe('4')
    expect(busy.style.getPropertyValue('--xh-_heatmap-level')).toBe('100%')
    const empty = harness.cell('2024-01-10')
    expect(empty.getAttribute('aria-label')).toBe('0 on 2024-01-10')
    expect(empty.getAttribute('data-level')).toBe('0')
    expect(empty.style.getPropertyValue('--xh-_heatmap-level')).toBe('0%')
  })

  it('文案可整条换掉：格子里没有文字，名字只能从这里出', () => {
    const harness = mount({
      ...RANGE,
      value: VALUE,
      translations: { cellLabel: details => `${details.date} 共 ${details.count} 次`, gridLabel: '活跃度' },
    })
    expect(harness.grid.getAttribute('aria-label')).toBe('活跃度')
    expect(harness.cell('2024-01-02').getAttribute('aria-label')).toBe('2024-01-02 共 10 次')
  })

  it('整张网格只占一个 Tab 位：锚点那一格是 0，其余全是 -1，网格自己让位', () => {
    const harness = mount(RANGE)
    const stops = [...harness.grid.querySelectorAll('[tabindex="0"]')]
    expect(stops).toHaveLength(1)
    expect(stops[0]).toBe(harness.cell('2024-01-01'))
    expect(harness.grid.getAttribute('tabindex')).toBe('-1')
  })

  it('一格都没有时网格自己兜底占住 Tab 位，否则 Tab 序列里整块凭空消失', () => {
    const harness = mount({ startDate: '2024-03-10', endDate: '2024-01-01' })
    expect(harness.grid.getAttribute('tabindex')).toBe('0')
    // 没有行可描述时两个总数一并不写，免得读屏念出「0 行 0 列」
    expect(harness.grid.getAttribute('aria-rowcount')).toBeNull()
    expect(harness.grid.getAttribute('aria-colcount')).toBeNull()
  })

  it('月份行不给 style 这个键，而不是给 undefined：给了会把作者写在行上的内联样式整条删掉', () => {
    const api = apiOf(mount(RANGE).service)
    expect('style' in (api.getRowProps({}) as Record<string, unknown>)).toBe(false)
    expect('style' in (api.getRowProps({ weekDay: 0 }) as Record<string, unknown>)).toBe(true)
  })

  it('月份行不冒充表格行：不给 weekDay 就不带 role，星期名与月份名一律藏起来', () => {
    const harness = mount(RANGE)
    const api = apiOf(harness.service)
    const monthRow = api.getRowProps({}) as Record<string, unknown>
    expect(monthRow.role).toBeUndefined()
    expect(monthRow['aria-rowindex']).toBeUndefined()
    const weekRow = api.getRowProps({ weekDay: 2 }) as Record<string, unknown>
    expect(weekRow.role).toBe('row')
    expect(weekRow['aria-rowindex']).toBe(3)
    expect((api.getWeekDayLabelProps({ weekDay: 0 }) as Record<string, unknown>)['aria-hidden']).toBe('true')
    expect((api.getMonthLabelProps({ value: '2024-01' }) as Record<string, unknown>)['aria-hidden']).toBe('true')
    // 图例容器不藏：作者写在色块旁的「少 → 多」要念得到；藏的是色块本身
    expect((api.getLegendProps() as Record<string, unknown>)['aria-hidden']).toBeUndefined()
    expect((api.getLegendItemProps({ level: 1 }) as Record<string, unknown>)['aria-hidden']).toBe('true')
  })

  it('月份名的宽度按它占的列数给出，图例的色块与格子共用同一条色阶', () => {
    const api = apiOf(mount({ startDate: '2024-01-01', endDate: '2024-02-29' }).service)
    const label = api.getMonthLabelProps({ value: '2024-01' }) as Record<string, unknown>
    // 1 月占 0-3 四列：1-29 那一列里已经有 2 月 1 日，它归 2 月
    expect((label.style as Record<string, string>)['--xh-_heatmap-month-weeks']).toBe('4')
    const legendItem = api.getLegendItemProps({ level: 2 }) as Record<string, unknown>
    expect(legendItem['data-level']).toBe('2')
    expect((legendItem.style as Record<string, string>)['--xh-_heatmap-level']).toBe('50%')
  })

  it('起点不在周首日的那几行带上错列数，皮肤照着把整行往后推一格', () => {
    const api = apiOf(mount({ startDate: '2024-01-03', endDate: '2024-01-31' }).service)
    const first = api.getRowProps({ weekDay: 0 }) as Record<string, unknown>
    const third = api.getRowProps({ weekDay: 2 }) as Record<string, unknown>
    expect((first.style as Record<string, string>)['--xh-_heatmap-row-offset']).toBe('1')
    expect((third.style as Record<string, string>)['--xh-_heatmap-row-offset']).toBe('0')
  })

  it('三轴只落在 root 上，子部件不重复标注', () => {
    const api = apiOf(mount({ ...RANGE, tone: 'success', size: 'lg' }).service)
    const root = api.getRootProps() as Record<string, unknown>
    expect(root['data-tone']).toBe('success')
    expect(root['data-size']).toBe('lg')
    const cell = api.getCellProps({ date: '2024-01-01' }) as Record<string, unknown>
    expect(cell['data-tone']).toBeUndefined()
    expect(cell['data-size']).toBeUndefined()
  })
})

describe('connectHeatmap 键盘走格', () => {
  it('方向键把焦点搬到相邻的周与相邻的天，锚点跟着走', () => {
    const harness = mount(RANGE)
    harness.cell('2024-01-01').focus()
    harness.render()

    expect(press(harness, 'ArrowRight')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-08'))
    expect(press(harness, 'ArrowDown')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-09'))
    expect(press(harness, 'ArrowLeft')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-02'))
    expect(press(harness, 'ArrowUp')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-01'))
    // 锚点跟着焦点走，Tab 位也跟着搬
    expect(harness.cell('2024-01-01').getAttribute('tabindex')).toBe('0')
  })

  it('走到边界原地不动，但按键照样拦下：不然页面会跟着滚', () => {
    const harness = mount(RANGE)
    harness.cell('2024-01-01').focus()
    harness.render()
    expect(press(harness, 'ArrowUp')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-01'))
  })

  it('home/End 走本行的首末格，Ctrl 加持才跳到整张网格的两端', () => {
    const harness = mount(RANGE)
    harness.cell('2024-01-17').focus()
    harness.render()

    expect(press(harness, 'Home')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-03'))
    expect(press(harness, 'End')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-31'))
    expect(press(harness, 'Home', { ctrlKey: true })).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-01'))
    expect(press(harness, 'End', { ctrlKey: true })).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-28'))
  })

  it('不归导航管的键一律放行：网格不吞 Space，也不吞带修饰键的方向键', () => {
    const harness = mount(RANGE)
    harness.cell('2024-01-01').focus()
    harness.render()
    expect(press(harness, ' ')).toBe(false)
    expect(press(harness, 'ArrowRight', { shiftKey: true })).toBe(false)
    expect(document.activeElement).toBe(harness.cell('2024-01-01'))
  })

  it('显式给了 dir=rtl，左右键就按视觉次序走', () => {
    const harness = mount({ ...RANGE, dir: 'rtl' })
    harness.cell('2024-01-08').focus()
    harness.render()
    expect(press(harness, 'ArrowLeft')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-15'))
    expect(press(harness, 'ArrowRight')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-08'))
  })

  it('焦点落到某一天只通知一次，原地重复聚焦不再通知', () => {
    const harness = mount({ ...RANGE, value: VALUE })
    harness.cell('2024-01-02').focus()
    harness.render()
    expect(harness.focuses).toEqual([{ date: '2024-01-02', row: '', column: '', count: 10, level: 4, percent: 100 }])

    harness.cell('2024-01-02').focus()
    harness.render()
    expect(harness.focuses).toHaveLength(1)

    press(harness, 'ArrowDown')
    expect(harness.focuses).toHaveLength(2)
    expect(harness.focuses[1]).toEqual({ date: '2024-01-03', row: '', column: '', count: 0, level: 0, percent: 0 })
  })

  it('程序化挪锚点只改锚点，不报「焦点落到了这一天」：DOM 焦点根本没动', () => {
    const harness = mount({ ...RANGE, value: VALUE })
    harness.service.send({ type: 'FOCUS.SET', cell: { date: '2024-01-02' } })
    harness.render()
    expect(apiOf(harness.service).focusedDate).toBe('2024-01-02')
    expect(harness.focuses).toEqual([])

    // 焦点真的落上去才通知
    harness.cell('2024-01-01').focus()
    harness.render()
    expect(harness.focuses).toEqual([{ date: '2024-01-01', row: '', column: '', count: 1, level: 1, percent: 25 }])
  })

  it('区间换掉后锚点悬空，Tab 位退回文档序头一格：不然一个停靠点都没有，键盘再也进不来', () => {
    const harness = mount(RANGE)
    harness.cell('2024-01-31').focus()
    harness.render()
    expect(apiOf(harness.service).anchorDate).toBe('2024-01-31')

    // 焦点那天已不在新区间里
    const later = mount({ startDate: '2024-03-01', endDate: '2024-03-31' })
    later.service.send({ type: 'FOCUS.SET', cell: { date: '2024-01-31' } })
    later.render()
    const api = apiOf(later.service)
    expect(api.focusedDate).toBe('2024-01-31')
    expect(api.anchorDate).toBe(later.cell('2024-03-04').getAttribute('data-value'))
    expect(later.cell('2024-03-04').getAttribute('tabindex')).toBe('0')
  })
})

// ── 月历形态 ──

describe('buildHeatmapMonthGrid 月历网格', () => {
  it('一个自然月一块，1 号落在它真实的星期几上', () => {
    // 2024-02-01 是星期四，周首日是星期一，于是它落在第 3 列，首周行前面空 3 格
    const grid = buildHeatmapMonthGrid({ startDate: '2024-02-01', endDate: '2024-03-31' })
    expect(grid.blocks.map(block => block.value)).toEqual(['2024-02', '2024-03'])
    const first = grid.blocks[0]!.weeks[0]!
    expect(first.offset).toBe(3)
    expect(first.cells[0]!.date).toBe('2024-02-01')
    expect(first.cells[0]!.weekDay).toBe(3)
    // 2024-03-01 是星期五
    expect(grid.blocks[1]!.weeks[0]!.offset).toBe(4)
  })

  it('行号在整张网格里连着排，读屏报的行号不会每块从头来一遍', () => {
    const grid = buildHeatmapMonthGrid({ startDate: '2024-01-01', endDate: '2024-02-29' })
    expect(grid.weeks.map(row => row.rowIndex)).toEqual(grid.weeks.map((_, index) => index))
    expect(grid.blocks[1]!.weeks[0]!.rowIndex).toBe(grid.blocks[0]!.weeks.length)
  })

  it('区间只覆盖半个月时只铺那半个月，不补区间外的日子', () => {
    const grid = buildHeatmapMonthGrid({ startDate: '2024-01-20', endDate: '2024-02-05' })
    expect(grid.firstDate).toBe('2024-01-20')
    expect(grid.lastDate).toBe('2024-02-05')
    expect(grid.cells.has('2024-01-19')).toBe(false)
    expect(grid.cells.has('2024-02-06')).toBe(false)
    expect(grid.blocks[0]!.weeks[0]!.cells[0]!.date).toBe('2024-01-20')
  })

  it('与日历形态共用同一套分档：同样的数据同样的档位', () => {
    const options = { startDate: '2024-01-01', endDate: '2024-01-31', value: VALUE }
    const month = buildHeatmapMonthGrid(options)
    const calendar = buildHeatmapGrid(options)
    expect(month.levels).toBe(calendar.levels)
    expect(month.thresholds).toEqual(calendar.thresholds)
    expect(month.cells.get('2024-01-02')!.level).toBe(calendar.cells.get('2024-01-02')!.level)
  })

  it('区间非法给一张空网格', () => {
    const grid = buildHeatmapMonthGrid({ startDate: '2024-03-10', endDate: '2024-01-01' })
    expect(grid.blocks).toEqual([])
    expect(grid.firstDate).toBeNull()
  })
})

describe('heatmapMonthNavTarget 月历落点', () => {
  const grid = buildHeatmapMonthGrid({ startDate: '2024-01-01', endDate: '2024-03-31' })

  it('横着走一天、竖着走一周：两条轴与日历形态正好对调', () => {
    expect(heatmapMonthNavTarget(grid, '2024-01-10', 'inline.next')).toBe('2024-01-11')
    expect(heatmapMonthNavTarget(grid, '2024-01-10', 'inline.prev')).toBe('2024-01-09')
    expect(heatmapMonthNavTarget(grid, '2024-01-10', 'block.next')).toBe('2024-01-17')
    expect(heatmapMonthNavTarget(grid, '2024-01-10', 'block.prev')).toBe('2024-01-03')
  })

  it('走到月末会落进下一块，不会困在一块里', () => {
    expect(heatmapMonthNavTarget(grid, '2024-01-31', 'inline.next')).toBe('2024-02-01')
    expect(heatmapMonthNavTarget(grid, '2024-02-01', 'inline.prev')).toBe('2024-01-31')
    // 竖着跨块同理：1 月 29 日往下一周就是 2 月 5 日
    expect(heatmapMonthNavTarget(grid, '2024-01-29', 'block.next')).toBe('2024-02-05')
  })

  it('home/End 走本周行在本月里的首末格，跨不出这一块', () => {
    // 2024-02-01 是星期四，它那一周在 2 月里只有 4 号到 1 号这几天
    expect(heatmapMonthNavTarget(grid, '2024-02-02', 'row.start')).toBe('2024-02-01')
    expect(heatmapMonthNavTarget(grid, '2024-02-02', 'row.end')).toBe('2024-02-04')
    expect(heatmapMonthNavTarget(grid, '2024-02-07', 'row.start')).toBe('2024-02-05')
  })

  it('两头走出区间给 null，Ctrl 加持的两键跳到整段区间的两端', () => {
    expect(heatmapMonthNavTarget(grid, '2024-01-01', 'inline.prev')).toBeNull()
    expect(heatmapMonthNavTarget(grid, '2024-03-31', 'inline.next')).toBeNull()
    expect(heatmapMonthNavTarget(grid, '2024-02-02', 'grid.start')).toBe('2024-01-01')
    expect(heatmapMonthNavTarget(grid, '2024-02-02', 'grid.end')).toBe('2024-03-31')
  })
})

// ── 矩阵形态 ──

const MATRIX_ROWS = ['周一', '周二', '周三']
const MATRIX_COLUMNS = ['上午', '下午', '夜里']
const MATRIX_VALUE = [
  { row: '周一', column: '上午', value: 2 },
  { row: '周一', column: '上午', value: 3 },
  { row: '周二', column: '夜里', value: 10 },
  // 轴上没有的行，写了也不该进网格
  { row: '周日', column: '上午', value: 99 },
]

describe('buildHeatmapMatrixGrid 矩阵网格', () => {
  it('行列的身份与顺序全按作者给的来，重复的与空的丢掉', () => {
    const grid = buildHeatmapMatrixGrid({
      rows: ['b', 'a', 'b', ''],
      columns: [{ value: 'x', label: '横' }, 'y'],
    })
    expect(grid.rows.map(row => row.value)).toEqual(['b', 'a'])
    expect(grid.columns.map(column => column.label)).toEqual(['横', 'y'])
    expect(grid.columns[0]!.index).toBe(0)
  })

  it('同一格出现多次即累加，轴外的数据既不进网格也不把标尺顶高', () => {
    const grid = buildHeatmapMatrixGrid({ rows: MATRIX_ROWS, columns: MATRIX_COLUMNS, value: MATRIX_VALUE })
    expect(grid.cells.get(heatmapMatrixKey('周一', '上午'))!.count).toBe(5)
    expect(grid.cells.get(heatmapMatrixKey('周三', '夜里'))!.count).toBe(0)
    expect(grid.cells.has(heatmapMatrixKey('周日', '上午'))).toBe(false)
    expect(grid.max).toBe(10)
  })

  it('整张网格铺满行 × 列，文档序的两端也报得出来', () => {
    const grid = buildHeatmapMatrixGrid({ rows: MATRIX_ROWS, columns: MATRIX_COLUMNS, value: MATRIX_VALUE })
    expect(grid.cells.size).toBe(9)
    expect(grid.firstCell).toMatchObject({ row: '周一', column: '上午' })
    expect(grid.lastCell).toMatchObject({ row: '周三', column: '夜里' })
  })

  it('一条轴都没给就是一张空网格', () => {
    const grid = buildHeatmapMatrixGrid({ rows: MATRIX_ROWS })
    expect(grid.cells.size).toBe(0)
    expect(grid.firstCell).toBeNull()
  })
})

describe('heatmapMatrixNavTarget 矩阵落点', () => {
  const grid = buildHeatmapMatrixGrid({ rows: MATRIX_ROWS, columns: MATRIX_COLUMNS, value: MATRIX_VALUE })

  it('横着走一列、竖着走一行', () => {
    expect(heatmapMatrixNavTarget(grid, { row: '周二', column: '下午' }, 'inline.next'))
      .toEqual({ row: '周二', column: '夜里' })
    expect(heatmapMatrixNavTarget(grid, { row: '周二', column: '下午' }, 'inline.prev'))
      .toEqual({ row: '周二', column: '上午' })
    expect(heatmapMatrixNavTarget(grid, { row: '周二', column: '下午' }, 'block.next'))
      .toEqual({ row: '周三', column: '下午' })
    expect(heatmapMatrixNavTarget(grid, { row: '周二', column: '下午' }, 'block.prev'))
      .toEqual({ row: '周一', column: '下午' })
  })

  it('四面到边就停住，不绕回另一头', () => {
    expect(heatmapMatrixNavTarget(grid, { row: '周一', column: '上午' }, 'inline.prev')).toBeNull()
    expect(heatmapMatrixNavTarget(grid, { row: '周一', column: '上午' }, 'block.prev')).toBeNull()
    expect(heatmapMatrixNavTarget(grid, { row: '周三', column: '夜里' }, 'inline.next')).toBeNull()
    expect(heatmapMatrixNavTarget(grid, { row: '周三', column: '夜里' }, 'block.next')).toBeNull()
  })

  it('home/End 走本行的首末列，Ctrl 加持的两键跳到整张网格的两端', () => {
    expect(heatmapMatrixNavTarget(grid, { row: '周二', column: '下午' }, 'row.start'))
      .toEqual({ row: '周二', column: '上午' })
    expect(heatmapMatrixNavTarget(grid, { row: '周二', column: '下午' }, 'row.end'))
      .toEqual({ row: '周二', column: '夜里' })
    expect(heatmapMatrixNavTarget(grid, { row: '周二', column: '下午' }, 'grid.start'))
      .toEqual({ row: '周一', column: '上午' })
    expect(heatmapMatrixNavTarget(grid, { row: '周二', column: '下午' }, 'grid.end'))
      .toEqual({ row: '周三', column: '夜里' })
  })

  it('起点不在网格里时哪儿也去不了', () => {
    expect(heatmapMatrixNavTarget(grid, { row: '周日', column: '上午' }, 'inline.next')).toBeNull()
  })
})

describe('heatmapDetailsOf 一格的全部数据', () => {
  it('日期形态报日期、计数、档位与色阶位置', () => {
    const details = heatmapDetailsOf({ startDate: '2024-01-01', endDate: '2024-01-31', value: VALUE }, { date: '2024-01-02' })
    expect(details).toEqual({ date: '2024-01-02', row: '', column: '', count: 10, level: 4, percent: 100 })
  })

  it('矩阵形态报行列身份，日期是空串', () => {
    const details = heatmapDetailsOf(
      { variant: 'matrix', rows: MATRIX_ROWS, columns: MATRIX_COLUMNS, value: MATRIX_VALUE },
      { row: '周一', column: '上午' },
    )
    expect(details).toMatchObject({ date: '', row: '周一', column: '上午', count: 5 })
  })

  it('网格里没有这一格时给 0，不是报错', () => {
    const details = heatmapDetailsOf(
      { variant: 'matrix', rows: MATRIX_ROWS, columns: MATRIX_COLUMNS, value: MATRIX_VALUE },
      { row: '周日', column: '上午' },
    )
    expect(details.count).toBe(0)
    expect(details.level).toBe(0)
  })
})

describe('详情条的几何', () => {
  const host = { left: 100, top: 50, width: 400, height: 200 }
  const cell = { left: 160, top: 90, width: 10, height: 10 }

  it('ltr 下从起始缘往后量，横向滚过的距离要加回去', () => {
    expect(resolveHeatmapTip(host, cell, 0, 0, false)).toEqual({
      inlineStart: 60,
      blockStart: 40,
      inlineSize: 10,
      blockSize: 10,
      inlineAnchor: 'start',
    })
    expect(resolveHeatmapTip(host, cell, 30, 5, false).inlineStart).toBe(90)
    expect(resolveHeatmapTip(host, cell, 30, 5, false).blockStart).toBe(45)
  })

  it('条往两侧空间大的那一边长；滚动量不参与这个判断', () => {
    // 承载盒 400 宽，格子起始缘在 60：末缘之前只有 70，起始缘之后还有 340
    expect(resolveHeatmapTip(host, cell, 0, 0, false).inlineAnchor).toBe('start')
    expect(resolveHeatmapTip(host, cell, 300, 0, false).inlineAnchor).toBe('start')
    // 格子挪到后段：末缘之前 250、起始缘之后 60，再往后长就伸出容器被裁掉
    const late = { ...cell, left: 340 }
    expect(resolveHeatmapTip(host, late, 0, 0, false).inlineAnchor).toBe('end')
    // 分界线把格子自己那一格算进末缘之前：起始缘 195 时两侧各 205 与 205，还不翻
    expect(resolveHeatmapTip(host, { ...cell, left: 295 }, 0, 0, false).inlineAnchor).toBe('start')
    expect(resolveHeatmapTip(host, { ...cell, left: 296 }, 0, 0, false).inlineAnchor).toBe('end')
    // rtl 下起始缘从右往左量，判断的是同一件事
    expect(resolveHeatmapTip(host, { ...cell, left: 120 }, 0, 0, true).inlineAnchor).toBe('end')
    expect(resolveHeatmapTip(host, late, 0, 0, true).inlineAnchor).toBe('start')
  })

  it('rtl 下从末缘往回量，滚动量的符号跟着反过来', () => {
    // 承载盒右缘 500，格子右缘 170，起始缘距离 330
    expect(resolveHeatmapTip(host, cell, 0, 0, true).inlineStart).toBe(330)
    expect(resolveHeatmapTip(host, cell, -30, 0, true).inlineStart).toBe(360)
  })

  it('两次量到同一个结果就不该算作变更', () => {
    const rect = resolveHeatmapTip(host, cell, 0, 0, false)
    expect(sameHeatmapTip(rect, resolveHeatmapTip(host, cell, 0, 0, false))).toBe(true)
    expect(sameHeatmapTip(rect, resolveHeatmapTip(host, cell, 1, 0, false))).toBe(false)
    expect(sameHeatmapTip(null, null)).toBe(true)
  })

  it('落在下半的格子把详情条摆到上边，免得压出网格外', () => {
    expect(heatmapTipPlacement(0, 7)).toBe('block-end')
    expect(heatmapTipPlacement(3, 7)).toBe('block-end')
    expect(heatmapTipPlacement(4, 7)).toBe('block-start')
    expect(heatmapTipPlacement(6, 7)).toBe('block-start')
    // 一行都没有时不至于算出别的花样
    expect(heatmapTipPlacement(0, 0)).toBe('block-end')
  })
})

/** 月历形态的活 DOM：root > grid > 月块（标题 + 星期名轴 + 逐周一行），外加一条详情条。 */
function mountMonth(initial: Props = {}): MultiHarness {
  return mountVariant({ ...initial, variant: 'month' }, (api, doc) => {
    const grid = doc.grid
    const monthGrid = api.monthGrid!
    for (const block of monthGrid.blocks) {
      const blockEl = document.createElement('div')
      doc.spread(blockEl, api.getMonthBlockProps({ value: block.value }))
      const title = document.createElement('span')
      doc.spread(title, api.getMonthLabelProps({ value: block.value }))
      blockEl.append(title)

      const axis = document.createElement('div')
      doc.spread(axis, api.getRowProps({}))
      for (const day of monthGrid.weekDays) {
        const label = document.createElement('span')
        doc.spread(label, api.getWeekDayLabelProps({ weekDay: day.weekDay }))
        axis.append(label)
      }
      blockEl.append(axis)

      for (const row of block.weeks) {
        const rowEl = document.createElement('div')
        doc.spread(rowEl, api.getRowProps({ month: block.value, week: row.week }))
        for (const meta of row.cells) {
          const cellEl = document.createElement('div')
          doc.cells.set(meta.date, cellEl)
          rowEl.append(cellEl)
        }
        blockEl.append(rowEl)
      }
      grid.append(blockEl)
    }
    for (const [date, el] of doc.cells)
      doc.spread(el, api.getCellProps({ date }))
  })
}

/** 矩阵形态的活 DOM：root > grid > 表头行（角落占位 + 列名）+ 逐行（行名 + 逐列一格）。 */
function mountMatrix(initial: Props = {}): MultiHarness {
  return mountVariant({ ...initial, variant: 'matrix' }, (api, doc) => {
    const matrix = api.matrixGrid!
    const header = document.createElement('div')
    doc.spread(header, api.getRowProps({}))
    const corner = document.createElement('span')
    doc.spread(corner, api.getRowLabelProps({}))
    header.append(corner)
    for (const column of matrix.columns) {
      const label = document.createElement('span')
      doc.spread(label, api.getColumnLabelProps({ value: column.value }))
      header.append(label)
    }
    doc.grid.append(header)

    for (const row of matrix.rows) {
      const rowEl = document.createElement('div')
      doc.spread(rowEl, api.getRowProps({ row: row.value }))
      const label = document.createElement('span')
      doc.spread(label, api.getRowLabelProps({ value: row.value }))
      rowEl.append(label)
      for (const column of matrix.columns) {
        const cellEl = document.createElement('div')
        doc.cells.set(`${row.value}/${column.value}`, cellEl)
        doc.spread(cellEl, api.getCellProps({ row: row.value, column: column.value }))
        rowEl.append(cellEl)
      }
      doc.grid.append(rowEl)
    }
  })
}

interface MultiHarness {
  service: Service<HeatmapSchema>
  root: HTMLElement
  grid: HTMLElement
  tooltip: HTMLElement
  cell: (key: string) => HTMLElement
  render: () => void
  /** 换一份 props 并触发一轮 tracker：props 装在裸 signal 里，写它才通知得到。 */
  setProps: (next: Partial<Props>) => void
  focuses: HeatmapCellFocusDetails[]
  actives: (HeatmapCellFocusDetails | null)[]
}

interface BuildDoc {
  grid: HTMLElement
  cells: Map<string, HTMLElement>
  spread: (el: HTMLElement, props: unknown) => void
}

/** 月历与矩阵共用的挂载：结构由 build 铺，属性每次 render 全量重打。 */
function mountVariant(
  initial: Props,
  build: (api: ReturnType<typeof apiOf>, doc: BuildDoc) => void,
): MultiHarness {
  const focuses: HeatmapCellFocusDetails[] = []
  const actives: (HeatmapCellFocusDetails | null)[] = []
  const props: Props = {
    ...initial,
    onCellFocus: details => focuses.push(details),
    onCellActive: details => actives.push(details),
  }
  const runtime = createVanillaRuntime()
  const propsSignal = runtime.signal<Props>(props)
  const service = createService(heatmapMachine, { props: () => propsSignal.get(), runtime })
  runtime.start()

  const root = document.createElement('div')
  const grid = document.createElement('div')
  const tooltip = document.createElement('div')
  root.append(grid, tooltip)
  document.body.append(root)

  const cells = new Map<string, HTMLElement>()
  const put = (el: HTMLElement, p: unknown): void => spread(el, p as Record<string, unknown>)
  build(apiOf(service), { grid, cells, spread: put })

  const render = (): void => {
    const api = apiOf(service)
    put(root, api.getRootProps())
    put(grid, api.getGridProps())
    put(tooltip, api.getTooltipProps())
    for (const [key, el] of cells) {
      const parts = key.split('/')
      put(el, parts.length === 2 ? api.getCellProps({ row: parts[0], column: parts[1] }) : api.getCellProps({ date: key }))
    }
  }
  render()

  const setProps = (next: Partial<Props>): void => {
    propsSignal.set({ ...propsSignal.get(), ...next })
    render()
  }

  return { service, root, grid, tooltip, cell: key => cells.get(key)!, render, setProps, focuses, actives }
}

/** 给一格按上一份固定的量测：jsdom 里所有盒子都是零，不打桩两路量测分不出来。 */
function stubRect(el: HTMLElement, top: number): void {
  el.getBoundingClientRect = () => ({
    left: 0,
    top,
    right: 12,
    bottom: top + 12,
    width: 12,
    height: 12,
    x: 0,
    y: top,
    toJSON: () => ({}),
  })
}

/** 派一次指针进出；jsdom 没有 PointerEvent 构造器，处理器只用 currentTarget，普通事件够用。 */
function point(el: HTMLElement, type: 'pointerenter' | 'pointerleave'): void {
  el.dispatchEvent(new Event(type))
}

describe('connectHeatmap 月历形态', () => {
  const RANGE_MONTH: Props = { startDate: '2024-01-01', endDate: '2024-02-29' }

  it('网格报的行数是所有月块的周行之和，列数恒是七', () => {
    const harness = mountMonth(RANGE_MONTH)
    expect(harness.grid.getAttribute('role')).toBe('grid')
    expect(harness.grid.getAttribute('aria-colcount')).toBe('7')
    const weeks = apiOf(harness.service).monthGrid!.weeks.length
    expect(harness.grid.getAttribute('aria-rowcount')).toBe(String(weeks))
  })

  it('月块是 rowgroup 并带月份的长名字，块里的星期名轴整条藏起来', () => {
    const api = apiOf(mountMonth(RANGE_MONTH).service)
    const block = api.getMonthBlockProps({ value: '2024-01' }) as Record<string, unknown>
    expect(block.role).toBe('rowgroup')
    expect(String(block['aria-label'])).toContain('1')
    const axis = api.getRowProps({}) as Record<string, unknown>
    expect(axis['aria-hidden']).toBe('true')
    expect(axis.role).toBeUndefined()
  })

  it('周行带连着排的行号与本周的错列数', () => {
    const api = apiOf(mountMonth(RANGE_MONTH).service)
    const first = api.getRowProps({ month: '2024-01', week: 0 }) as Record<string, unknown>
    expect(first.role).toBe('row')
    expect(first['aria-rowindex']).toBe(1)
    // 2024-01-01 正好是星期一，首周不错列
    expect((first.style as Record<string, string>)['--xh-_heatmap-row-offset']).toBe('0')
    // 2024-02-01 是星期四
    const february = api.getRowProps({ month: '2024-02', week: 0 }) as Record<string, unknown>
    expect((february.style as Record<string, string>)['--xh-_heatmap-row-offset']).toBe('3')
  })

  it('格子的列号是星期几，可及名字仍带完整日期', () => {
    const harness = mountMonth({ ...RANGE_MONTH, value: [{ date: '2024-01-04', count: 6 }] })
    const cell = harness.cell('2024-01-04')
    expect(cell.getAttribute('role')).toBe('gridcell')
    // 星期四，周首日是星期一，列号 4
    expect(cell.getAttribute('aria-colindex')).toBe('4')
    expect(cell.getAttribute('aria-label')).toBe('6 on 2024-01-04')
  })

  it('方向键横着走一天、竖着走一周，走到月末落进下一块', () => {
    const harness = mountMonth(RANGE_MONTH)
    harness.cell('2024-01-30').focus()
    harness.render()
    expect(press(harness as unknown as Harness, 'ArrowRight')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-31'))
    press(harness as unknown as Harness, 'ArrowRight')
    expect(document.activeElement).toBe(harness.cell('2024-02-01'))
    press(harness as unknown as Harness, 'ArrowDown')
    expect(document.activeElement).toBe(harness.cell('2024-02-08'))
    press(harness as unknown as Harness, 'ArrowUp')
    expect(document.activeElement).toBe(harness.cell('2024-02-01'))
  })
})

describe('connectHeatmap 矩阵形态', () => {
  const MATRIX: Props = { rows: MATRIX_ROWS, columns: MATRIX_COLUMNS, value: MATRIX_VALUE }

  it('行列数把两条表头也算进去，表头行是真正的第一行', () => {
    const harness = mountMatrix(MATRIX)
    expect(harness.grid.getAttribute('aria-rowcount')).toBe('4')
    expect(harness.grid.getAttribute('aria-colcount')).toBe('4')
    const api = apiOf(harness.service)
    const header = api.getRowProps({}) as Record<string, unknown>
    expect(header.role).toBe('row')
    expect(header['aria-rowindex']).toBe(1)
    const row = api.getRowProps({ row: '周二' }) as Record<string, unknown>
    expect(row['aria-rowindex']).toBe(3)
  })

  it('行名是 rowheader、列名是 columnheader，角落占位不进读屏', () => {
    const api = apiOf(mountMatrix(MATRIX).service)
    const corner = api.getRowLabelProps({}) as Record<string, unknown>
    expect(corner['aria-hidden']).toBe('true')
    expect(corner.role).toBeUndefined()
    const rowLabel = api.getRowLabelProps({ value: '周一' }) as Record<string, unknown>
    expect(rowLabel.role).toBe('rowheader')
    expect(rowLabel['aria-colindex']).toBe(1)
    const columnLabel = api.getColumnLabelProps({ value: '夜里' }) as Record<string, unknown>
    expect(columnLabel.role).toBe('columnheader')
    expect(columnLabel['aria-colindex']).toBe(4)
  })

  it('一格的身份是「行 + 列」两个属性，可及名字走矩阵那条文案', () => {
    const harness = mountMatrix(MATRIX)
    const cell = harness.cell('周一/上午')
    expect(cell.getAttribute('data-value')).toBe('上午')
    expect(cell.getAttribute('data-row')).toBe('周一')
    expect(cell.getAttribute('aria-colindex')).toBe('2')
    expect(cell.getAttribute('aria-label')).toBe('5 at 周一 上午')
    expect(cell.getAttribute('tabindex')).toBe('0')
  })

  it('文案整条可换，档位按矩阵自己的最大值分', () => {
    const harness = mountMatrix({
      ...MATRIX,
      translations: { matrixCellLabel: details => `${details.row} 的 ${details.column}：${details.count}` },
    })
    expect(harness.cell('周二/夜里').getAttribute('aria-label')).toBe('周二 的 夜里：10')
    expect(harness.cell('周二/夜里').getAttribute('data-level')).toBe('4')
    expect(harness.cell('周三/夜里').getAttribute('data-level')).toBe('0')
  })

  it('方向键按行列走，四面到边就停住', () => {
    const harness = mountMatrix(MATRIX)
    harness.cell('周一/上午').focus()
    harness.render()
    press(harness as unknown as Harness, 'ArrowRight')
    expect(document.activeElement).toBe(harness.cell('周一/下午'))
    press(harness as unknown as Harness, 'ArrowDown')
    expect(document.activeElement).toBe(harness.cell('周二/下午'))
    press(harness as unknown as Harness, 'End')
    expect(document.activeElement).toBe(harness.cell('周二/夜里'))
    // 已在末列，再往右不动，但按键照样拦下
    expect(press(harness as unknown as Harness, 'ArrowRight')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('周二/夜里'))
  })

  it('矩阵形态不谈日期：焦点日期与锚点日期恒为 null', () => {
    const harness = mountMatrix(MATRIX)
    harness.cell('周二/下午').focus()
    harness.render()
    const api = apiOf(harness.service)
    expect(api.focusedDate).toBeNull()
    expect(api.anchorDate).toBeNull()
    expect(api.anchorCell).toEqual({ row: '周二', column: '下午' })
  })
})

describe('connectHeatmap 悬停详情', () => {
  const RANGE_TIP: Props = { startDate: '2024-01-01', endDate: '2024-01-31', value: VALUE }

  it('不写 variant 时 root 上不产出 data-variant：默认那一档的行为逐字不变', () => {
    const harness = mount(RANGE_TIP)
    expect(harness.root.getAttribute('data-variant')).toBeNull()
    expect(apiOf(harness.service).variant).toBe('calendar')
  })

  it('内容与落点取自同一路：heatmapActiveCell 与 heatmapActiveTip 挑的是同一格', () => {
    const hoverTip = { inlineStart: 1, blockStart: 2, inlineSize: 12, blockSize: 12, inlineAnchor: 'start' } as const
    const focusTip = { inlineStart: 3, blockStart: 4, inlineSize: 12, blockSize: 12, inlineAnchor: 'start' } as const
    const both = {
      hoveredCell: { date: '2024-01-01' },
      focusedCell: { date: '2024-01-02' },
      focusWithin: true,
      dismissed: false,
    }
    expect(heatmapActiveSource(both)).toBe('hovered')
    expect(heatmapActiveCell(both)).toEqual({ date: '2024-01-01' })
    expect(heatmapActiveTip({ ...both, hoverTip, focusTip })).toBe(hoverTip)

    const onlyFocus = { ...both, hoveredCell: null }
    expect(heatmapActiveSource(onlyFocus)).toBe('focused')
    expect(heatmapActiveCell(onlyFocus)).toEqual({ date: '2024-01-02' })
    expect(heatmapActiveTip({ ...onlyFocus, hoverTip, focusTip })).toBe(focusTip)

    const dismissed = { ...both, dismissed: true }
    expect(heatmapActiveSource(dismissed)).toBeNull()
    expect(heatmapActiveCell(dismissed)).toBeNull()
    expect(heatmapActiveTip({ ...dismissed, hoverTip, focusTip })).toBeNull()
  })

  it('指针进到某一格就把详情打开，离开即收起', () => {
    const harness = mountMonth(RANGE_TIP)
    expect(harness.tooltip.hasAttribute('hidden')).toBe(true)

    point(harness.cell('2024-01-02'), 'pointerenter')
    harness.render()
    expect(harness.tooltip.hasAttribute('hidden')).toBe(false)
    expect(apiOf(harness.service).activeCell).toMatchObject({ date: '2024-01-02', count: 10, level: 4 })

    point(harness.cell('2024-01-02'), 'pointerleave')
    harness.render()
    expect(harness.tooltip.hasAttribute('hidden')).toBe(true)
  })

  it('键盘聚焦同样打开详情，焦点走出网格才收起', () => {
    const harness = mountMonth(RANGE_TIP)
    harness.cell('2024-01-02').focus()
    harness.render()
    expect(harness.tooltip.hasAttribute('hidden')).toBe(false)
    expect(apiOf(harness.service).activeCell).toMatchObject({ date: '2024-01-02' })

    // 网格内换一格不算离场
    harness.cell('2024-01-03').focus()
    harness.render()
    expect(harness.tooltip.hasAttribute('hidden')).toBe(false)

    harness.grid.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))
    harness.render()
    expect(harness.tooltip.hasAttribute('hidden')).toBe(true)
    // 锚点留着，Tab 回来还落在原处
    expect(apiOf(harness.service).anchorDate).toBe('2024-01-03')
  })

  it('escape 收起详情，焦点不动；再走一格详情重新打开', () => {
    const harness = mountMonth(RANGE_TIP)
    harness.cell('2024-01-02').focus()
    harness.render()
    expect(harness.tooltip.hasAttribute('hidden')).toBe(false)

    press(harness as unknown as Harness, 'Escape')
    harness.render()
    expect(harness.tooltip.hasAttribute('hidden')).toBe(true)
    expect(document.activeElement).toBe(harness.cell('2024-01-02'))

    press(harness as unknown as Harness, 'ArrowRight')
    harness.render()
    expect(harness.tooltip.hasAttribute('hidden')).toBe(false)
  })

  it('详情落点与摆放方向都写在条上：位置是量出来的，方向按行序算', () => {
    const harness = mountMatrix({ rows: MATRIX_ROWS, columns: MATRIX_COLUMNS, value: MATRIX_VALUE })
    point(harness.cell('周一/上午'), 'pointerenter')
    harness.render()
    // 第 0 行落在上半，条摆下边
    expect(harness.tooltip.getAttribute('data-placement')).toBe('block-end')
    expect(harness.tooltip.style.getPropertyValue('--xh-_heatmap-tip-x')).toBe('0px')

    point(harness.cell('周三/夜里'), 'pointerenter')
    harness.render()
    expect(harness.tooltip.getAttribute('data-placement')).toBe('block-start')
  })

  it('详情换了一格才通知一次，同一格上反复进出不重复派', () => {
    const harness = mountMatrix({ rows: MATRIX_ROWS, columns: MATRIX_COLUMNS, value: MATRIX_VALUE })
    point(harness.cell('周一/上午'), 'pointerenter')
    point(harness.cell('周一/上午'), 'pointerenter')
    harness.render()
    expect(harness.actives).toHaveLength(1)
    expect(harness.actives[0]).toMatchObject({ row: '周一', column: '上午', count: 5 })

    point(harness.cell('周一/上午'), 'pointerleave')
    harness.render()
    expect(harness.actives).toHaveLength(2)
    expect(harness.actives[1]).toBeNull()
  })

  it('指针停着不动同时用键盘走格：条上的数与条的位置说的是同一格', () => {
    const harness = mountMonth(RANGE_TIP)
    stubRect(harness.cell('2024-01-01'), 40)
    stubRect(harness.cell('2024-01-02'), 90)

    point(harness.cell('2024-01-01'), 'pointerenter')
    harness.render()
    expect(apiOf(harness.service).activeCell).toMatchObject({ date: '2024-01-01' })
    expect(harness.tooltip.style.getPropertyValue('--xh-_heatmap-tip-y')).toBe('40px')

    // 指针没动，键盘另聚焦一格：详情仍归指针那一路，落点不能跟着焦点跑
    harness.cell('2024-01-02').focus()
    harness.render()
    expect(apiOf(harness.service).activeCell).toMatchObject({ date: '2024-01-01' })
    expect(harness.tooltip.style.getPropertyValue('--xh-_heatmap-tip-y')).toBe('40px')

    // 指针离开后详情退回聚焦那一格，落点也一并退回去
    point(harness.cell('2024-01-01'), 'pointerleave')
    harness.render()
    expect(apiOf(harness.service).activeCell).toMatchObject({ date: '2024-01-02' })
    expect(harness.tooltip.style.getPropertyValue('--xh-_heatmap-tip-y')).toBe('90px')
  })

  it('活跃格没换而数据换了：详情照样重派一次，条上不会留着旧数字', () => {
    const harness = mountMonth(RANGE_TIP)
    point(harness.cell('2024-01-02'), 'pointerenter')
    harness.render()
    expect(harness.actives.at(-1)).toMatchObject({ date: '2024-01-02', count: 10 })

    harness.setProps({ value: [{ date: '2024-01-02', count: 3 }] })
    expect(harness.actives.at(-1)).toMatchObject({ date: '2024-01-02', count: 3 })
    expect(apiOf(harness.service).activeCell).toMatchObject({ date: '2024-01-02', count: 3 })
  })

  it('详情条不进读屏：同一份信息已经写在每格的可及名字里', () => {
    const api = apiOf(mountMonth(RANGE_TIP).service)
    expect((api.getTooltipProps() as Record<string, unknown>)['aria-hidden']).toBe('true')
    // 没量过就不给 style 这个键，免得把作者写在条上的内联样式整条删掉
    expect('style' in (api.getTooltipProps() as Record<string, unknown>)).toBe(false)
  })
})

describe('色阶对照条的文案', () => {
  it('两端各给一个字，缺省是「少」「多」，对照条自己带名字', () => {
    const api = apiOf(mount(RANGE).service)
    expect(api.legendText).toEqual({ low: '少', high: '多' })
    const legend = api.getLegendProps() as Record<string, unknown>
    expect(legend.role).toBe('group')
    expect(legend['aria-label']).toBe('Activity level')
  })

  it('两端那两个字不藏起来：色阶朝哪个方向深要说得出口', () => {
    const api = apiOf(mount(RANGE).service)
    const low = api.getLegendLabelProps({ bound: 'low' }) as Record<string, unknown>
    const high = api.getLegendLabelProps({ bound: 'high' }) as Record<string, unknown>
    expect(low['data-bound']).toBe('low')
    expect(high['data-bound']).toBe('high')
    expect('aria-hidden' in low).toBe(false)
    // 色块本身仍然是藏的：每格自己念得出计数，档位念一遍没有信息量
    expect((api.getLegendItemProps({ level: 1 }) as Record<string, unknown>)['aria-hidden']).toBe('true')
  })

  it('三条文案整条可换', () => {
    const api = apiOf(mount({
      ...RANGE,
      translations: { legendLabel: '活跃度色阶', legendLow: 'Less', legendHigh: 'More' },
    }).service)
    expect(api.legendText).toEqual({ low: 'Less', high: 'More' })
    expect((api.getLegendProps() as Record<string, unknown>)['aria-label']).toBe('活跃度色阶')
  })
})

describe('星期名隔行画之后每一行自己报星期几', () => {
  it('日历形态的数据行带这一行星期几的全称，月份行不带', () => {
    const api = apiOf(mount({ ...RANGE, locale: 'zh-CN' }).service)
    const first = api.getRowProps({ weekDay: 0 }) as Record<string, unknown>
    const last = api.getRowProps({ weekDay: 6 }) as Record<string, unknown>
    const months = api.getRowProps({}) as Record<string, unknown>
    expect(first['aria-label']).toBe('星期一')
    expect(last['aria-label']).toBe('星期日')
    expect(months['aria-label']).toBeUndefined()
  })

  it('行的名字跟着 locale 与周首日走，与那个字画不画出来无关', () => {
    const api = apiOf(mount({ ...RANGE, locale: 'en-US', firstDayOfWeek: 0 }).service)
    expect((api.getRowProps({ weekDay: 0 }) as Record<string, unknown>)['aria-label']).toBe('Sunday')
  })

  it('行的名字不进 translations：它念的就是坐标轴上那个词，只由 locale 定', () => {
    const api = apiOf(mount({
      ...RANGE,
      translations: { gridLabel: 'Grid', cellLabel: () => 'Cell', legendLabel: 'Legend' },
    }).service)
    expect((api.getRowProps({ weekDay: 0 }) as Record<string, unknown>)['aria-label']).toBe('星期一')
  })
})

describe('网格自带的空白格计数', () => {
  it('日历形态：没有数据的日子与写了 0 的日子都算空白', () => {
    const grid = buildHeatmapGrid({
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      value: [{ date: '2024-01-01', count: 3 }, { date: '2024-01-02', count: 0 }],
    })
    expect(grid.cells.size).toBe(7)
    expect(grid.emptyCount).toBe(6)
    expect(grid.total).toBe(3)
    expect(grid.max).toBe(3)
  })

  it('区间不合法时是一张空网格，空白格也是 0 不是负数', () => {
    expect(buildHeatmapGrid({ startDate: '2024-01-08', endDate: '2024-01-01' }).emptyCount).toBe(0)
  })

  it('月历形态与日历形态同一口径', () => {
    const grid = buildHeatmapMonthGrid({
      startDate: '2024-01-29',
      endDate: '2024-02-04',
      value: [{ date: '2024-01-29', count: 2 }],
    })
    expect(grid.cells.size).toBe(7)
    expect(grid.emptyCount).toBe(6)
  })

  it('数的只是 0：给了 thresholds 之后色阶第 0 档还多收几格', () => {
    const grid = buildHeatmapGrid({
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      thresholds: [5, 10, 20],
      value: [
        { date: '2024-01-02', count: 2 },
        { date: '2024-01-03', count: 3 },
        { date: '2024-01-04', count: 7 },
        { date: '2024-01-05', count: 12 },
      ],
    })
    // 三格是真的 0；第 0 档还收进 2 与 3 这两个够不到首个下界的非零值，两个数因此不相等
    expect(grid.emptyCount).toBe(3)
    expect([...grid.cells.values()].filter(cell => cell.level === 0)).toHaveLength(5)
  })

  it('不给 thresholds 时首个下界恒为 1，两个数才恰好相等', () => {
    const grid = buildHeatmapGrid({
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      value: [
        { date: '2024-01-02', count: 2 },
        { date: '2024-01-03', count: 3 },
        { date: '2024-01-04', count: 7 },
        { date: '2024-01-05', count: 12 },
      ],
    })
    expect(grid.thresholds[0]).toBe(1)
    expect(grid.emptyCount).toBe(3)
    expect([...grid.cells.values()].filter(cell => cell.level === 0)).toHaveLength(3)
  })

  it('矩阵形态：轴上有而数据里没有的格子都算空白', () => {
    const grid = buildHeatmapMatrixGrid({
      rows: ['甲', '乙'],
      columns: ['上午', '下午', '夜里'],
      value: [{ row: '甲', column: '上午', value: 2 }],
    })
    expect(grid.cells.size).toBe(6)
    expect(grid.emptyCount).toBe(5)
  })
})
