import type { CalendarDate } from '@internationalized/date'
import {
  DateFormatter,
  endOfWeek,
  getWeeksInMonth,
  parseDate,
  startOfMonth,
  startOfWeek,
} from '@internationalized/date'

// 月视图的纯数学与纯格式化：不碰 DOM、不认识状态机，只把「哪一天 + locale」翻成
// 一张日期矩阵、一排星期几表头、一个方向键落点。日期运算全部委托给
// @internationalized/date 的不可变值对象，这里一行手写的日期加减都没有——
// 闰年、月末、跨年这些边界自己写必错。

/** 默认 locale。周首日（周日还是周一）就是由它决定的。 */
export const CALENDAR_LOCALE = 'zh-CN'
/** 一周恒七天：矩阵的列数。 */
export const CALENDAR_WEEK_LENGTH = 7
/** fixedWeeks 打开后固定渲染的周行数。六行能装下任何公历月份，月份切换时网格高度不跳。 */
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
  /** 全称，给读屏用：只念「一」谁也不知道是星期一还是一号。 */
  long: string
}

export interface CalendarWeekDaysOptions {
  /** 参照日：取它所在那一周来产出七列，因此周首日与网格首列必然对齐。 */
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

/**
 * ISO 串 → 日期值对象；解析不了一律给 null。
 *
 * 值是作者从远端拿来的字符串，不保证是合法 ISO 日期；parseDate 遇到脏值会抛，
 * 在连接层里抛出去就是整棵组件树白屏。判空由调用方就地处理成「这一格不可用」。
 */
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
 * 首行从「展示月首日所在那一周的周首日」起算，因此首尾两行必然带上邻月的日子——
 * 它们照样是可点可聚焦的真日子（点上去就翻到那个月），只是 inMonth 为 false。
 *
 * anchor 必须是合法 ISO 日期串，否则原样抛出解析错误：这个函数是纯计算，
 * 兜底该发生在读 prop 的地方（parseCalendarDate），不该在这儿把脏值悄悄吃掉。
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
        // 逐字段比年月，不用 isSameMonth：那个函数按首参的历法折算，
        // 这里两边本就是同一份公历日期，直接比更省事也更明白
        inMonth: cursor.year === first.year && cursor.month === first.month,
      })
      cursor = cursor.add({ days: 1 })
    }
    weeks.push(row)
  }

  return { year: first.year, month: first.month, monthStart: first.toString(), weeks }
}

/**
 * 生成七列表头。取参照日所在那一周逐日格式化，列序与 buildMonthGrid 的列序天生一致——
 * 换个 locale 周首日从周日挪到周一，两边一起挪，不会错位。
 */
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
 * 按键 → 落点意图。返回 null 表示这个键不归日历管，调用方**不得** preventDefault
 * （网格里的其它键要放行给页面滚动与读屏）。
 *
 * Ctrl/Meta/Alt 组合一律不接：Ctrl+Home 跳文档顶部之类是浏览器与读屏的键，
 * 被网格吞掉就再也按不出来。Shift 是唯一例外——翻页键上它把「一个月」放大成「一年」。
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
 *
 * 跨月不特殊处理：日期值对象加减出来的结果自己就落在下个月，展示月由落点反推，
 * 于是「方向键走到下月 1 号」与「翻页」共用同一条路，不存在两套跨月逻辑。
 * 月/年这两步交给值对象的 add：1 月 31 日加一个月是 2 月 28/29 日，
 * 手写日期数学在这里必然写出 3 月 3 日。
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
