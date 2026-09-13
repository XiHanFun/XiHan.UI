/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar.grid 相关实现。

import type { CalendarDate } from '@internationalized/date'
import {
  DateFormatter,
  endOfWeek,
  getWeeksInMonth,
  parseDate,
  startOfMonth,
  startOfWeek,
} from '@internationalized/date'

// 月视图的纯数学与纯格式化：不碰 DOM、不认识状态机，把「哪一天 + locale」翻成
// 一张日期矩阵、一排星期几表头、一个方向键落点。日期运算全部委托给
// @internationalized/date 的不可变值对象。

/**
 * 这些纯函数没拿到 locale 时用的兜底。周首日（周日还是周一）由它决定。
 * 连接层不走这里：它先按宿主语言解析，解析不出才落到同一个值。
 */
export const CALENDAR_LOCALE = 'en-US'
/** 一周恒七天：矩阵的列数。 */
export const CALENDAR_WEEK_LENGTH = 7
/** fixedWeeks 打开后固定渲染的周行数；六行能装下任何公历月份。 */
export const CALENDAR_FIXED_WEEKS = 6

/** 可选择的周期粒度。选择模式由 selectionMode 单独决定。 */
export type CalendarGranularity = 'day' | 'week' | 'month' | 'quarter' | 'year'

/** 面板当前渲染的层级；与选择粒度使用同一组层级，但由 activeView 独立持有。 */
export type CalendarView = CalendarGranularity

/** 一切可选格子的统一数据模型。日期运算仍使用 ISO 日期串，不把日期库对象泄露到公开面。 */
export interface CalendarPeriod {
  /** 稳定回显键。 */
  key: string
  /** 周期第一天，YYYY-MM-DD。 */
  start: string
  /** 周期最后一天，YYYY-MM-DD。 */
  end: string
  /** 格子上的可见文案。 */
  label: string
  /** 是否属于相邻容器。 */
  outside: boolean
}

/** 单选或区间选择可直接交给查询层的规范化结果。 */
export interface CalendarPeriodValue {
  granularity: CalendarGranularity
  start: string
  end: string
  /** 单选一个键，区间两个端点键。 */
  keys: string[]
}

/** 矩阵里的一格。 */
export interface CalendarDay extends CalendarPeriod {
  year: number
  month: number
  day: number
}

/** 一个月的完整网格。 */
export interface CalendarMonthGrid {
  /** 展示月的年。 */
  year: number
  /** 展示月的月，1-12。 */
  month: number
  /** 展示月首日的 ISO 串。 */
  monthStart: string
  /** 周行，每行恒 7 格，行首是 locale 的周首日。 */
  weeks: CalendarDay[][]
}

export interface CalendarMonthGridOptions {
  /** 决定周首日，不给按 CALENDAR_LOCALE（en-US，周日起）。 */
  locale?: string
  /** 恒补满六行，默认按当月实际占用的周数（4-6 行）。 */
  fixedWeeks?: boolean
}

/** 表头里的一列。 */
export interface CalendarWeekDay {
  /** 列序号 0-6，行首为 0；作者在 week-day 部件上照抄它当身份。 */
  value: number
  /** 可见文本（narrow/short），由 weekdayFormat 决定。 */
  label: string
  /** 全称，给读屏用。 */
  long: string
}

export interface CalendarWeekDaysOptions {
  /** 参照日：取它所在那一周产出七列，周首日与网格首列对齐。 */
  reference: string
  locale?: string
  weekdayFormat?: 'narrow' | 'short'
  timeZone?: string
}

/** 方向键/翻页键的落点意图。 */
export type CalendarNavIntent
  = | 'day.prev'
    | 'day.next'
    | 'week.prev'
    | 'week.next'
    | 'week.start'
    | 'week.end'
    | 'month.prev'
    | 'month.next'
    | 'year.prev'
    | 'year.next'

