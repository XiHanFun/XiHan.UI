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
  buildHeatmapThresholds,
  connectHeatmap,
  heatmapLevelOf,
  heatmapLevelPercent,
  heatmapMachine,
  heatmapNavIntentFromKey,
  heatmapNavTarget,
  heatmapStatsOf,
  parseHeatmapDate,
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
    expect(heatmapStatsOf(options, '2024-01-02')).toEqual({ count: 10, level: 4 })
    expect(heatmapStatsOf(options, '2024-06-01')).toEqual({ count: 0, level: 0 })
    expect(heatmapStatsOf(options, '不是日期')).toEqual({ count: 0, level: 0 })
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
})

describe('heatmap 方向键落点', () => {
  it('列是周、行是天：左右键走相邻的周，上下键走相邻的一天', () => {
    expect(heatmapNavIntentFromKey({ key: 'ArrowRight' })).toBe('week.next')
    expect(heatmapNavIntentFromKey({ key: 'ArrowLeft' })).toBe('week.prev')
    expect(heatmapNavIntentFromKey({ key: 'ArrowDown' })).toBe('day.next')
    expect(heatmapNavIntentFromKey({ key: 'ArrowUp' })).toBe('day.prev')
  })

  it('rtl 下左右键语义对调，上下键不受影响', () => {
    expect(heatmapNavIntentFromKey({ key: 'ArrowRight' }, 'rtl')).toBe('week.prev')
    expect(heatmapNavIntentFromKey({ key: 'ArrowLeft' }, 'rtl')).toBe('week.next')
    expect(heatmapNavIntentFromKey({ key: 'ArrowDown' }, 'rtl')).toBe('day.next')
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
    expect(heatmapNavTarget(grid, '2024-01-01', 'week.next')).toBe('2024-01-08')
    expect(heatmapNavTarget(grid, '2024-01-01', 'day.next')).toBe('2024-01-02')
    expect(heatmapNavTarget(grid, '2024-01-01', 'day.prev')).toBeNull()
    expect(heatmapNavTarget(grid, '2024-01-29', 'week.next')).toBeNull()
    // 行首行尾按本行实际有的格子取，不按日历上的周界取
    expect(heatmapNavTarget(grid, '2024-01-17', 'row.start')).toBe('2024-01-03')
    expect(heatmapNavTarget(grid, '2024-01-17', 'row.end')).toBe('2024-01-31')
    expect(heatmapNavTarget(grid, '2024-01-17', 'grid.start')).toBe('2024-01-01')
    expect(heatmapNavTarget(grid, '2024-01-17', 'grid.end')).toBe('2024-01-28')
    // 起点不在网格里时无从起步
    expect(heatmapNavTarget(grid, '2023-12-31', 'day.next')).toBeNull()
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
    expect((label.style as Record<string, string>)['--xh-_heatmap-month-weeks']).toBe('5')
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
    expect(harness.focuses).toEqual([{ date: '2024-01-02', count: 10, level: 4 }])

    harness.cell('2024-01-02').focus()
    harness.render()
    expect(harness.focuses).toHaveLength(1)

    press(harness, 'ArrowDown')
    expect(harness.focuses).toHaveLength(2)
    expect(harness.focuses[1]).toEqual({ date: '2024-01-03', count: 0, level: 0 })
  })

  it('程序化挪锚点只改锚点，不报「焦点落到了这一天」：DOM 焦点根本没动', () => {
    const harness = mount({ ...RANGE, value: VALUE })
    harness.service.send({ type: 'FOCUS.SET', date: '2024-01-02' })
    harness.render()
    expect(apiOf(harness.service).focusedDate).toBe('2024-01-02')
    expect(harness.focuses).toEqual([])

    // 焦点真的落上去才通知
    harness.cell('2024-01-01').focus()
    harness.render()
    expect(harness.focuses).toEqual([{ date: '2024-01-01', count: 1, level: 1 }])
  })

  it('区间换掉后锚点悬空，Tab 位退回文档序头一格：不然一个停靠点都没有，键盘再也进不来', () => {
    const harness = mount(RANGE)
    harness.cell('2024-01-31').focus()
    harness.render()
    expect(apiOf(harness.service).anchorDate).toBe('2024-01-31')

    // 焦点那天已不在新区间里
    const later = mount({ startDate: '2024-03-01', endDate: '2024-03-31' })
    later.service.send({ type: 'FOCUS.SET', date: '2024-01-31' })
    later.render()
    const api = apiOf(later.service)
    expect(api.focusedDate).toBe('2024-01-31')
    expect(api.anchorDate).toBe(later.cell('2024-03-04').getAttribute('data-value'))
    expect(later.cell('2024-03-04').getAttribute('tabindex')).toBe('0')
  })
})
