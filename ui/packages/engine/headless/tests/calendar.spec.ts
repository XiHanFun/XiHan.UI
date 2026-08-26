// @vitest-environment jsdom
import type { CalendarApi, CalendarSchema } from '../src/calendar'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildMonthGrid,
  buildPeriodGrid,
  buildWeekDays,
  CALENDAR_PERIOD_COLUMNS,
  calendarDrillAnchor,
  calendarHeadingPieces,
  calendarMachine,
  calendarNavFromKey,
  calendarNavTarget,
  calendarPageMonths,
  calendarPeriodIndex,
  calendarPeriodMonths,
  calendarPeriodOf,
  calendarPeriodStart,
  calendarWeekRange,
  calendarZoomIn,
  connectCalendar,
  isoWeekNumber,
  parseCalendarDate,
} from '../src/calendar'

type Props = CalendarSchema['props']

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * "翻月之后焦点落在哪一格"这类事实必须有活 DOM 才立得住。
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
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface Harness {
  api: () => CalendarApi
  root: HTMLElement
  grid: HTMLElement
  heading: HTMLElement
  prev: HTMLElement
  next: HTMLElement
  /** 当前渲染出来的某一天的 cell-trigger；不在这个月的网格里就抛。 */
  cell: (value: string) => HTMLElement
  /** 同一天的 cell（外层 gridcell）。 */
  gridcell: (value: string) => HTMLElement
  weekDayEls: () => HTMLElement[]
  /** 网格里全部日期的 ISO 串，文档序。 */
  rendered: () => string[]
  setProps: (next: Partial<Props>) => void
  value: () => string[]
  focusedValue: () => string
}

/**
 * 挂载一个会跟着聚焦日重画网格的日历——这正是作者该做的事（连接层只给数据，不生成节点）。
 * 重画只在"这个月的日期集合真的换了"时发生，与 Vue 的 keyed diff 同语义：
 * 同月内挪焦点不会把承载焦点的节点连根拔掉。
 */
function mount(initial: Partial<Props> = {}): Harness {
  const props: Partial<Props> = { ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(calendarMachine, { props: () => props, runtime })

  const doc = document
  const root = doc.createElement('div')
  const header = doc.createElement('div')
  const prev = doc.createElement('button')
  const heading = doc.createElement('div')
  const next = doc.createElement('button')
  header.append(prev, heading, next)
  const grid = doc.createElement('div')
  const gridHead = doc.createElement('div')
  const headRow = doc.createElement('div')
  const weekDayEls = Array.from({ length: 7 }, () => doc.createElement('span'))
  headRow.append(...weekDayEls)
  gridHead.appendChild(headRow)
  const gridBody = doc.createElement('div')
  grid.append(gridHead, gridBody)
  root.append(header, grid)
  doc.body.appendChild(root)

  service.refs.set('getGridEl', () => grid)
  runtime.start()

  const triggers = new Map<string, HTMLElement>()
  const cells = new Map<string, HTMLElement>()
  let painted = ''

  const rebuild = (weeks: readonly (readonly { value: string }[])[]): void => {
    gridBody.textContent = ''
    triggers.clear()
    cells.clear()
    for (const week of weeks) {
      const row = doc.createElement('div')
      for (const day of week) {
        const cell = doc.createElement('div')
        const trigger = doc.createElement('div')
        trigger.textContent = day.value.slice(-2)
        cell.appendChild(trigger)
        row.appendChild(cell)
        cells.set(day.value, cell)
        triggers.set(day.value, trigger)
      }
      gridBody.appendChild(row)
    }
  }

  const render = (): void => {
    const api = connectCalendar(service, normalizeProps)
    const key = api.weeks.map(w => w.map(d => d.value).join()).join('|')
    if (key !== painted) {
      painted = key
      rebuild(api.weeks)
    }
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(header, api.getHeaderProps() as Record<string, unknown>)
    spread(prev, api.getPrevTriggerProps() as Record<string, unknown>)
    spread(next, api.getNextTriggerProps() as Record<string, unknown>)
    spread(heading, api.getHeadingProps() as Record<string, unknown>)
    heading.textContent = api.headingLabel
    spread(grid, api.getGridProps() as Record<string, unknown>)
    spread(gridHead, api.getGridHeadProps() as Record<string, unknown>)
    spread(headRow, api.getWeekRowProps() as Record<string, unknown>)
    weekDayEls.forEach((el, i) => {
      spread(el, api.getWeekDayProps({ value: i }) as Record<string, unknown>)
      el.textContent = api.weekDays[i]!.label
    })
    spread(gridBody, api.getGridBodyProps() as Record<string, unknown>)
    for (const row of Array.from(gridBody.children))
      spread(row as HTMLElement, api.getWeekRowProps() as Record<string, unknown>)
    for (const [value, cell] of cells)
      spread(cell, api.getCellProps({ value }) as Record<string, unknown>)
    for (const [value, trigger] of triggers)
      spread(trigger, api.getCellTriggerProps({ value }) as Record<string, unknown>)
  }

  runtime.subscribe(render)
  render()

  const need = (map: Map<string, HTMLElement>, value: string): HTMLElement => {
    const el = map.get(value)
    if (!el)
      throw new Error(`网格里没有 ${value} 这一格（当前展示 ${connectCalendar(service, normalizeProps).headingLabel}）`)
    return el
  }

  return {
    api: () => connectCalendar(service, normalizeProps),
    root,
    grid,
    heading,
    prev,
    next,
    cell: v => need(triggers, v),
    gridcell: v => need(cells, v),
    weekDayEls: () => weekDayEls,
    rendered: () => [...triggers.keys()],
    setProps: (next2) => {
      Object.assign(props, next2)
      render()
    },
    value: () => service.context.get('value'),
    focusedValue: () => connectCalendar(service, normalizeProps).focusedValue,
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

function hover(el: HTMLElement): void {
  el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }))
}

function focused(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

function tabStops(): string[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="calendar"]')]
    .filter(el => el.getAttribute('tabindex') === '0')
    .map(el => el.getAttribute('data-value') ?? el.getAttribute('data-part')!)
}

/** 搬焦点推迟到宿主提交之后（vanilla 运行时用微任务），读焦点前得让那一拍先跑完。 */
async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('buildMonthGrid 月份矩阵', () => {
  it('每行恒七天，行首是 locale 的周首日', () => {
    const zh = buildMonthGrid('2024-02-15', { locale: 'zh-CN' })
    // zh-CN 周一起：2024-02-01 是周四，首行从 1 月 29 日（周一）开始
    expect(zh.weeks.every(w => w.length === 7)).toBe(true)
    expect(zh.weeks[0]![0]!.value).toBe('2024-01-29')

    const en = buildMonthGrid('2024-02-15', { locale: 'en-US' })
    // en-US 周日起：同一个月的首行提前一天，从 1 月 28 日（周日）开始
    expect(en.weeks[0]![0]!.value).toBe('2024-01-28')
  })

  it('闰年二月排满 29 天，非闰年只有 28 天', () => {
    const leap = buildMonthGrid('2024-02-10', { locale: 'zh-CN' })
    const days = leap.weeks.flat().filter(d => d.inMonth)
    expect(days).toHaveLength(29)
    expect(days.at(-1)!.value).toBe('2024-02-29')

    const common = buildMonthGrid('2023-02-10', { locale: 'zh-CN' })
    expect(common.weeks.flat().filter(d => d.inMonth)).toHaveLength(28)
    expect(common.weeks.flat().filter(d => d.inMonth).at(-1)!.value).toBe('2023-02-28')
  })

  it('跨年：十二月的网格尾部接上次年一月', () => {
    const g = buildMonthGrid('2026-12-01', { locale: 'zh-CN' })
    const flat = g.weeks.flat()
    expect(g.year).toBe(2026)
    expect(g.month).toBe(12)
    expect(flat.at(-1)!.value.startsWith('2027-01')).toBe(true)
    // 一月的日子不属于展示月
    expect(flat.filter(d => d.value.startsWith('2027')).every(d => !d.inMonth)).toBe(true)
    // 反向：一月的网格头部接上一年十二月
    const jan = buildMonthGrid('2027-01-05', { locale: 'zh-CN' })
    expect(jan.weeks[0]![0]!.value.startsWith('2026-12')).toBe(true)
  })

  it('fixedWeeks 恒补满六行；关掉时按当月实际周数（能少到四行）', () => {
    // 2015-02-01 是周日，en-US 下整月正好四行
    expect(buildMonthGrid('2015-02-10', { locale: 'en-US' }).weeks).toHaveLength(4)
    expect(buildMonthGrid('2015-02-10', { locale: 'en-US', fixedWeeks: true }).weeks).toHaveLength(6)
    // 补出来的行是真日子的延续，不是空格
    const fixed = buildMonthGrid('2015-02-10', { locale: 'en-US', fixedWeeks: true })
    expect(fixed.weeks.at(-1)!.at(-1)!.value).toBe('2015-03-14')
    // 五行月不受 fixedWeeks 影响的那一半：默认就是五行
    expect(buildMonthGrid('2024-02-10', { locale: 'zh-CN' }).weeks).toHaveLength(5)
  })

  it('矩阵是连续日期，中间不跳格', () => {
    const flat = buildMonthGrid('2024-02-10', { locale: 'zh-CN' }).weeks.flat()
    for (let i = 1; i < flat.length; i++) {
      const prev = parseCalendarDate(flat[i - 1]!.value)!
      expect(prev.add({ days: 1 }).toString()).toBe(flat[i]!.value)
    }
  })
})