/** 只需要读键名与修饰键，形状放宽以便直接传 KeyboardEvent。 */
export interface CalendarNavKeyEventLike {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

/** ISO 串 → 日期值对象；解析不了一律给 null（parseDate 遇脏值会抛）。 */
export function parseCalendarDate(value: string | null | undefined): CalendarDate | null {
  if (!value)
    return null
  try {
    return parseDate(value)
  }
  catch {
    return null
  }
}

/**
 * 生成某个月的日期矩阵。
 *
 * 首行从「展示月首日所在那一周的周首日」起算，首尾两行会带上邻月的日子，
 * 它们照样可点可聚焦，只是 inMonth 为 false。
 *
 * anchor 必须是合法 ISO 日期串，否则原样抛出解析错误。
 */
export function buildMonthGrid(anchor: string, options: CalendarMonthGridOptions = {}): CalendarMonthGrid {
  const { locale = CALENDAR_LOCALE, fixedWeeks = false } = options
  const first = startOfMonth(parseDate(anchor))
  const weekCount = fixedWeeks ? CALENDAR_FIXED_WEEKS : getWeeksInMonth(first, locale)

  const weeks: CalendarDay[][] = []
  let cursor = startOfWeek(first, locale)
  for (let w = 0; w < weekCount; w++) {
    const row: CalendarDay[] = []
    for (let d = 0; d < CALENDAR_WEEK_LENGTH; d++) {
      const value = cursor.toString()
      const outside = cursor.year !== first.year || cursor.month !== first.month
      row.push({
        key: value,
        start: value,
        end: value,
        label: String(cursor.day),
        outside,
        year: cursor.year,
        month: cursor.month,
        day: cursor.day,
      })
      cursor = cursor.add({ days: 1 })
    }
    weeks.push(row)
  }

  return { year: first.year, month: first.month, monthStart: first.toString(), weeks }
}

/** 生成七列表头。取参照日所在那一周逐日格式化，列序与 buildMonthGrid 一致。 */
export function buildWeekDays(options: CalendarWeekDaysOptions): CalendarWeekDay[] {
  const { reference, locale = CALENDAR_LOCALE, weekdayFormat = 'short', timeZone = 'UTC' } = options
  const start = startOfWeek(parseDate(reference), locale)
  const shortFormatter = new DateFormatter(locale, { weekday: weekdayFormat, timeZone })
  const longFormatter = new DateFormatter(locale, { weekday: 'long', timeZone })

  const out: CalendarWeekDay[] = []
  for (let i = 0; i < CALENDAR_WEEK_LENGTH; i++) {
    const date = start.add({ days: i }).toDate(timeZone)
    out.push({ value: i, label: shortFormatter.format(date), long: longFormatter.format(date) })
  }
  return out
}

/**
 * 按键 → 落点意图。返回 null 表示这个键不归日历管，调用方**不得** preventDefault。
 * Ctrl/Meta/Alt 组合一律不接；Shift 只在翻页键上把「一个月」放大成「一年」。
 */
export function calendarNavFromKey(event: CalendarNavKeyEventLike): CalendarNavIntent | null {
  if (event.ctrlKey || event.metaKey || event.altKey)
    return null
  switch (event.key) {
    case 'ArrowLeft':
      return 'day.prev'
    case 'ArrowRight':
      return 'day.next'
    case 'ArrowUp':
      return 'week.prev'
    case 'ArrowDown':
      return 'week.next'
    case 'Home':
      return 'week.start'
    case 'End':
      return 'week.end'
    case 'PageUp':
      return event.shiftKey ? 'year.prev' : 'month.prev'
    case 'PageDown':
      return event.shiftKey ? 'year.next' : 'month.next'
    default:
      return null
  }
}

/**
 * 从某天出发按意图走一步，返回落点的 ISO 串。
 * 跨月不特殊处理：结果自然落进邻月，展示月由落点反推。
 * 月/年这两步必须交给值对象的 add/subtract（1 月 31 日加一个月是 2 月 28/29 日），手写日期数学会算错。
 *
 * 粗粒度视图（月/季度/年）走的是格子而不是天：左右一格、上下一行、翻页一整页。
 * 拿日视图那套算会让方向键在一格之内空走七下才挪得动一格。
 */
export function calendarNavTarget(
  anchor: string,
  intent: CalendarNavIntent,
  locale = CALENDAR_LOCALE,
  view: CalendarView = 'day',
): string {
  if (view !== 'day')
    return periodNavTarget(anchor, intent, view)
  const date = parseDate(anchor)
  switch (intent) {
    case 'day.prev':
      return date.subtract({ days: 1 }).toString()
    case 'day.next':
      return date.add({ days: 1 }).toString()
    case 'week.prev':
      return date.subtract({ days: CALENDAR_WEEK_LENGTH }).toString()
    case 'week.next':
      return date.add({ days: CALENDAR_WEEK_LENGTH }).toString()
    case 'week.start':
      return startOfWeek(date, locale).toString()
    case 'week.end':
      return endOfWeek(date, locale).toString()
    case 'month.prev':
      return date.subtract({ months: 1 }).toString()
    case 'month.next':
      return date.add({ months: 1 }).toString()
    case 'year.prev':
      return date.subtract({ years: 1 }).toString()
    case 'year.next':
      return date.add({ years: 1 }).toString()
  }
}

/** 并排面板数归一：只认 >= 1 的整数，写坏了回落到 1。连接层与机器共用这一条。 */
export function visibleCountOf(count: number | undefined): number {
  const n = Math.trunc(count ?? 1)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

// —— 周期视图：周 / 月 / 季度 / 年 ——
//
// 格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态。
// 这样 min/max 比较、区间逻辑、不可用判定、隐藏输入全都原样复用，
// 显示成「2026-08」还是「2026年8月」是分段输入与作者的事。

/** 年视图一页十年。 */
export const CALENDAR_YEARS_PER_PAGE = 10

/**
 * 粗粒度视图每行几格。方向键上下移动要靠它换算。
 * 与 `packages/design/styles/css/calendar.css` 里那几条 grid-template-columns 是同一套档位，
 * 改一处必须改另一处——CSS 引不到 JS，这是唯一一处两头写死的数。
 */
export const CALENDAR_PERIOD_COLUMNS: Readonly<Record<Exclude<CalendarView, 'day'>, number>> = {
  week: 1,
  month: 3,
  quarter: 4,
  year: 3,
}

/** 一格跨多少个月：月一格一个月，季度三个月，年十二个月。 */
export function calendarPeriodMonths(view: Exclude<CalendarView, 'day' | 'week'>): number {
  if (view === 'quarter')
    return 3
  if (view === 'year')
    return 12
  return 1
}

/** 一页有多少格。 */
function periodCellCount(view: Exclude<CalendarView, 'day'>): number {
  if (view === 'week')
    return 1
  return view === 'year' ? CALENDAR_YEARS_PER_PAGE : 12 / calendarPeriodMonths(view)
}

/**
 * 这一天落在本页第几格，0 起。
 * 月视图按月、季度视图按季、年视图按它在这个十年里的第几年。
 */
export function calendarPeriodIndex(value: string, view: Exclude<CalendarView, 'day'>): number {
  const date = parseDate(value)
  if (view === 'week')
    return 0
  if (view === 'year')
    return date.year - calendarPeriodStart(date, 'year').year
  return Math.floor((date.month - 1) / calendarPeriodMonths(view))
}

/**
 * 粗粒度视图里的方向键落点：一格一格走，不是一天一天走。
 *
 * 左右一格、上下一行（行宽即 CALENDAR_PERIOD_COLUMNS）、Home/End 到本行两头、
 * 翻页键一整页、Shift+翻页键十页——与大步翻那对按钮同一个档位。
 * 细的位（日号）一路沿用，钻回日视图时人还落在原来那一天上。
 */
function periodNavTarget(anchor: string, intent: CalendarNavIntent, view: Exclude<CalendarView, 'day'>): string {
  const date = parseDate(anchor)
  if (view === 'week') {
    switch (intent) {
      case 'day.prev':
      case 'week.prev':
        return date.subtract({ weeks: 1 }).toString()
      case 'day.next':
      case 'week.next':
        return date.add({ weeks: 1 }).toString()
      case 'week.start':
      case 'week.end':
        return date.toString()
      case 'month.prev':
        return date.subtract({ months: 1 }).toString()
      case 'month.next':
        return date.add({ months: 1 }).toString()
      case 'year.prev':
        return date.subtract({ years: 1 }).toString()
      case 'year.next':
        return date.add({ years: 1 }).toString()
    }
  }
  const unit = calendarPeriodMonths(view)
  const columns = CALENDAR_PERIOD_COLUMNS[view]
  const page = calendarPageMonths(view)
  const step = (months: number): string => date.add({ months }).toString()

  switch (intent) {
    case 'day.prev':
      return step(-unit)
    case 'day.next':
      return step(unit)
    case 'week.prev':
      return step(-unit * columns)
    case 'week.next':
      return step(unit * columns)
    case 'week.start':
    case 'week.end': {
      const index = calendarPeriodIndex(anchor, view)
      const row = Math.floor(index / columns)
      const target = intent === 'week.start'
        ? row * columns
        : Math.min(row * columns + columns - 1, periodCellCount(view) - 1)
      return step((target - index) * unit)
    }
    case 'month.prev':
      return step(-page)
    case 'month.next':
      return step(page)
    case 'year.prev':
      return step(-page * 10)
    case 'year.next':
      return step(page * 10)
  }
}

/**
 * 把任意日期归一成它所在的周期。
 *
 * 周期格用 start 当行为锚点，而聚焦日可能是周期中的任意一天。
 * 「哪一格是聚焦的」必须先归一——直接拿聚焦日与格子锚点比，一页里会一格都对不上，
 * 于是整张网格连一个 Tab 位都不剩。
 */
export function calendarPeriodOf(
  value: string,
  granularity: CalendarGranularity,
  options: CalendarPeriodGridOptions = {},
): CalendarPeriod | null {
  const date = parseCalendarDate(value)
  if (!date)
    return null
  const { locale = CALENDAR_LOCALE, timeZone = 'UTC' } = options

  if (granularity === 'day') {
    const iso = date.toString()
    return { key: iso, start: iso, end: iso, label: String(date.day), outside: false }
  }

  if (granularity === 'week') {
    const start = startOfWeek(date, 'en-GB')
    const end = start.add({ days: CALENDAR_WEEK_LENGTH - 1 })
    const rangeFormat = new DateFormatter(locale, { month: '2-digit', day: '2-digit', timeZone })
    return {
      key: `${isoWeekYear(start.toString())}-W${String(isoWeekNumber(start.toString())).padStart(2, '0')}`,
      start: start.toString(),
      end: end.toString(),
      label: `${rangeFormat.format(start.toDate(timeZone))}–${rangeFormat.format(end.toDate(timeZone))}`,
      outside: false,
    }
  }

  if (granularity === 'year') {
    const start = date.set({ month: 1, day: 1 })
    return {
      key: String(start.year),
      start: start.toString(),
      end: start.add({ years: 1 }).subtract({ days: 1 }).toString(),
      label: String(start.year),
      outside: false,
    }
  }

  const months = calendarPeriodMonths(granularity)
  const month = Math.floor((date.month - 1) / months) * months + 1
  const start = date.set({ month, day: 1 })
  const end = start.add({ months }).subtract({ days: 1 })
  if (granularity === 'quarter') {
    const quarter = Math.floor((month - 1) / 3) + 1
    return {
      key: `${start.year}-Q${quarter}`,
      start: start.toString(),
      end: end.toString(),
      label: `Q${quarter}`,
      outside: false,
    }
  }
  return {
    key: `${start.year}-${String(start.month).padStart(2, '0')}`,
    start: start.toString(),
    end: end.toString(),
    label: new DateFormatter(locale, { month: 'short', timeZone }).format(start.toDate(timeZone)),
    outside: false,
  }
}

/** 把单选或区间的周期锚点转换为稳定的查询值；multiple 不在这份连续区间契约内。 */
export function calendarPeriodValue(
  granularity: CalendarGranularity,
  selectionMode: 'single' | 'range',
  values: readonly string[],
  options: CalendarPeriodGridOptions = {},
): CalendarPeriodValue | null {
  const periods = values
    .map(value => calendarPeriodOf(value, granularity, options))
    .filter((period): period is CalendarPeriod => period != null)
    .sort((a, b) => a.start.localeCompare(b.start))
  if (periods.length === 0)
    return null
  const selected = selectionMode === 'single' ? periods.slice(0, 1) : periods.slice(0, 2)
  return {
    granularity,
    start: selected[0]!.start,
    end: selected[selected.length - 1]!.end,
    keys: selected.map(period => period.key),
  }
}

/** 标题拆成年、月两截，另附它们在这个语言里的先后。 */
export interface CalendarHeadingPieces {
  /** 年那一截，带上紧跟其后的单位（2026年 / 2026 / 2026년）。 */
  year: string
  /** 月那一截（2月 / February / 2월）。 */
  month: string
  /** 两截的先后：zh-CN 年在前，en-US 月在前。 */
  order: readonly ('year' | 'month')[]
}

/**
 * 把「2026年2月」这样一条标题拆成年与月两截，各自带上紧跟其后的那个字面量。
 *
 * 不能分别按 { year: 'numeric' } 与 { month: 'long' } 格式化：后者拿到的是独立形，
 * zh-CN 会出「二月」而不是标题里那个「2月」。先后也只能这么问出来——
 * 拆出来的两截要摆成这个语言读得顺的顺序。
 */
export function calendarHeadingPieces(
  anchor: CalendarDate,
  locale = CALENDAR_LOCALE,
  timeZone = 'UTC',
): CalendarHeadingPieces {
  const parts = new DateFormatter(locale, { year: 'numeric', month: 'long', timeZone })
    .formatToParts(anchor.toDate(timeZone))
  const order: ('year' | 'month')[] = []
  let year = ''
  let month = ''
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i]!
    if (part.type !== 'year' && part.type !== 'month')
      continue
    // 紧跟其后的字面量是这一截的单位（年 / 月 / 년 / г.）；两边的空白去掉
    const next = parts[i + 1]
    const text = `${part.value}${next?.type === 'literal' ? next.value : ''}`.trim()
    if (part.type === 'year')
      year = text
    else
      month = text
    order.push(part.type)
  }
  return { year, month, order }
}

