import type { DateSegments, DateSegmentType } from './date-field.types'
import { CalendarDate, parseDateTime, startOfWeek } from '@internationalized/date'

// 段位当积木用的那一层：段集是一份有序清单，作者要哪几块就写哪几块，
// 不再由一个 granularity 阶梯替他决定。
//
// 值的形态不动——仍是 ISO 日期（时间）串。季度与周不另立一套值形态，
// 而是各自派生出月与日：季度 n 是那一季的头一个月，周 n 是那一周的周首日。
// 这样 min/max 比较、区间两端、表单出口全都原样复用，与面板那边的取舍一致。

/** 一份段集：有序，作者写的顺序就是渲染顺序。 */
export type DateSegmentSet = readonly DateSegmentType[]

/** 季度共四季，每季三个月。 */
export const QUARTERS_IN_YEAR = 4
const MONTHS_IN_QUARTER = 3

/** ISO 8601 一年最多 53 周。 */
export const ISO_WEEKS_MAX = 53

/**
 * 一段的语义分类：
 * - date 决定日期落在哪一天；
 * - time 决定时刻；
 * - meta 自己不带独立的量，只改写别的段（上下午改写小时）。
 */
const KIND: Readonly<Record<DateSegmentType, 'date' | 'time' | 'meta'>> = {
  year: 'date',
  quarter: 'date',
  month: 'date',
  week: 'date',
  day: 'date',
  hour: 'time',
  minute: 'time',
  second: 'time',
  dayPeriod: 'meta',
}

/**
 * 段集里各段的规范顺序：从粗到细，上下午跟在时刻后面。
 * 作者乱序写也照这个排——「日 年 月」读起来不是任何一种日期写法。
 */
const CANONICAL: DateSegmentSet = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'dayPeriod']

/**
 * 归一一份段集：去重、按规范序排、剔掉互斥的搭配。
 *
 * 互斥有两处，都是「同一个量被两种写法同时指定」：
 * - 季度与月：季度已经把月定在那一季的头一个月，再来一个月段就有两个答案；
 * - 周与日：周已经把日定在周首日，同理。
 * 两边都写时留细的那个（月胜季度、日胜周）——细的表达力更强，粗的那个本就能由它推出来。
 */
export function normalizeSegmentSet(set: DateSegmentSet): DateSegmentType[] {
  const has = new Set(set)
  if (has.has('month'))
    has.delete('quarter')
  if (has.has('day'))
    has.delete('week')
  return CANONICAL.filter(type => has.has(type))
}

/** 这一段是不是只改写别的段、自己不落值。 */
export function isMetaSegment(type: DateSegmentType): boolean {
  return KIND[type] === 'meta'
}

/** 段集里带时刻段吗——带就说明值要输出到 T 之后。 */
export function hasTimeSegment(set: DateSegmentSet): boolean {
  return set.some(type => KIND[type] === 'time')
}

/** 季度 → 那一季的头一个月（1 / 4 / 7 / 10）。 */
export function quarterToMonth(quarter: number): number {
  return (quarter - 1) * MONTHS_IN_QUARTER + 1
}

/** 月 → 它落在第几季。 */
export function monthToQuarter(month: number): number {
  return Math.floor((month - 1) / MONTHS_IN_QUARTER) + 1
}

/**
 * ISO 周序号 → 那一周的周首日。
 *
 * 锚点取「1 月 4 日」：ISO 规定第 1 周必定含 1 月 4 日，于是它所在那一周的周首日
 * 就是第 1 周的起点，往后每周加七天。locale 决定周首日是周一还是周日。
 */
export function isoWeekStart(year: number, week: number, locale: string): CalendarDate {
  const firstWeek = startOfWeek(new CalendarDate(year, 1, 4), locale)
  return firstWeek.add({ weeks: week - 1 })
}

/** 某一天落在 ISO 的第几周。与周首日的换算互为逆运算。 */
export function isoWeekOf(date: CalendarDate, locale: string): number {
  // 归到本周周首日再比，免得同一周里不同的日子算出不同的周号
  const start = startOfWeek(date, locale)
  const firstWeek = startOfWeek(new CalendarDate(date.year, 1, 4), locale)
  const diff = Math.round(
    (start.toDate('UTC').getTime() - firstWeek.toDate('UTC').getTime()) / 604800000,
  )
  // 落在上一年末周时 diff 为负，改按上一年的第 1 周起算
  if (diff < 0) {
    const prev = startOfWeek(new CalendarDate(date.year - 1, 1, 4), locale)
    return Math.round((start.toDate('UTC').getTime() - prev.toDate('UTC').getTime()) / 604800000) + 1
  }
  return diff + 1
}