describe('buildWeekDays 表头', () => {
  it('列序跟着 locale 的周首日走', () => {
    const zh = buildWeekDays({ reference: '2024-02-01', locale: 'zh-CN', timeZone: 'UTC' })
    const en = buildWeekDays({ reference: '2024-02-01', locale: 'en-US', timeZone: 'UTC' })
    expect(zh[0]!.long).toBe('星期一')
    expect(zh.at(-1)!.long).toBe('星期日')
    expect(en[0]!.long).toBe('Sunday')
    expect(en.at(-1)!.long).toBe('Saturday')
    expect(zh.map(d => d.value)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('weekdayFormat 只改可见缩写，全称照旧给读屏用', () => {
    const narrow = buildWeekDays({ reference: '2024-02-01', locale: 'en-US', weekdayFormat: 'narrow', timeZone: 'UTC' })
    const short = buildWeekDays({ reference: '2024-02-01', locale: 'en-US', weekdayFormat: 'short', timeZone: 'UTC' })
    expect(narrow[0]!.label).toBe('S')
    expect(short[0]!.label).toBe('Sun')
    expect(narrow[0]!.long).toBe(short[0]!.long)
  })
})

describe('calendarNavFromKey / calendarNavTarget 落点', () => {
  it('方向键走天与周，翻页键走月，加 Shift 走年', () => {
    expect(calendarNavFromKey({ key: 'ArrowLeft' })).toBe('day.prev')
    expect(calendarNavFromKey({ key: 'ArrowRight' })).toBe('day.next')
    expect(calendarNavFromKey({ key: 'ArrowUp' })).toBe('week.prev')
    expect(calendarNavFromKey({ key: 'ArrowDown' })).toBe('week.next')
    expect(calendarNavFromKey({ key: 'PageUp' })).toBe('month.prev')
    expect(calendarNavFromKey({ key: 'PageDown' })).toBe('month.next')
    expect(calendarNavFromKey({ key: 'PageUp', shiftKey: true })).toBe('year.prev')
    expect(calendarNavFromKey({ key: 'PageDown', shiftKey: true })).toBe('year.next')
    expect(calendarNavFromKey({ key: 'Home' })).toBe('week.start')
    expect(calendarNavFromKey({ key: 'End' })).toBe('week.end')
  })

  it('带 Ctrl/Meta/Alt 的一律不接（Ctrl+Home 之类归浏览器与读屏）', () => {
    expect(calendarNavFromKey({ key: 'Home', ctrlKey: true })).toBeNull()
    expect(calendarNavFromKey({ key: 'ArrowDown', metaKey: true })).toBeNull()
    expect(calendarNavFromKey({ key: 'PageUp', altKey: true })).toBeNull()
    expect(calendarNavFromKey({ key: 'a' })).toBeNull()
  })

  it('落点跨月跨年一路自然溢出，月末日由目标月夹住', () => {
    expect(calendarNavTarget('2024-02-01', 'day.prev')).toBe('2024-01-31')
    expect(calendarNavTarget('2024-02-29', 'day.next')).toBe('2024-03-01')
    expect(calendarNavTarget('2024-01-03', 'week.prev')).toBe('2023-12-27')
    expect(calendarNavTarget('2024-12-28', 'week.next')).toBe('2025-01-04')
    // 3 月 31 日退一个月：2 月没有 31 号，夹到 29 号而不是溢出成 3 月 2 日
    expect(calendarNavTarget('2024-03-31', 'month.prev')).toBe('2024-02-29')
    expect(calendarNavTarget('2024-02-29', 'year.next')).toBe('2025-02-28')
  })

  it('home/End 的周界随 locale 变', () => {
    // 2024-02-01 是周四；zh-CN 周一起，en-US 周日起
    expect(calendarNavTarget('2024-02-01', 'week.start', 'zh-CN')).toBe('2024-01-29')
    expect(calendarNavTarget('2024-02-01', 'week.end', 'zh-CN')).toBe('2024-02-04')
    expect(calendarNavTarget('2024-02-01', 'week.start', 'en-US')).toBe('2024-01-28')
    expect(calendarNavTarget('2024-02-01', 'week.end', 'en-US')).toBe('2024-02-03')
  })
})

describe('parseCalendarDate 脏值兜底', () => {
  it('解析不了一律给 null，不往外抛', () => {
    expect(parseCalendarDate('2024-02-29')!.toString()).toBe('2024-02-29')
    expect(parseCalendarDate('2024-2-9')).toBeNull()
    expect(parseCalendarDate('昨天')).toBeNull()
    expect(parseCalendarDate('')).toBeNull()
    expect(parseCalendarDate(null)).toBeNull()
  })
})

describe('大步翻与周选预览', () => {
  it('« / » 的步长跟着视图走：日一年、月与季度十年、年一百年', () => {
    const day = mount({ defaultFocusedValue: '2026-08-17' })
    day.api().goToNextYear()
    expect(day.api().visibleMonth).toMatchObject({ year: 2027, month: 8 })
    day.api().goToPrevYear()
    day.api().goToPrevYear()
    expect(day.api().visibleMonth).toMatchObject({ year: 2025, month: 8 })

    const month = mount({ defaultFocusedValue: '2026-08-17', view: 'month' })
    month.api().goToNextYear()
    expect(month.api().panels[0]!.year).toBe(2036)

    const year = mount({ defaultFocusedValue: '2026-08-17', view: 'year' })
    year.api().goToNextYear()
    expect(year.api().panels[0]!.headingLabel).toBe('2120-2129')
  })

  it('大步翻的边界按大步算，与上下一页各判各的', () => {
    // 上界卡在明年之内：整年跳出去就没得看了，但下一页还翻得动
    const h = mount({ defaultFocusedValue: '2026-08-17', max: '2026-12-31' })
    expect(h.api().canGoNext).toBe(true)
    expect(h.api().canGoNextYear).toBe(false)
    expect(h.api().canGoPrevYear).toBe(true)
  })

  it('整张禁用时两个大步钮都按不动', () => {
    const h = mount({ defaultFocusedValue: '2026-08-17', disabled: true })
    expect(h.api().canGoPrevYear).toBe(false)
    expect(h.api().canGoNextYear).toBe(false)
  })

  it('周选悬停：预览的是整整一周，不是从起点拉到悬停点', () => {
    const h = mount({ defaultFocusedValue: '2026-08-17', selectionMode: 'range', weekSelection: true, locale: 'zh-CN' })
    hover(h.cell('2026-08-13'))
    const lit = h.rendered().filter(v => h.gridcell(v).hasAttribute('data-in-range'))
    expect(lit).toEqual(['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16'])
  })

  it('不开周选时，悬停照旧是「起点 → 悬停点」那一段', () => {
    const h = mount({ defaultFocusedValue: '2026-08-17', selectionMode: 'range' })
    h.api().select('2026-08-11')
    hover(h.cell('2026-08-13'))
    const lit = h.rendered().filter(v => h.gridcell(v).hasAttribute('data-in-range'))
    expect(lit).toEqual(['2026-08-11', '2026-08-12', '2026-08-13'])
  })
})

describe('面板粒度：月 / 季度 / 年 / 周', () => {
  it('月面板一年 12 格，值是每个月的头一天', () => {
    const g = buildPeriodGrid('2026-08-17', 'month', { locale: 'zh-CN' })
    expect(g.cells).toHaveLength(12)
    expect(g.cells[0]!.value).toBe('2026-01-01')
    expect(g.cells[7]!.value).toBe('2026-08-01')
    expect(g.startValue).toBe('2026-01-01')
    expect(g.headingLabel).toContain('2026')
  })

  it('季度面板 4 格，值是每季的头一天', () => {
    const g = buildPeriodGrid('2026-08-17', 'quarter', { locale: 'zh-CN' })
    expect(g.cells.map(c => [c.label, c.value])).toEqual([
      ['Q1', '2026-01-01'],
      ['Q2', '2026-04-01'],
      ['Q3', '2026-07-01'],
      ['Q4', '2026-10-01'],
    ])
  })

  it('年面板一页十年，两端各带一格邻十年（与日视图带邻月同一套做法）', () => {
    const g = buildPeriodGrid('2026-08-17', 'year', { locale: 'zh-CN' })
    expect(g.cells).toHaveLength(12)
    expect(g.cells[0]!.label).toBe('2019')
    expect(g.cells[0]!.inView).toBe(false)
    expect(g.cells[1]!.label).toBe('2020')
    expect(g.cells[1]!.inView).toBe(true)
    expect(g.cells[10]!.label).toBe('2029')
    expect(g.cells[11]!.inView).toBe(false)
    // zh-CN 的年份带「年」字，标题因此是 2020年-2029年
    expect(g.headingLabel).toBe('2020年-2029年')
  })

  it('一页走多少个月：日 1、月与季度 12、年 120', () => {
    expect(calendarPageMonths('day')).toBe(1)
    expect(calendarPageMonths('month')).toBe(12)
    expect(calendarPageMonths('quarter')).toBe(12)
    expect(calendarPageMonths('year')).toBe(120)
  })

  it('跨度起点：月/季度归到当年 1 月，年归到当个十年的头一年', () => {
    expect(calendarPeriodStart(parseCalendarDate('2026-08-17')!, 'month').toString()).toBe('2026-01-01')
    expect(calendarPeriodStart(parseCalendarDate('2026-08-17')!, 'year').toString()).toBe('2020-01-01')
    expect(calendarPeriodStart(parseCalendarDate('2019-05-02')!, 'year').toString()).toBe('2010-01-01')
  })

  it('周的起止按 locale 的周首日切', () => {
    // zh-CN 周一起
    expect(calendarWeekRange('2026-08-13', 'zh-CN')).toEqual(['2026-08-10', '2026-08-16'])
    // en-US 周日起
    expect(calendarWeekRange('2026-08-13', 'en-US')).toEqual(['2026-08-09', '2026-08-15'])
  })

  it('连接层按 view 铺面板：月视图给 cells 不给 weeks，翻页整年走', () => {
    const h = mount({ defaultFocusedValue: '2026-08-17', view: 'month', visibleCount: 2 })
    const api = h.api()
    expect(api.panels).toHaveLength(2)
    expect(api.panels[0]!.weeks).toEqual([])
    expect(api.panels[0]!.cells).toHaveLength(12)
    expect(api.panels.map(p => p.year)).toEqual([2026, 2027])
    h.api().goToNextMonth()
    expect(h.api().panels.map(p => p.year)).toEqual([2027, 2028])
  })

  it('年视图翻一页走十年', () => {
    const h = mount({ defaultFocusedValue: '2026-08-17', view: 'year' })
    expect(h.api().panels[0]!.headingLabel).toBe('2020-2029')
    h.api().goToNextMonth()
    expect(h.api().panels[0]!.headingLabel).toBe('2030-2039')
  })

  it('周选：一次点落起点周，两次点落「起点周 → 终点周」的外缘', () => {
    const h = mount({ defaultFocusedValue: '2026-08-13', selectionMode: 'range', weekSelection: true, locale: 'zh-CN' })
    // 第一下只落起点：这一周的首日
    h.api().select('2026-08-13')
    expect(h.value()).toEqual(['2026-08-10'])
    // 第二下落到另一周，两端取各自朝外那一头——第 33 周到第 37 周
    h.api().select('2026-09-09')
    expect(h.value()).toEqual(['2026-08-10', '2026-09-13'])
    expect(isoWeekNumber('2026-08-10')).toBe(33)
    expect(isoWeekNumber('2026-09-13')).toBe(37)
  })

  it('周选反着挑也对：先点靠后那周，再点靠前的', () => {
    const h = mount({ defaultFocusedValue: '2026-09-09', selectionMode: 'range', weekSelection: true, locale: 'zh-CN' })
    h.api().select('2026-09-09')
    h.api().select('2026-08-13')
    expect(h.value()).toEqual(['2026-08-10', '2026-09-13'])
  })

  it('周序号格是这一行的表头，文字由连接层给；不带值时给空串占住列宽', () => {
    const h = mount({ defaultFocusedValue: '2026-08-13', locale: 'zh-CN' })
    const props = h.api().getWeekNumberProps({ value: '2026-08-10' }) as Record<string, unknown>
    expect(props.role).toBe('rowheader')
    expect(props['data-value']).toBe('2026-08-10')
    expect(h.api().getWeekNumberText({ value: '2026-08-10' })).toBe('33')
    // 表头那一格是占位，解析不了不抛、给空串
    expect(h.api().getWeekNumberText({ value: '' })).toBe('')
  })

  it('iSO 周序号：周一起算，含当年第一个周四那周是第 1 周', () => {
    expect(isoWeekNumber('2026-01-01')).toBe(1)
    expect(isoWeekNumber('2026-08-10')).toBe(33)
    expect(isoWeekNumber('2026-12-31')).toBe(53)
    // 跨年那几天归上一年的末周：2027-01-01 是周五，仍属 2026 的第 53 周
    expect(isoWeekNumber('2027-01-01')).toBe(53)
  })

  it('周选只在日视图 + 区间下生效，其余照旧只落这一天', () => {
    const single = mount({ defaultFocusedValue: '2026-08-13', weekSelection: true })
    single.api().select('2026-08-13')
    expect(single.value()).toEqual(['2026-08-13'])
  })
})

describe('多面板', () => {
  it('缺省一个面板，panels[0] 与旧的 weeks / visibleMonth / headingLabel 同源', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    const api = h.api()
    expect(api.panels).toHaveLength(1)
    expect(api.panels[0]!.index).toBe(0)
    expect(api.panels[0]!.year).toBe(2024)
    expect(api.panels[0]!.month).toBe(2)
    expect(api.panels[0]!.weeks).toEqual(api.weeks)
    expect(api.panels[0]!.headingLabel).toBe(api.headingLabel)
    expect(api.visibleMonth).toEqual({ year: 2024, month: 2, startValue: '2024-02-01' })
  })

  it('visibleCount=2 铺出两个连续月，标题各是各的', () => {
    const api = mount({ defaultFocusedValue: '2024-02-15', visibleCount: 2 }).api()
    expect(api.panels.map(p => [p.year, p.month])).toEqual([[2024, 2], [2024, 3]])
    expect(api.panels[0]!.headingLabel).not.toBe(api.panels[1]!.headingLabel)
    // 旧字段仍指首个面板，老标记不受影响
    expect(api.weeks).toEqual(api.panels[0]!.weeks)
  })

  it('跨年也连着排：12 月的下一个面板是次年 1 月', () => {
    const api = mount({ defaultFocusedValue: '2024-12-10', visibleCount: 2 }).api()
    expect(api.panels.map(p => [p.year, p.month])).toEqual([[2024, 12], [2025, 1]])
  })

  it('翻页整窗一起走一个月，不是各翻各的', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', visibleCount: 2 })
    h.api().goToNextMonth()
    expect(h.api().panels.map(p => [p.year, p.month])).toEqual([[2024, 3], [2024, 4]])
    h.api().goToPrevMonth()
    h.api().goToPrevMonth()
    expect(h.api().panels.map(p => [p.year, p.month])).toEqual([[2024, 1], [2024, 2]])
  })

  it('点第二个面板里的日子不挪视窗——挪了就成了「点一下翻一页、选不中」', () => {
    const h = mount({ defaultFocusedValue: '2026-10-08', visibleCount: 2 })
    expect(h.api().panels.map(p => [p.year, p.month])).toEqual([[2026, 10], [2026, 11]])
    // 落在第二个面板（11 月）里的一天
    h.api().focus('2026-11-20')
    expect(h.api().focusedValue).toBe('2026-11-20')
    // 视窗一动不动
    expect(h.api().panels.map(p => [p.year, p.month])).toEqual([[2026, 10], [2026, 11]])
  })

  it('聚焦日走出视窗才重新对齐，且只挪到刚好露出它的那一端', () => {
    const h = mount({ defaultFocusedValue: '2026-10-08', visibleCount: 2 })
    // 往后越界：末面板贴住它
    h.api().focus('2026-12-03')
    expect(h.api().panels.map(p => [p.year, p.month])).toEqual([[2026, 11], [2026, 12]])
    // 往前越界：首面板贴住它
    h.api().focus('2026-09-03')
    expect(h.api().panels.map(p => [p.year, p.month])).toEqual([[2026, 9], [2026, 10]])
  })

  it('面板数写坏了回落到 1', () => {
    for (const bad of [0, -3, Number.NaN]) {
      const api = mount({ defaultFocusedValue: '2024-02-15', visibleCount: bad }).api()
      expect(api.panels).toHaveLength(1)
    }
  })

  it('同一天出现在两个面板里时，是不是本月按各自的面板判', () => {
    // 2024-03-01 既在 2 月网格的末行，也在 3 月网格里
    const api = mount({ defaultFocusedValue: '2024-02-15', visibleCount: 2 }).api()
    const inFeb = api.getCellProps({ value: '2024-03-01', index: 0 }) as Record<string, unknown>
    const inMar = api.getCellProps({ value: '2024-03-01', index: 1 }) as Record<string, unknown>
    expect(inFeb['data-outside-month']).toBe('')
    expect(inMar['data-outside-month']).toBeUndefined()
  })

  it('同一天在两个面板里只画一次：区间与选中都归认领它的那张面板', () => {
    // 2024-03-01 既在 2 月网格的末行，也在 3 月网格里；区间 2/20 → 3/05 覆盖它
    const api = mount({
      defaultFocusedValue: '2024-02-15',
      visibleCount: 2,
      selectionMode: 'range',
      defaultValue: ['2024-02-20', '2024-03-05'],
    }).api()
    const inFeb = api.getCellProps({ value: '2024-03-01', index: 0 }) as Record<string, unknown>
    const inMar = api.getCellProps({ value: '2024-03-01', index: 1 }) as Record<string, unknown>
    expect(inFeb['data-in-range']).toBeUndefined()
    expect(inMar['data-in-range']).toBe('')

    // 区间终点 3/05 只在三月那张面板上是端点
    const endInFeb = api.getCellProps({ value: '2024-03-05', index: 0 }) as Record<string, unknown>
    const endInMar = api.getCellProps({ value: '2024-03-05', index: 1 }) as Record<string, unknown>
    expect(endInFeb['data-range-end']).toBeUndefined()
    expect(endInFeb['data-selected']).toBeUndefined()
    expect(endInFeb['aria-selected']).toBe('false')
    expect(endInMar['data-range-end']).toBe('')
    expect(endInMar['data-selected']).toBe('')
    expect(endInMar['aria-selected']).toBe('true')
  })

  it('单面板下没有另一张面板认领，落在邻月格的选中日照画', () => {
    const api = mount({ defaultFocusedValue: '2024-02-15', defaultValue: '2024-03-01' }).api()
    const cell = api.getCellProps({ value: '2024-03-01' }) as Record<string, unknown>
    expect(cell['data-outside-month']).toBe('')
    expect(cell['data-selected']).toBe('')
  })

  it('每个面板的网格各由自己那行标题命名', () => {
    const api = mount({ defaultFocusedValue: '2024-02-15', visibleCount: 2 }).api()
    const g0 = api.getGridProps({ index: 0 }) as Record<string, unknown>
    const g1 = api.getGridProps({ index: 1 }) as Record<string, unknown>
    const h0 = api.getHeadingProps({ index: 0 }) as Record<string, unknown>
    const h1 = api.getHeadingProps({ index: 1 }) as Record<string, unknown>
    expect(g0['aria-labelledby']).toBe(h0.id)
    expect(g1['aria-labelledby']).toBe(h1.id)
    expect(h0.id).not.toBe(h1.id)
    // 不给下标即首个面板，旧调用一字不改
    expect((api.getGridProps() as Record<string, unknown>)['aria-labelledby']).toBe(h0.id)
  })

  it('往后翻的边界按整窗算：窗口末尾之后没有可看的月份就按不动', () => {
    // 两个面板显示 2 月与 3 月，上界卡在 3 月底：再往后新露出的是 4 月，已出界
    const api = mount({ defaultFocusedValue: '2024-02-15', visibleCount: 2, max: '2024-03-31' }).api()
    expect(api.canGoNext).toBe(false)
    // 单面板同样的界还翻得动（3 月本身还没显出来）
    expect(mount({ defaultFocusedValue: '2024-02-15', max: '2024-03-31' }).api().canGoNext).toBe(true)
  })
})

describe('connectCalendar 属性输出', () => {
  it('grid 是 grid：多选/禁用/只读三态都显式给出，标题关联到 heading', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    expect(h.grid.getAttribute('role')).toBe('grid')
    // 省略与显式 false 不是一回事：前者是"没说"，后者是"明确说了不是"
    expect(h.grid.getAttribute('aria-multiselectable')).toBe('false')
    expect(h.grid.getAttribute('aria-disabled')).toBe('false')
    expect(h.grid.getAttribute('aria-readonly')).toBe('false')
    expect(h.grid.getAttribute('aria-labelledby')).toBe(h.heading.id)
    expect(h.heading.id).not.toBe('')
  })

  it('选中态报在 gridcell 上，禁用标在真正能聚焦的 cell-trigger 上', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', defaultValue: '2024-02-15' })
    expect(h.gridcell('2024-02-15').getAttribute('role')).toBe('gridcell')
    expect(h.gridcell('2024-02-15').getAttribute('aria-selected')).toBe('true')
    expect(h.gridcell('2024-02-16').getAttribute('aria-selected')).toBe('false')
    const trigger = h.cell('2024-02-15')
    expect(trigger.getAttribute('role')).toBe('button')
    // aria-selected 不许挂在 role=button 上
    expect(trigger.hasAttribute('aria-selected')).toBe(false)
    expect(trigger.getAttribute('data-selected')).toBe('')
    expect(trigger.getAttribute('aria-disabled')).toBe('false')
    // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
    expect(trigger.hasAttribute('disabled')).toBe(false)
  })

  it('邻月的日子照样是真格子，只是标出 data-outside-month', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    expect(h.cell('2024-01-28').getAttribute('data-outside-month')).toBe('')
    expect(h.cell('2024-02-01').hasAttribute('data-outside-month')).toBe(false)
    expect(h.cell('2024-03-02').getAttribute('data-outside-month')).toBe('')
  })

  it('格子的可及名字是完整日期，不是光秃秃一个数字', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', locale: 'en-US', timeZone: 'UTC' })
    expect(h.cell('2024-02-15').getAttribute('aria-label')).toBe('Thursday, February 15, 2024')
  })

  it('表头是列头，缩写可见、全称给读屏', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', locale: 'en-US', timeZone: 'UTC' })
    const [first] = h.weekDayEls()
    expect(first!.getAttribute('role')).toBe('columnheader')
    expect(first!.getAttribute('aria-label')).toBe('Sunday')
    expect(first!.getAttribute('data-value')).toBe('0')
    expect(first!.textContent).toBe('Sun')
  })

  it('标题跟着展示月走，翻月即改写', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', locale: 'en-US', timeZone: 'UTC' })
    expect(h.heading.textContent).toBe('February 2024')
    h.api().goToNextMonth()
    expect(h.heading.textContent).toBe('March 2024')
  })

  it('聚焦日三路收口：没给就退回首个选中值，再退回今天', () => {
    expect(mount({ defaultFocusedValue: '2024-02-15' }).focusedValue()).toBe('2024-02-15')
    expect(mount({ defaultValue: '2024-05-06' }).focusedValue()).toBe('2024-05-06')
    // 两个都没给：落在今天，展示月自然是本月
    const bare = mount()
    const now = new Date()
    expect(bare.api().visibleMonth.year).toBe(now.getFullYear())
    // 脏值不该把兜底链打断
    expect(mount({ defaultFocusedValue: '昨天', defaultValue: '2024-05-06' }).focusedValue()).toBe('2024-05-06')
  })
})

