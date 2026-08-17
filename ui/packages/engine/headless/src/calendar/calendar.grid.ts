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

/** 默认 locale。周首日（周日还是周一）就是由它决定的。 */
export const CALENDAR_LOCALE = 'zh-CN'
/** 一周恒七天：矩阵的列数。 */
export const CALENDAR_WEEK_LENGTH = 7
/** fixedWeeks 打开后固定渲染的周行数；六行能装下任何公历月份。 */
export const CALENDAR_FIXED_WEEKS = 6

/** 矩阵里的一格。 */
export interface CalendarDay {
  /** ISO 日期串（YYYY-MM-DD）；受控值、格子身份、事件载荷统一用它。 */
  value: string
  year: number
  month: number
  day: number
  /** 是否落在展示月内。首尾两行会带上邻月的日子，它们是 false。 */
  inMonth: boolean
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
  /** 决定周首日，默认 zh-CN（周一起）。 */
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
      row.push({
        value: cursor.toString(),
        year: cursor.year,
        month: cursor.month,
        day: cursor.day,
        // 逐字段比年月，不用 isSameMonth（它按首参的历法折算）
        inMonth: cursor.year === first.year && cursor.month === first.month,
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
 */
export function calendarNavTarget(anchor: string, intent: CalendarNavIntent, locale = CALENDAR_LOCALE): string {
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

// —— 粗粒度视图：月 / 季度 / 年 ——
//
// 格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态。
// 这样 min/max 比较、区间逻辑、不可用判定、隐藏输入全都原样复用，
// 显示成「2026-08」还是「2026年8月」是分段输入与作者的事。

/** 面板视图：按天挑，还是按月 / 季度 / 年挑。 */
export type CalendarView = 'day' | 'month' | 'quarter' | 'year'

/** 年视图一页十年。 */
export const CALENDAR_YEARS_PER_PAGE = 10

/** 粗粒度视图里的一格。 */
export interface CalendarPeriodCell {
  /** 这段时间的第一天，ISO 串；选中写的就是它。 */
  value: string
  /** 可见文本（1月 / Q1 / 2026），按 locale 出。 */
  label: string
  /** 落在本面板的跨度内。年视图翻页时两端会带上邻十年的格子，它们是 false。 */
  inView: boolean
}

/** 一个粗粒度面板。 */
export interface CalendarPeriodGrid {
  /** 面板跨度的第一天，ISO 串。 */
  startValue: string
  /** 标题文案（2026年 / 2020-2029）。 */
  headingLabel: string
  cells: CalendarPeriodCell[]
}

/** 一个视图翻一页走多少个月：月与季度按年翻，年按十年翻。 */
export function calendarPageMonths(view: CalendarView): number {
  if (view === 'month' || view === 'quarter')
    return 12
  if (view === 'year')
    return CALENDAR_YEARS_PER_PAGE * 12
  return 1
}

/** 面板跨度的起点：月/季度归到当年 1 月，年归到当个十年的头一年。 */
export function calendarPeriodStart(anchor: CalendarDate, view: CalendarView): CalendarDate {
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
 * 生成月 / 季度 / 年面板。anchor 决定落在哪一页（哪一年、哪个十年）。
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
  const cells: CalendarPeriodCell[] = []

  if (view === 'month' || view === 'quarter') {
    const step = view === 'quarter' ? 3 : 1
    const fmt = new DateFormatter(locale, { month: 'short', timeZone })
    for (let i = 0; i < 12; i += step) {
      const cell = start.add({ months: i })
      cells.push({
        value: cell.toString(),
        // 季度没有现成的 Intl 字段，Q1-Q4 是通行写法，不按 locale 编
        label: view === 'quarter' ? `Q${i / 3 + 1}` : fmt.format(cell.toDate(timeZone)),
        inView: true,
      })
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
    cells.push({
      value: cell.toString(),
      label: String(cell.year),
      inView: i >= 0 && i < CALENDAR_YEARS_PER_PAGE,
    })
  }
  const last = start.add({ years: CALENDAR_YEARS_PER_PAGE - 1 })
  return {
    startValue: start.toString(),
    headingLabel: `${yearFmt.format(start.toDate(timeZone))}-${yearFmt.format(last.toDate(timeZone))}`,
    cells,
  }
}

/**
 * 一天所在那一周的起止（含两端），按 locale 的周首日切。
 * 周视图选中的是整整一周，值取这两天。
 */
export function calendarWeekRange(value: string, locale = CALENDAR_LOCALE): [string, string] {
  const date = parseDate(value)
  return [startOfWeek(date, locale).toString(), endOfWeek(date, locale).toString()]
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