/**
 * 视图的粗细档：越大越细。月与季度同档——它们都是「一年之内」，
 * 互相之间钻不过去（按季度挑就没有月这一层）。
 */
const VIEW_DEPTH: Readonly<Record<CalendarView, number>> = {
  year: 0,
  quarter: 1,
  month: 1,
  week: 2,
  day: 2,
}

/**
 * 从当前视图往作者要的那一档钻回去，返回下一站；已经到了（或深过）就给 null。
 *
 * null 是「这一格该被选中」的判据：按月挑的日历点一个月就是选中那个月，
 * 而从日视图钻上去看年份、再点回某个月，那一下是导航不是选中。
 */
export function calendarZoomIn(current: CalendarView, base: CalendarView): CalendarView | null {
  if (VIEW_DEPTH[current] >= VIEW_DEPTH[base])
    return null
  // 年 → 一年之内那一档：作者按季度挑就落季度，否则落月
  if (current === 'year')
    return base === 'quarter' ? 'quarter' : 'month'
  return base === 'week' ? 'week' : 'day'
}

/**
 * 钻下一层时的新落点：刚点那一格定粗的位，细的位沿用原落点。
 *
 * 在 2026-02-18 上钻到年视图挑 2020，得到的是 2020-02-18 而不是 2020-01-01——
 * 一路钻回日视图时人还落在原来那一天上。越界的日号由值对象夹住（2 月 31 日 → 2 月 28 日）。
 */