describe('roving tabindex', () => {
  it('整张网格只有聚焦日那一格留在 Tab 序列里', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    expect(h.cell('2024-02-15').getAttribute('tabindex')).toBe('0')
    expect(h.cell('2024-02-16').getAttribute('tabindex')).toBe('-1')
    expect(tabStops()).toEqual(['2024-02-15'])
  })

  it('聚焦日一变，Tab 位跟着搬，且始终只有一个', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.cell('2024-02-15').focus()
    press(h.cell('2024-02-15'), 'ArrowRight')
    await settle()
    expect(tabStops()).toEqual(['2024-02-16'])
  })

  it('不可用的日子照样认领 Tab 位：禁用不等于键盘够不着', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', min: '2024-02-20' })
    expect(h.cell('2024-02-15').getAttribute('aria-disabled')).toBe('true')
    expect(tabStops()).toEqual(['2024-02-15'])
  })

  it('翻月之后新月份里仍恰有一个 Tab 位', () => {
    const h = mount({ defaultFocusedValue: '2024-02-29' })
    click(h.next)
    // 2 月 29 日进一月被夹成 3 月 29 日
    expect(h.focusedValue()).toBe('2024-03-29')
    expect(tabStops()).toEqual(['2024-03-29'])
  })
})

describe('方向键导航', () => {
  it('左右走天、上下走周', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.cell('2024-02-15').focus()
    const event = press(h.cell('2024-02-15'), 'ArrowRight')
    expect(event.defaultPrevented).toBe(true)
    await settle()
    expect(focused()).toBe('2024-02-16')
    press(h.cell('2024-02-16'), 'ArrowDown')
    await settle()
    expect(focused()).toBe('2024-02-23')
    press(h.cell('2024-02-23'), 'ArrowUp')
    await settle()
    expect(focused()).toBe('2024-02-16')
    press(h.cell('2024-02-16'), 'ArrowLeft')
    await settle()
    expect(focused()).toBe('2024-02-15')
  })

  it('home/End 到本周首末，周界随 locale 变', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-01', locale: 'zh-CN' })
    h.cell('2024-02-01').focus()
    press(h.cell('2024-02-01'), 'Home')
    await settle()
    expect(focused()).toBe('2024-01-29')
    press(h.cell('2024-01-29'), 'End')
    await settle()
    expect(focused()).toBe('2024-02-04')
  })

  it('跨月自动翻页，焦点落进新月份的那一天', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-29' })
    h.cell('2024-02-29').focus()
    press(h.cell('2024-02-29'), 'ArrowRight')
    await settle()
    expect(h.api().visibleMonth.month).toBe(3)
    // 3 月 1 日在旧网格里本来也画得出（是二月网格的尾巴），但重画之后是一个全新的节点：
    // 不把焦点搬过去，用户按一下方向键焦点就掉回 body，再按一下什么都不会发生
    expect(focused()).toBe('2024-03-01')
    expect(document.activeElement).toBe(h.cell('2024-03-01'))
  })

  it('pageUp/PageDown 走月，Shift 版走年，焦点跟着落', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.cell('2024-02-15').focus()
    press(h.cell('2024-02-15'), 'PageDown')
    await settle()
    expect(h.focusedValue()).toBe('2024-03-15')
    expect(focused()).toBe('2024-03-15')
    press(h.cell('2024-03-15'), 'PageUp')
    await settle()
    expect(h.focusedValue()).toBe('2024-02-15')
    press(h.cell('2024-02-15'), 'PageUp', { shiftKey: true })
    await settle()
    expect(h.focusedValue()).toBe('2023-02-15')
    expect(focused()).toBe('2023-02-15')
    press(h.cell('2023-02-15'), 'PageDown', { shiftKey: true })
    await settle()
    expect(h.focusedValue()).toBe('2024-02-15')
  })

  it('不归日历管的键绝不吞掉（页面滚动与读屏要用）', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.cell('2024-02-15').focus()
    expect(press(h.cell('2024-02-15'), 'Home', { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(press(h.cell('2024-02-15'), 'a').defaultPrevented).toBe(false)
    expect(h.focusedValue()).toBe('2024-02-15')
  })

  it('不可用的日子仍是方向键起点，走得进也走得出', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', min: '2024-02-20' })
    h.cell('2024-02-15').focus()
    press(h.cell('2024-02-15'), 'ArrowRight')
    await settle()
    expect(focused()).toBe('2024-02-16')
    expect(h.cell('2024-02-16').getAttribute('aria-disabled')).toBe('true')
    press(h.cell('2024-02-16'), 'ArrowDown')
    await settle()
    expect(focused()).toBe('2024-02-23')
    expect(h.cell('2024-02-23').getAttribute('aria-disabled')).toBe('false')
  })

  it('整张禁用时键盘不改任何东西', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', disabled: true })
    h.cell('2024-02-15').focus()
    const event = press(h.cell('2024-02-15'), 'ArrowRight')
    expect(event.defaultPrevented).toBe(false)
    expect(h.focusedValue()).toBe('2024-02-15')
  })

  it('点邻月的日子：翻月重画之后焦点回到被点的那一天', async () => {
    // 真人点一下是两段：按下时落焦（这一下就把展示月翻到三月、网格随之重画，
    // 用户刚碰到的那个节点被换掉、焦点掉回 body），抬起时才派 click。
    // 点击这一路不补搬焦点的话，值选上了、键盘却从此接不上——按方向键什么都不会发生。
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.cell('2024-03-02').focus()
    await settle()
    expect(h.api().visibleMonth.month).toBe(3)
    const repainted = h.cell('2024-03-02')
    expect(document.activeElement).not.toBe(repainted)

    click(repainted)
    await settle()
    expect(h.value()).toEqual(['2024-03-02'])
    expect(document.activeElement).toBe(h.cell('2024-03-02'))
    // 焦点接得上：方向键从这一天继续走
    press(h.cell('2024-03-02'), 'ArrowRight')
    await settle()
    expect(focused()).toBe('2024-03-03')
  })

  it('同月内点击：焦点落在被点的那一格', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    click(h.cell('2024-02-20'))
    await settle()
    expect(document.activeElement).toBe(h.cell('2024-02-20'))
  })

  it('焦点不在网格里时不抢焦点：翻月按钮点一下，焦点仍留在按钮上', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.next.focus()
    click(h.next)
    expect(document.activeElement).toBe(h.next)
    expect(h.focusedValue()).toBe('2024-03-15')
  })
})

