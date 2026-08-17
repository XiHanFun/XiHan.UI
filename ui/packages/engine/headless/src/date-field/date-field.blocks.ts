import type { DateSegments, DateSegmentSet, DateSegmentType } from './date-field.types'
import { CalendarDate, parseDateTime, startOfWeek } from '@internationalized/date'

// 段位当积木用的那一层：段集是一份有序清单，作者要哪几块就写哪几块，
// 不再由一个 granularity 阶梯替他决定。
//
// 值的形态不动——仍是 ISO 日期（时间）串。季度与周不另立一套值形态，
// 而是各自派生出月与日：季度 n 是那一季的头一个月，周 n 是那一周的周首日。
// 这样 min/max 比较、区间两端、表单出口全都原样复用，与面板那边的取舍一致。

/** 季度共四季，每季三个月。 */
export const QUARTERS_IN_YEAR = 4
const MONTHS_IN_QUARTER = 3

/** ISO 8601 一年最多 53 周。 */
export const ISO_WEEKS_MAX = 53

/** 半天十二小时：12 时制的小时段收 1-12。 */
const HOURS_IN_HALF_DAY = 12

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

/** 段集与 locale：新出的几块要靠这两样才算得出区间与文字。 */
export interface BlockOptions {
  set: DateSegmentSet
  locale: string
}

/**
 * 这一段天然能取的区间；不归块管的段给 null，由 date-field 原有的天然区间接手。
 *
 * 周的上界随年变（52 或 53），小时的上界随段集里有没有上下午变（12 时制收 1-12）。
 */
export function blockRange(
  type: DateSegmentType,
  segments: DateSegments,
  options: BlockOptions,
): { min: number, max: number } | null {
  if (type === 'quarter')
    return { min: 1, max: QUARTERS_IN_YEAR }
  if (type === 'week')
    return { min: 1, max: isoWeeksInYear(segments.year, options.locale) }
  if (type === 'dayPeriod')
    return { min: 0, max: 1 }
  // 段集里带上下午时，小时段上写的是 12 时制的那个数
  if (type === 'hour' && normalizeSegmentSet(options.set).includes('dayPeriod'))
    return { min: 1, max: HOURS_IN_HALF_DAY }
  return null
}

/**
 * 某一年有 52 周还是 53 周：拿 12 月 28 日算——ISO 规定它必定落在该年最后一周。
 *
 * 周数随 locale 变，不能用一个写死的周首日：同一个 2026 年，周一起算是 53 周、周日起算是 52 周。
 * 拿错口径算出的上界会让最后一周翻到下一年去。
 */
export function isoWeeksInYear(year: number | undefined, locale: string): number {
  // 年还没填时给上界，免得把可选值先限死
  if (year == null)
    return ISO_WEEKS_MAX
  return isoWeekOf(new CalendarDate(year, 12, 28), locale)
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

/**
 * 12 时制的小时 + 上下午 → 24 时制的小时。12 AM 是 0 点、12 PM 是 12 点，其余下午加 12。
 *
 * 对 24 时制的小时也成立（21 点配下午仍是 21 点），因此重复施加不会漂。
 */
export function applyDayPeriod(hour: number, period: number | undefined): number {
  if (period == null)
    return hour
  const base = ((hour % HOURS_IN_HALF_DAY) + HOURS_IN_HALF_DAY) % HOURS_IN_HALF_DAY
  return period >= 1 ? base + HOURS_IN_HALF_DAY : base
}

/** 上一条的逆：24 时制的小时 → 12 时制的那个数与上下午（上午记 0、下午记 1）。 */
export function splitDayPeriod(hour: number): { hour: number, dayPeriod: number } {
  const h = ((Math.trunc(hour) % 24) + 24) % 24
  return {
    // 0 点与 12 点都显示 12
    hour: h % HOURS_IN_HALF_DAY === 0 ? HOURS_IN_HALF_DAY : h % HOURS_IN_HALF_DAY,
    dayPeriod: h < HOURS_IN_HALF_DAY ? 0 : 1,
  }
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
  // 段集里没有上下午时小时就是 24 时制的，段位上留着的那个 dayPeriod 不作数
  const hour = normalized.includes('dayPeriod')
    ? applyDayPeriod(segments.hour ?? 0, segments.dayPeriod)
    : (segments.hour ?? 0)
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
 *
 * 带上下午时小时落的是 12 时制的那个数，与 blocksToIso 收的是同一个口径；
 * 否则界面会一边显示 21 一边显示「下午」。
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
  const normalized = normalizeSegmentSet(set)
  const half = splitDayPeriod(dt.hour)
  const twelve = normalized.includes('dayPeriod')
  const out: Record<string, number> = {}
  for (const type of normalized) {
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
        out.hour = twelve ? half.hour : dt.hour
        break
      case 'minute':
        out.minute = dt.minute
        break
      case 'second':
        out.second = dt.second
        break
      case 'dayPeriod':
        out.dayPeriod = half.dayPeriod
        break
    }
  }
  return out as DateSegments
}

/**
 * 只留段集要的那几块。
 *
 * 段集换掉时用：还没凑出完整的值，就没法照值重新派生，只能把新段集不认的那几块摘掉，
 * 剩下的（年这种每套段集都要的）留在段位里继续填。
 */
export function pickBlocks(segments: DateSegments, set: DateSegmentSet): DateSegments {
  const out: Record<string, number> = {}
  for (const type of normalizeSegmentSet(set)) {
    const value = segments[type]
    if (value != null)
      out[type] = value
  }
  return out as DateSegments
}

/**
 * 参照日换到块空间：季度、周与 12 时制的小时都从年月日时推出来。
 *
 * 空段上按上下键落到「今天的对应位」，而参照日只有年月日时分秒。段集里没有新块时原样返回，
 * granularity 那条老路因此一步不差。
 */
export function blocksReference(reference: DateSegments, set: DateSegmentSet, locale: string): DateSegments {
  const normalized = normalizeSegmentSet(set)
  const { year, month, day, hour } = reference
  const out: Record<string, number | undefined> = { ...reference }
  let touched = false
  if (normalized.includes('quarter') && month != null) {
    out.quarter = monthToQuarter(month)
    touched = true
  }
  if (normalized.includes('week') && year != null && month != null && day != null) {
    out.week = isoWeekOf(new CalendarDate(year, month, day), locale)
    touched = true
  }
  if (normalized.includes('dayPeriod') && hour != null) {
    const half = splitDayPeriod(hour)
    out.hour = half.hour
    out.dayPeriod = half.dayPeriod
    touched = true
  }
  return touched ? (out as DateSegments) : reference
}

/**
 * 派生块收敛到当年真实存在的范围：周序号夹进 1..该年周数。
 *
 * 只在拼 ISO 串时夹不够——段位里留着 53 会让界面显示第 53 周而值落在下一年的第 1 周。
 * 年月日的收敛不在这里，交给 constrainSegments。
 */
export function constrainBlocks(segments: DateSegments, set: DateSegmentSet, locale: string): DateSegments {
  const { year, week } = segments
  if (week == null || year == null || !normalizeSegmentSet(set).includes('week'))
    return segments
  const max = isoWeeksInYear(year, locale)
  return week <= max ? segments : { ...segments, week: max }
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}