export function calendarDrillAnchor(anchor: string, picked: string, next: CalendarView): string {
  const from = parseCalendarDate(anchor)
  const to = parseCalendarDate(picked)
  if (!from || !to)
    return picked
  if (next === 'month' || next === 'quarter')
    return to.set({ month: from.month, day: from.day }).toString()
  if (next === 'day' || next === 'week')
    return to.set({ day: from.day }).toString()
  return picked
}

/** 一个粗粒度面板。 */
export interface CalendarPeriodGrid {
  /** 面板跨度的第一天，ISO 串。 */
  startValue: string
  /** 标题文案（2026年 / 2020-2029）。 */
  headingLabel: string
  cells: CalendarPeriod[]
}

/** 一个视图翻一页走多少个月：月与季度按年翻，年按十年翻。 */
export function calendarPageMonths(view: CalendarView): number {
  if (view === 'month' || view === 'quarter')
    return 12
  if (view === 'year')
    return CALENDAR_YEARS_PER_PAGE * 12
  return 1
}

/** 面板跨度的起点：日/周归到当月，月/季度归到当年，年归到当个十年。 */
export function calendarPeriodStart(anchor: CalendarDate, view: CalendarView): CalendarDate {
  if (view === 'day' || view === 'week')
    return startOfMonth(anchor)
  if (view === 'year') {
    const decade = Math.floor(anchor.year / CALENDAR_YEARS_PER_PAGE) * CALENDAR_YEARS_PER_PAGE
    return startOfMonth(anchor.set({ year: decade, month: 1, day: 1 }))
  }
  return startOfMonth(anchor.set({ month: 1, day: 1 }))
}