describe('选中', () => {
  it('单选：Enter / Space 选中聚焦日并替换原有选中', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.cell('2024-02-15').focus()
    const event = press(h.cell('2024-02-15'), ' ')
    expect(event.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['2024-02-15'])
    h.api().focus('2024-02-20')
    press(h.cell('2024-02-20'), 'Enter')
    expect(h.value()).toEqual(['2024-02-20'])
  })

  it('单选：点击替换；点邻月的日子会连带翻页', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    click(h.cell('2024-02-15'))
    expect(h.value()).toEqual(['2024-02-15'])
    click(h.cell('2024-03-02'))
    expect(h.value()).toEqual(['2024-03-02'])
    expect(h.api().visibleMonth.month).toBe(3)
  })

  it('多选：点击切换，集合按日期升序', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', selectionMode: 'multiple' })
    click(h.cell('2024-02-20'))
    click(h.cell('2024-02-15'))
    expect(h.value()).toEqual(['2024-02-15', '2024-02-20'])
    click(h.cell('2024-02-20'))
    expect(h.value()).toEqual(['2024-02-15'])
    expect(h.grid.getAttribute('aria-multiselectable')).toBe('true')
  })

  it('min/max 之外与作者判定不可用的日子点不动、确认键也不认', () => {
    const h = mount({
      defaultFocusedValue: '2024-02-15',
      min: '2024-02-10',
      max: '2024-02-20',
      isDateUnavailable: v => v === '2024-02-14',
    })
    click(h.cell('2024-02-05'))
    click(h.cell('2024-02-25'))
    click(h.cell('2024-02-14'))
    expect(h.value()).toEqual([])
    // aria-disabled 的格子点得着、事件真派得出去，所以碰得到连接层的守卫
    expect(h.cell('2024-02-14').getAttribute('aria-disabled')).toBe('true')
    expect(h.cell('2024-02-13').getAttribute('aria-disabled')).toBe('false')
    h.api().focus('2024-02-14')
    press(h.cell('2024-02-14'), 'Enter')
    expect(h.value()).toEqual([])
    h.api().focus('2024-02-13')
    press(h.cell('2024-02-13'), 'Enter')
    expect(h.value()).toEqual(['2024-02-13'])
  })

  it('只读：焦点与翻月照常，就是选不动', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', readOnly: true, defaultValue: '2024-02-15' })
    expect(h.grid.getAttribute('aria-readonly')).toBe('true')
    click(h.cell('2024-02-20'))
    expect(h.value()).toEqual(['2024-02-15'])
    // 焦点锚点照样跟着点击走
    expect(h.focusedValue()).toBe('2024-02-20')
    press(h.cell('2024-02-20'), 'Enter')
    expect(h.value()).toEqual(['2024-02-15'])
  })

  it('整张禁用：格子全转 aria-disabled，点击与确认键都改不了值', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', defaultValue: '2024-02-15', disabled: true })
    expect(h.root.getAttribute('data-disabled')).toBe('')
    expect(h.grid.getAttribute('aria-disabled')).toBe('true')
    expect(h.cell('2024-02-20').getAttribute('aria-disabled')).toBe('true')
    click(h.cell('2024-02-20'))
    press(h.cell('2024-02-15'), 'Enter')
    expect(h.value()).toEqual(['2024-02-15'])
    // 翻月按钮是单体控件，用原生 disabled
    expect(h.prev.hasAttribute('disabled')).toBe(true)
    expect(h.next.hasAttribute('disabled')).toBe(true)
  })

  it('受控 value：宿主不写回则选中纹丝不动，回调照发', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultFocusedValue: '2024-02-15', value: '2024-02-15', onValueChange })
    click(h.cell('2024-02-20'))
    expect(h.value()).toEqual(['2024-02-15'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['2024-02-20'] })
    h.setProps({ value: '2024-02-20' })
    expect(h.value()).toEqual(['2024-02-20'])
    expect(h.gridcell('2024-02-20').getAttribute('aria-selected')).toBe('true')
  })

  it('同一份选中值重复写入不重复通知：数组按元素比，不看引用', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultFocusedValue: '2024-02-15', selectionMode: 'multiple', defaultValue: ['2024-02-15'], onValueChange })
    h.api().setValue(['2024-02-15'])
    expect(onValueChange).not.toHaveBeenCalled()
    h.api().setValue(['2024-02-15', '2024-02-16'])
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it('单选下 setValue 截断到一天：公开 API 造不出 UI 造不出的选中集合', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.api().setValue(['2024-02-15', '2024-02-16'])
    expect(h.value()).toEqual(['2024-02-15'])
  })
})

