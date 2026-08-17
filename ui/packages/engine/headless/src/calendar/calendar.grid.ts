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

// —— 粗粒度视图：月 / 季度 / 年 ——
//
// 格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态。
// 这样 min/max 比较、区间逻辑、不可用判定、隐藏输入全都原样复用，
// 显示成「2026-08」还是「2026年8月」是分段输入与作者的事。

/** 面板视图：按天挑，还是按月 / 季度 / 年挑。 */
export type CalendarView = 'day' | 'month' | 'quarter' | 'year'

/** 年视图一页十年。 */
export const CALENDAR_YEARS_PER_PAGE = 10

/**
 * 粗粒度视图每行几格。方向键上下移动要靠它换算。
 * 与 `packages/design/styles/css/calendar.css` 里那几条 grid-template-columns 是同一套档位，
 * 改一处必须改另一处——CSS 引不到 JS，这是唯一一处两头写死的数。
 */
export const CALENDAR_PERIOD_COLUMNS: Readonly<Record<Exclude<CalendarView, 'day'>, number>> = {
  month: 3,
  quarter: 4,
  year: 3,
}

/** 一格跨多少个月：月一格一个月，季度三个月，年十二个月。 */
export function calendarPeriodMonths(view: CalendarView): number {
  if (view === 'quarter')
    return 3
  if (view === 'year')
    return 12
  return 1
}

/** 一页有多少格。 */
function periodCellCount(view: Exclude<CalendarView, 'day'>): number {
  return view === 'year' ? CALENDAR_YEARS_PER_PAGE : 12 / calendarPeriodMonths(view)
}

/**
 * 这一天落在本页第几格，0 起。
 * 月视图按月、季度视图按季、年视图按它在这个十年里的第几年。
 */
export function calendarPeriodIndex(value: string, view: Exclude<CalendarView, 'day'>): number {
  const date = parseDate(value)
  if (view === 'year')
    return date.year - calendarPeriodStart(date, 'year').year
  return Math.floor((date.month - 1) / calendarPeriodMonths(view))
}

/**
 * 粗粒度视图里的方向键落点：一格一格走，不是一天一天走。
 *
 * 左右一格、上下一行（行宽即 CALENDAR_PERIOD_COLUMNS）、Home/End 到本行两头、
 * 翻页键一整页、Shift+翻页键十页——与 « » 那对大步按钮同一个档位。
 * 细的位（日号）一路沿用，钻回日视图时人还落在原来那一天上。
 */
function periodNavTarget(anchor: string, intent: CalendarNavIntent, view: Exclude<CalendarView, 'day'>): string {
  const date = parseDate(anchor)
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
 * 这一天归哪一格：返回那一格的值（那段时间的第一天）。
 *
 * 粗粒度视图里格子的值是「那段时间的第一天」，而聚焦日是具体某一天，两者一般不等。
 * 「哪一格是聚焦的」只能这样比——直接拿聚焦日与格子值比，一页里会一格都对不上，
 * 于是整张网格连一个 Tab 位都不剩。
 */
export function calendarPeriodOf(value: string, view: CalendarView): string {
  const date = view === 'day' ? null : parseCalendarDate(value)
  // 日视图与认不出来的串都原样交回：这条在焦点恢复那一路上跑，不该为脏值抛
  if (!date)
    return value
  if (view === 'year')
    return date.set({ month: 1, day: 1 }).toString()
  const month = Math.floor((date.month - 1) / calendarPeriodMonths(view)) * calendarPeriodMonths(view) + 1
  return date.set({ month, day: 1 }).toString()
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
  return 'day'
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
  if (next === 'day')
    return to.set({ day: from.day }).toString()
  return picked
}

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