export interface CalendarPeriodGridOptions {
  locale?: string
  timeZone?: string
}

/**
 * 生成周 / 月 / 季度 / 年面板。anchor 决定落在哪一页。
 *
 * 年视图前后各多带一格邻十年：与日视图首尾行带上邻月的日子同一套做法，
 * 让页与页之间接得上、方向键走过去不掉格。
 */
export function buildPeriodGrid(
  anchor: string,
  view: Exclude<CalendarView, 'day'>,
  options: CalendarPeriodGridOptions = {},
): CalendarPeriodGrid {
  const { locale = CALENDAR_LOCALE, timeZone = 'UTC' } = options
  const base = parseDate(anchor)
  const start = calendarPeriodStart(base, view)
  const cells: CalendarPeriod[] = []

  if (view === 'week') {
    const monthStart = startOfMonth(base)
    const monthEnd = monthStart.add({ months: 1 }).subtract({ days: 1 })
    let cursor = startOfWeek(monthStart, 'en-GB')
    const last = startOfWeek(monthEnd, 'en-GB')
    while (cursor.compare(last) <= 0) {
      const period = calendarPeriodOf(cursor.toString(), 'week', options)!
      cells.push({
        ...period,
        label: `${period.key.slice(-3)}  ${period.label}`,
        outside: false,
      })
      cursor = cursor.add({ weeks: 1 })
    }
    return {
      startValue: monthStart.toString(),
      headingLabel: new DateFormatter(locale, { year: 'numeric', month: 'long', timeZone }).format(monthStart.toDate(timeZone)),
      cells,
    }
  }

  if (view === 'month' || view === 'quarter') {
    const step = view === 'quarter' ? 3 : 1
    const fmt = new DateFormatter(locale, { month: 'short', timeZone })
    for (let i = 0; i < 12; i += step) {
      const cell = start.add({ months: i })
      const period = calendarPeriodOf(cell.toString(), view, options)!
      cells.push({ ...period, label: view === 'quarter' ? `Q${i / 3 + 1}` : fmt.format(cell.toDate(timeZone)) })
    }
    return {
      startValue: start.toString(),
      headingLabel: new DateFormatter(locale, { year: 'numeric', timeZone }).format(start.toDate(timeZone)),
      cells,
    }
  }

  const yearFmt = new DateFormatter(locale, { year: 'numeric', timeZone })
  for (let i = -1; i <= CALENDAR_YEARS_PER_PAGE; i++) {
    const cell = start.add({ years: i })
    const period = calendarPeriodOf(cell.toString(), 'year', options)!
    cells.push({ ...period, outside: i < 0 || i >= CALENDAR_YEARS_PER_PAGE })
  }
  const last = start.add({ years: CALENDAR_YEARS_PER_PAGE - 1 })
  return {
    startValue: start.toString(),
    headingLabel: `${yearFmt.format(start.toDate(timeZone))}-${yearFmt.format(last.toDate(timeZone))}`,
    cells,
  }
}