describe('区间模式', () => {
  it('先点起点再点终点；倒着点也收成有序的两端', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', selectionMode: 'range' })
    click(h.cell('2024-02-20'))
    // 中间态：只有起点，宿主看得见半成品
    expect(h.value()).toEqual(['2024-02-20'])
    click(h.cell('2024-02-10'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-20'])
    // 区间已完成，再点一下重新开一段
    click(h.cell('2024-02-25'))
    expect(h.value()).toEqual(['2024-02-25'])
  })

  it('中间态按悬停预览区间，三种标记齐备且首尾都算 in-range', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', selectionMode: 'range' })
    click(h.cell('2024-02-10'))
    hover(h.cell('2024-02-13'))
    expect(h.cell('2024-02-10').getAttribute('data-range-start')).toBe('')
    expect(h.cell('2024-02-13').getAttribute('data-range-end')).toBe('')
    for (const day of ['2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13'])
      expect(h.cell(day).getAttribute('data-in-range')).toBe('')
    expect(h.cell('2024-02-14').hasAttribute('data-in-range')).toBe(false)
    expect(h.cell('2024-02-09').hasAttribute('data-in-range')).toBe(false)
    // 反向悬停：起点仍钉在 10 号，只是 range-start 落到更早的那一端
    hover(h.cell('2024-02-07'))
    expect(h.cell('2024-02-07').getAttribute('data-range-start')).toBe('')
    expect(h.cell('2024-02-10').getAttribute('data-range-end')).toBe('')
  })

  it('键盘挑区间：没有悬停时预览跟着聚焦日走', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-10', selectionMode: 'range' })
    h.cell('2024-02-10').focus()
    press(h.cell('2024-02-10'), 'Enter')
    press(h.cell('2024-02-10'), 'ArrowRight')
    await settle()
    press(h.cell('2024-02-11'), 'ArrowRight')
    await settle()
    expect(h.cell('2024-02-12').getAttribute('data-range-end')).toBe('')
    expect(h.cell('2024-02-11').getAttribute('data-in-range')).toBe('')
    press(h.cell('2024-02-12'), 'Enter')
    expect(h.value()).toEqual(['2024-02-10', '2024-02-12'])
  })

  it('指针离开整张网格即撤掉悬停预览', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', selectionMode: 'range' })
    click(h.cell('2024-02-10'))
    hover(h.cell('2024-02-13'))
    expect(h.cell('2024-02-12').getAttribute('data-in-range')).toBe('')
    h.grid.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }))
    // 预览退回「只有起点」那一格
    expect(h.cell('2024-02-12').hasAttribute('data-in-range')).toBe(false)
    expect(h.cell('2024-02-10').getAttribute('data-in-range')).toBe('')
  })

  it('区间完成后不再跟着悬停走', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', selectionMode: 'range' })
    click(h.cell('2024-02-10'))
    click(h.cell('2024-02-12'))
    hover(h.cell('2024-02-20'))
    expect(h.cell('2024-02-20').hasAttribute('data-in-range')).toBe(false)
    expect(h.cell('2024-02-12').getAttribute('data-range-end')).toBe('')
  })
})