/** 这一段天然能取的区间。日与周的上界要看年月，故收 segments。 */
export function blockRange(type: DateSegmentType, segments: DateSegments): { min: number, max: number } | null {
  if (type === 'quarter')
    return { min: 1, max: QUARTERS_IN_YEAR }
  if (type === 'week')
    return { min: 1, max: isoWeeksInYear(segments.year) }
  if (type === 'dayPeriod')
    return { min: 0, max: 1 }
  // 其余段沿用 date-field 原有的天然区间，这里不重复一份
  return null
}

/** 某一年有 52 周还是 53 周：拿 12 月 28 日算——ISO 规定它必定落在该年最后一周。 */
export function isoWeeksInYear(year: number | undefined): number {
  if (year == null)
    return ISO_WEEKS_MAX
  // 12 月 28 日恒在末周，且这里只需要周数，周首日用 ISO 的周一口径即可
  return isoWeekOf(new CalendarDate(year, 12, 28), 'en-GB')
}

/**
 * 段集要求的段是否都填齐了。上下午不算——它没有独立的量，缺席就是上午。
 */
export function blocksFilled(segments: DateSegments, set: DateSegmentSet): boolean {
  return normalizeSegmentSet(set).every(type => isMetaSegment(type) || segments[type] != null)
}

/**
 * 段集 + 各段的值 → 落在哪一天。
 *
 * 缺的粗段按「那一段的头」补：没有月就按 1 月，没有日就按 1 号。
 * 于是「只有年」得到 1 月 1 日、「年 + 季度」得到那一季的头一天，与面板那边落的值一致。
 */
export function blocksToDate(segments: DateSegments, set: DateSegmentSet, locale: string): CalendarDate | null {
  const normalized = normalizeSegmentSet(set)
  const year = segments.year
  if (year == null)
    return null
  // 周单独走一路：它自己就定死了年月日三者
  if (normalized.includes('week')) {
    const week = segments.week
    return week == null ? null : isoWeekStart(year, week, locale)
  }
  const month = normalized.includes('month')
    ? segments.month
    : normalized.includes('quarter') ? (segments.quarter == null ? null : quarterToMonth(segments.quarter)) : 1
  if (month == null)
    return null
  const day = normalized.includes('day') ? segments.day : 1
  if (day == null)
    return null
  return new CalendarDate(year, month, day)
}

/** 小时按上下午改写：12 AM 是 0 点、12 PM 是 12 点，其余下午加 12。 */
export function applyDayPeriod(hour: number, period: number | undefined): number {
  if (period == null)
    return hour
  const base = ((hour % 12) + 12) % 12
  return period >= 1 ? base + 12 : base
}

/**
 * 段集 + 各段的值 → ISO 串；缺段则给 null。
 *
 * 输出的精细程度只看段集里最细的那个时刻段：没有时刻段就是纯日期串。
 */
export function blocksToIso(segments: DateSegments, set: DateSegmentSet, locale: string): string | null {
  const normalized = normalizeSegmentSet(set)
  if (!blocksFilled(segments, normalized))
    return null
  const date = blocksToDate(segments, normalized, locale)
  if (!date)
    return null
  const day = date.toString()
  if (!hasTimeSegment(normalized))
    return day
  const hour = applyDayPeriod(segments.hour ?? 0, segments.dayPeriod)
  const parts = [pad2(hour)]
  if (normalized.includes('minute') || normalized.includes('second'))
    parts.push(pad2(segments.minute ?? 0))
  if (normalized.includes('second'))
    parts.push(pad2(segments.second ?? 0))
  return `${day}T${parts.join(':')}`
}

/**
 * ISO 串 → 段集里那几段的值。段集要哪块就派生哪块：
 * 要季度就从月推、要周就从日期推、要上下午就从小时推。
 */
export function isoToBlocks(iso: string | null | undefined, set: DateSegmentSet, locale: string): DateSegments {
  if (!iso)
    return {}
  let dt
  try {
    dt = parseDateTime(iso)
  }
  catch {
    return {}
  }
  const date = new CalendarDate(dt.year, dt.month, dt.day)
  const out: Record<string, number> = {}
  for (const type of normalizeSegmentSet(set)) {
    switch (type) {
      case 'year':
        out.year = dt.year
        break
      case 'quarter':
        out.quarter = monthToQuarter(dt.month)
        break
      case 'month':
        out.month = dt.month
        break
      case 'week':
        out.week = isoWeekOf(date, locale)
        break
      case 'day':
        out.day = dt.day
        break
      case 'hour':
        out.hour = dt.hour
        break
      case 'minute':
        out.minute = dt.minute
        break
      case 'second':
        out.second = dt.second
        break
      case 'dayPeriod':
        out.dayPeriod = dt.hour >= 12 ? 1 : 0
        break
    }
  }
  return out as DateSegments
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}