/**
 * 一天所在 ISO 周的起止（含两端），固定周一到周日。
 */
export function calendarWeekRange(value: string): [string, string] {
  const date = parseDate(value)
  const start = startOfWeek(date, 'en-GB')
  return [start.toString(), start.add({ days: CALENDAR_WEEK_LENGTH - 1 }).toString()]
}

/**
 * ISO 8601 周序号：周一起算，含当年第一个周四的那一周是第 1 周。
 *
 * 自己算而不走 Intl：`Intl.DateTimeFormat` 至今没有周序号字段，
 * 各家 polyfill 的口径也不统一（有按周日起算的），而周选的标签必须与 min/max 的判断同源。
 */
export function isoWeekNumber(value: string): number {
  const date = parseDate(value)
  // 挪到本周周四：ISO 规定「这一周归哪一年」看的就是周四落在哪一年
  const day = date.toDate('UTC').getUTCDay()
  const thursday = date.add({ days: ((day === 0 ? 7 : day) * -1) + 4 })
  const jan1 = thursday.set({ month: 1, day: 1 })
  const days = Math.round(
    (thursday.toDate('UTC').getTime() - jan1.toDate('UTC').getTime()) / 86400000,
  )
  return Math.floor(days / 7) + 1
}

/** ISO 周所属的周序年；跨年周按周四落在哪一年判断。 */
export function isoWeekYear(value: string): number {
  const date = parseDate(value)
  const day = date.toDate('UTC').getUTCDay()
  return date.add({ days: ((day === 0 ? 7 : day) * -1) + 4 }).year
}