describe('翻月', () => {
  it('上下月按钮改展示月，日号不变', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    click(h.next)
    expect(h.api().visibleMonth).toMatchObject({ year: 2024, month: 3 })
    click(h.prev)
    click(h.prev)
    expect(h.api().visibleMonth).toMatchObject({ year: 2024, month: 1 })
    expect(h.focusedValue()).toBe('2024-01-15')
  })

  it('越过 min/max 的那一月按钮转原生 disabled', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', min: '2024-02-01', max: '2024-02-29' })
    expect(h.prev.hasAttribute('disabled')).toBe(true)
    expect(h.next.hasAttribute('disabled')).toBe(true)
    expect(h.prev.getAttribute('data-disabled')).toBe('')

    // 边界只卡"整月都够不着"：1 月还有 31 号落在 min 之内时，上一月照样按得动
    const loose = mount({ defaultFocusedValue: '2024-02-15', min: '2024-01-31' })
    expect(loose.prev.hasAttribute('disabled')).toBe(false)
    click(loose.prev)
    expect(loose.api().visibleMonth.month).toBe(1)
    expect(loose.prev.hasAttribute('disabled')).toBe(true)
  })

  it('受控 focusedValue：宿主不写回则展示月纹丝不动，回调照发', () => {
    const onFocusedValueChange = vi.fn()
    const h = mount({ focusedValue: '2024-02-15', onFocusedValueChange })
    click(h.next)
    expect(h.focusedValue()).toBe('2024-02-15')
    expect(onFocusedValueChange).toHaveBeenCalledWith({ focusedValue: '2024-03-15' })
    h.setProps({ focusedValue: '2024-03-15' })
    expect(h.api().visibleMonth.month).toBe(3)
  })
})

describe('网格结构', () => {
  it('作者照 weeks 渲染出来的格子与矩阵逐格对齐', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', locale: 'zh-CN' })
    expect(h.rendered()).toEqual(buildMonthGrid('2024-02-15', { locale: 'zh-CN' }).weeks.flat().map(d => d.value))
    expect(h.rendered()).toHaveLength(35)
  })

  it('fixedWeeks 打开后恒六行四十二格', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', locale: 'zh-CN', fixedWeeks: true })
    expect(h.rendered()).toHaveLength(42)
  })
})

describe('标题钻取的纯函数', () => {
  it('钻回去的下一站：到了（或深过）作者要的那一档就该选中，不再往下钻', () => {
    // 按天挑：年 → 月 → 日
    expect(calendarZoomIn('year', 'day')).toBe('month')
    expect(calendarZoomIn('month', 'day')).toBe('day')
    expect(calendarZoomIn('day', 'day')).toBeNull()
    // 按月挑：年 → 月，到了月就是选中
    expect(calendarZoomIn('year', 'month')).toBe('month')
    expect(calendarZoomIn('month', 'month')).toBeNull()
    // 按季度挑：年 → 季度（不经月这一层）
    expect(calendarZoomIn('year', 'quarter')).toBe('quarter')
    expect(calendarZoomIn('quarter', 'quarter')).toBeNull()
    // 按年挑：已在顶上，点一格就是选中
    expect(calendarZoomIn('year', 'year')).toBeNull()
  })

  it('这一天归哪一格：格子的值是那段时间的第一天', () => {
    expect(calendarPeriodOf('2026-08-17', 'day')).toBe('2026-08-17')
    expect(calendarPeriodOf('2026-08-17', 'month')).toBe('2026-08-01')
    expect(calendarPeriodOf('2026-08-17', 'quarter')).toBe('2026-07-01')
    expect(calendarPeriodOf('2026-08-17', 'year')).toBe('2026-01-01')
    // 脏值原样交回，不抛——它在焦点恢复那一路上跑
    expect(calendarPeriodOf('不是日期', 'month')).toBe('不是日期')
  })

  it('这一天在本页第几格', () => {
    expect(calendarPeriodIndex('2026-08-17', 'month')).toBe(7)
    expect(calendarPeriodIndex('2026-08-17', 'quarter')).toBe(2)
    // 2026 落在 2020-2029 这一页的第 6 格
    expect(calendarPeriodIndex('2026-08-17', 'year')).toBe(6)
  })

  it('一格跨多少个月', () => {
    expect(calendarPeriodMonths('day')).toBe(1)
    expect(calendarPeriodMonths('month')).toBe(1)
    expect(calendarPeriodMonths('quarter')).toBe(3)
    expect(calendarPeriodMonths('year')).toBe(12)
  })

  it('钻下一层时细的位沿用原落点，越界的日号被夹住', () => {
    // 在 2026-02-18 上点 2020 那一格：钻到月视图后人还落在 2 月 18 日
    expect(calendarDrillAnchor('2026-02-18', '2020-01-01', 'month')).toBe('2020-02-18')
    expect(calendarDrillAnchor('2026-02-18', '2020-01-01', 'quarter')).toBe('2020-02-18')
    // 从月视图点 2 月：日号沿用
    expect(calendarDrillAnchor('2026-01-18', '2026-02-01', 'day')).toBe('2026-02-18')
    // 31 日落到 2 月：夹到 28（2026 不是闰年）
    expect(calendarDrillAnchor('2026-01-31', '2026-02-01', 'day')).toBe('2026-02-28')
    // 认不出来的串就用刚点那一格
    expect(calendarDrillAnchor('坏值', '2026-02-01', 'day')).toBe('2026-02-01')
  })

  it('标题拆成年月两截，先后随 locale', () => {
    const date = parseCalendarDate('2026-02-18')!
    // zh-CN：两截各带自己的单位，年在前
    expect(calendarHeadingPieces(date, 'zh-CN', 'UTC')).toEqual({
      year: '2026年',
      month: '2月',
      order: ['year', 'month'],
    })
    // en-US：月在前，月名是格式上下文里那一个（不是独立形）
    expect(calendarHeadingPieces(date, 'en-US', 'UTC')).toEqual({
      year: '2026',
      month: 'February',
      order: ['month', 'year'],
    })
  })
})

describe('粗粒度视图的方向键走格子', () => {
  it('月视图：左右一格一个月，上下一行三个月', () => {
    expect(calendarNavTarget('2026-08-17', 'day.next', 'zh-CN', 'month')).toBe('2026-09-17')
    expect(calendarNavTarget('2026-08-17', 'day.prev', 'zh-CN', 'month')).toBe('2026-07-17')
    expect(CALENDAR_PERIOD_COLUMNS.month).toBe(3)
    expect(calendarNavTarget('2026-08-17', 'week.next', 'zh-CN', 'month')).toBe('2026-11-17')
    expect(calendarNavTarget('2026-08-17', 'week.prev', 'zh-CN', 'month')).toBe('2026-05-17')
  })

  it('月视图：Home / End 到本行两头，翻页键走一整年', () => {
    // 8 月是第 7 格，落在第 3 行（6、7、8 月）：行头是 7 月、行尾是 9 月
    expect(calendarNavTarget('2026-08-17', 'week.start', 'zh-CN', 'month')).toBe('2026-07-17')
    expect(calendarNavTarget('2026-08-17', 'week.end', 'zh-CN', 'month')).toBe('2026-09-17')
    expect(calendarNavTarget('2026-08-17', 'month.next', 'zh-CN', 'month')).toBe('2027-08-17')
    // Shift+翻页走十页，与 « » 那对大步按钮同档
    expect(calendarNavTarget('2026-08-17', 'year.next', 'zh-CN', 'month')).toBe('2036-08-17')
  })

  it('季度视图：一格一季，一页四格排一行', () => {
    expect(calendarNavTarget('2026-08-17', 'day.next', 'zh-CN', 'quarter')).toBe('2026-11-17')
    expect(calendarNavTarget('2026-08-17', 'day.prev', 'zh-CN', 'quarter')).toBe('2026-05-17')
    expect(CALENDAR_PERIOD_COLUMNS.quarter).toBe(4)
    // 一行装得下整年，行头是 Q1 那一格
    expect(calendarNavTarget('2026-08-17', 'week.start', 'zh-CN', 'quarter')).toBe('2026-02-17')
  })

  it('年视图：一格一年，一行三格，翻页走十年', () => {
    expect(calendarNavTarget('2026-08-17', 'day.next', 'zh-CN', 'year')).toBe('2027-08-17')
    expect(calendarNavTarget('2026-08-17', 'week.next', 'zh-CN', 'year')).toBe('2029-08-17')
    expect(calendarNavTarget('2026-08-17', 'month.next', 'zh-CN', 'year')).toBe('2036-08-17')
  })

  it('日视图一步不差：view 缺省即从前那套', () => {
    expect(calendarNavTarget('2024-02-01', 'day.prev')).toBe(calendarNavTarget('2024-02-01', 'day.prev', 'zh-CN', 'day'))
    expect(calendarNavTarget('2024-02-01', 'week.next', 'zh-CN', 'day')).toBe('2024-02-08')
  })
})

/**
 * 会跟着 activeView 重画的日历：钻到哪一层就铺那一层的格子，标题里的年与月各是一个钮。
 * 钻取必须验渲染结果——只验 activeView 这个字段，看不出「钻上去之后网格还有没有 Tab 位」。
 */
function mountDrill(initial: Partial<Props> = {}) {
  const runtime = createVanillaRuntime()
  // props 挂在 signal 上：换 view 那一路要靠 watch 里的 track 复查，
  // 直接改一个普通对象，track 压根不会跑
  const props = runtime.signal<Partial<Props>>({ ...initial })
  const service = createService(calendarMachine, { props: () => props.get(), runtime })

  const doc = document
  const root = doc.createElement('div')
  const header = doc.createElement('div')
  const yearTrigger = doc.createElement('button')
  const monthTrigger = doc.createElement('button')
  header.append(yearTrigger, monthTrigger)
  const grid = doc.createElement('div')
  root.append(header, grid)
  doc.body.appendChild(root)

  service.refs.set('getGridEl', () => grid)
  runtime.start()

  const triggers = new Map<string, HTMLElement>()
  let painted = ''

  const render = (): void => {
    const api = connectCalendar(service, normalizeProps)
    // 日视图铺周行，粗粒度视图把格子直接铺进网格
    const items = api.activeView === 'day'
      ? api.panels[0]!.weeks.flat().map(d => d.value)
      : api.panels[0]!.cells.map(c => c.value)
    const key = `${api.activeView}|${items.join()}`
    if (key !== painted) {
      painted = key
      grid.textContent = ''
      triggers.clear()
      for (const value of items) {
        const cell = doc.createElement('div')
        const trigger = doc.createElement('div')
        cell.appendChild(trigger)
        grid.appendChild(cell)
        triggers.set(value, trigger)
      }
    }
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(yearTrigger, api.getHeadingYearTriggerProps() as Record<string, unknown>)
    yearTrigger.textContent = api.panels[0]!.headingYear
    spread(monthTrigger, api.getHeadingMonthTriggerProps() as Record<string, unknown>)
    monthTrigger.textContent = api.panels[0]!.headingMonth
    spread(grid, api.getGridProps() as Record<string, unknown>)
    for (const [value, trigger] of triggers)
      spread(trigger, api.getCellTriggerProps({ value }) as Record<string, unknown>)
  }

  runtime.subscribe(render)
  render()

  return {
    api: () => connectCalendar(service, normalizeProps),
    grid,
    yearTrigger,
    monthTrigger,
    cell: (value: string) => {
      const el = triggers.get(value)
      if (!el)
        throw new Error(`网格里没有 ${value} 这一格（此刻铺的是 ${connectCalendar(service, normalizeProps).activeView}）`)
      return el
    },
    rendered: () => [...triggers.keys()],
    setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
    value: () => service.context.get('value'),
  }
}

describe('标题钻取', () => {
  it('缺省钻到的层就是作者要挑的那一档', () => {
    expect(mountDrill({ defaultFocusedValue: '2026-02-18' }).api().activeView).toBe('day')
    expect(mountDrill({ defaultFocusedValue: '2026-02-18', view: 'month' }).api().activeView).toBe('month')
  })

  it('日视图的标题拆成两截，各自可点', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' })
    expect(h.yearTrigger.textContent).toBe('2026年')
    expect(h.monthTrigger.textContent).toBe('2月')
    expect(h.yearTrigger.hasAttribute('disabled')).toBe(false)
    expect(h.monthTrigger.hasAttribute('hidden')).toBe(false)
  })

  it('点年那一截钻到十年格，那一页含原来的落点', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' })
    click(h.yearTrigger)
    expect(h.api().activeView).toBe('year')
    // 十年格铺的是 2019-2030（两端各带一格邻十年）
    expect(h.rendered()).toContain('2026-01-01')
    expect(h.api().panels[0]!.headingLabel).toBe('2020年-2029年')
    // 到顶了：那一截只作标题显示，不再可点；月那一截整个收起
    expect(h.yearTrigger.textContent).toBe('2020年-2029年')
    expect(h.yearTrigger.hasAttribute('disabled')).toBe(true)
    expect(h.monthTrigger.hasAttribute('hidden')).toBe(true)
  })

  it('钻上去之后网格仍有一个 Tab 位：聚焦的是含落点那一格', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' })
    click(h.yearTrigger)
    // 落点还是 2026-02-18，而年格的值是 2026-01-01——两者不等，靠「归哪一格」才对得上
    expect(h.cell('2026-01-01').getAttribute('tabindex')).toBe('0')
    expect(h.cell('2026-01-01').getAttribute('data-focus')).toBe('')
    expect(h.cell('2027-01-01').getAttribute('tabindex')).toBe('-1')
  })

  it('一路钻回来：年 → 月 → 日，细的位一直沿用', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' })
    click(h.yearTrigger)
    // 点 2020 那一格：这一下是导航，不是选中
    click(h.cell('2020-01-01'))
    expect(h.api().activeView).toBe('month')
    expect(h.value()).toEqual([])
    // 日号与月份沿用，落点成了 2020-02-18
    expect(h.api().focusedValue).toBe('2020-02-18')
    expect(h.cell('2020-02-01').getAttribute('tabindex')).toBe('0')

    // 点 8 月那一格：钻回日视图
    click(h.cell('2020-08-01'))
    expect(h.api().activeView).toBe('day')
    expect(h.value()).toEqual([])
    expect(h.api().focusedValue).toBe('2020-08-18')
    // 这一下起才是选中
    click(h.cell('2020-08-20'))
    expect(h.value()).toEqual(['2020-08-20'])
  })

  it('按月挑的日历点一个月就是选中，不往下钻', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', view: 'month', locale: 'zh-CN' })
    expect(h.api().activeView).toBe('month')
    click(h.cell('2026-08-01'))
    expect(h.value()).toEqual(['2026-08-01'])
    expect(h.api().activeView).toBe('month')
  })

  it('按月挑时钻上去看年份，点回一年落回月那一档而不是选中', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', view: 'month', locale: 'zh-CN' })
    click(h.yearTrigger)
    expect(h.api().activeView).toBe('year')
    click(h.cell('2030-01-01'))
    expect(h.api().activeView).toBe('month')
    expect(h.value()).toEqual([])
    // 这一下才落值
    click(h.cell('2030-05-01'))
    expect(h.value()).toEqual(['2030-05-01'])
  })

  it('按季度挑时年那一层直接钻回季度，不经月', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', view: 'quarter', locale: 'zh-CN' })
    click(h.yearTrigger)
    click(h.cell('2026-01-01'))
    expect(h.api().activeView).toBe('quarter')
    click(h.cell('2026-10-01'))
    expect(h.value()).toEqual(['2026-10-01'])
  })

  it('月/季度那两层没有「月」那一截可点', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', view: 'month', locale: 'zh-CN' })
    expect(h.monthTrigger.hasAttribute('hidden')).toBe(true)
    expect(h.yearTrigger.textContent).toBe('2026年')
    expect(h.yearTrigger.hasAttribute('disabled')).toBe(false)
  })

  it('点月那一截钻到月格，再点一个月就回到日视图', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' })
    click(h.monthTrigger)
    expect(h.api().activeView).toBe('month')
    expect(h.api().panels[0]!.headingLabel).toBe('2026年')
    click(h.cell('2026-11-01'))
    expect(h.api().activeView).toBe('day')
    expect(h.api().focusedValue).toBe('2026-11-18')
  })

  it('确认键在还没钻到那一档时也是往下钻', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' })
    click(h.yearTrigger)
    press(h.grid, 'Enter')
    expect(h.api().activeView).toBe('month')
    expect(h.value()).toEqual([])
  })

  it('方向键在十年格里一格一年走，落点跟着换格', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' })
    click(h.yearTrigger)
    press(h.grid, 'ArrowRight')
    expect(h.api().focusedValue).toBe('2027-02-18')
    expect(h.cell('2027-01-01').getAttribute('tabindex')).toBe('0')
    // 上下一行三格
    press(h.grid, 'ArrowDown')
    expect(h.api().focusedValue).toBe('2030-02-18')
  })

  it('钻取不受只读拦阻，也不受粗粒度格子的可用性拦阻', () => {
    // min 落在 7 月末：7 月 1 日那一格算「不可用」，但 7 月里仍有挑得了的日子
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', min: '2026-07-28', readOnly: true, locale: 'zh-CN' })
    click(h.monthTrigger)
    expect(h.cell('2026-07-01').getAttribute('data-disabled')).toBe('')
    click(h.cell('2026-07-01'))
    // 拦住的话就再也钻不进 7 月了
    expect(h.api().activeView).toBe('day')
    expect(h.api().focusedValue).toBe('2026-07-18')
  })

  it('整张禁用时标题两截都按不动', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', disabled: true, locale: 'zh-CN' })
    expect(h.yearTrigger.hasAttribute('disabled')).toBe(true)
    expect(h.monthTrigger.hasAttribute('disabled')).toBe(true)
    click(h.yearTrigger)
    expect(h.api().activeView).toBe('day')
  })

  it('受控 activeView：宿主不写回就纹丝不动，回调照发', () => {
    const onActiveViewChange = vi.fn()
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', activeView: 'day', onActiveViewChange, locale: 'zh-CN' })
    click(h.yearTrigger)
    expect(h.api().activeView).toBe('day')
    expect(onActiveViewChange).toHaveBeenCalledWith({ activeView: 'year' })
    h.setProps({ activeView: 'year' })
    expect(h.api().activeView).toBe('year')
  })

  it('作者换了要挑的粒度，钻到哪一层的记录随之作废', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' })
    click(h.yearTrigger)
    expect(h.api().activeView).toBe('year')
    h.setProps({ view: 'month' })
    expect(h.api().activeView).toBe('month')
  })

  it('setActiveView 是命令式的同一条路', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' })
    h.api().setActiveView('quarter')
    expect(h.api().activeView).toBe('quarter')
    expect(h.rendered()).toEqual(['2026-01-01', '2026-04-01', '2026-07-01', '2026-10-01'])
  })

  it('标题两截的先后由 locale 给出，作者照它摆钮', () => {
    expect(mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'zh-CN' }).api().headingOrder)
      .toEqual(['year', 'month'])
    expect(mountDrill({ defaultFocusedValue: '2026-02-18', locale: 'en-US' }).api().headingOrder)
      .toEqual(['month', 'year'])
  })
})
