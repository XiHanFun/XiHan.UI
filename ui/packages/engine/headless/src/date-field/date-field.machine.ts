import type { Params } from '@xihan-ui/machine'
import type {
  DateFieldSchema,
  DateGranularity,
  DateSegmentRange,
  DateSegments,
  DateSegmentSet,
  DateSegmentType,
} from './date-field.types'
import { CalendarDate, getLocalTimeZone, parseDateTime, Time, today } from '@internationalized/date'
import { resetDeclaredValue, setup } from '@xihan-ui/machine'
import { dayPeriodLabel } from '../shared/day-period'
import {
  blockRange,
  blocksReference,
  blocksToIso,
  constrainBlocks,
  isMetaSegment,
  isoToBlocks,
  normalizeSegmentSet,
  pickBlocks,
} from './date-field.blocks'

const { createMachine } = setup<DateFieldSchema>()

/** 不给 locale 时的排法；写死而不跟运行时走，否则同一份代码在不同机器上段序不同。 */
export const DATE_FIELD_LOCALE = 'en-US'

/** 不给 granularity 时只有年月日三段。 */
export const DATE_FIELD_GRANULARITY: DateGranularity = 'day'

/** 年份的天然区间，上界取四位数的顶。 */
export const DATE_FIELD_YEAR_MIN = 1
export const DATE_FIELD_YEAR_MAX = 9999

/** 两位年份的分水岭：不大于它算本世纪，大于它算上世纪。 */
export const DATE_FIELD_YEAR_PIVOT = 68

/** 各段未填时的默认占位串。 */
export const DATE_SEGMENT_PLACEHOLDER: Readonly<Record<DateSegmentType, string>> = {
  year: 'yyyy',
  quarter: 'Qq',
  month: 'mm',
  week: 'ww',
  day: 'dd',
  hour: 'hh',
  minute: 'mm',
  second: 'ss',
  dayPeriod: '--',
}

/** 清空钮的缺省 aria-label。 */
export const DATE_FIELD_CLEAR_LABEL = 'Clear'

/** 各段默认的读屏名字。段是 spinbutton，没有名字读屏只念得出一串数字。 */
export const DATE_SEGMENT_LABEL: Readonly<Record<DateSegmentType, string>> = {
  year: 'year',
  quarter: 'quarter',
  month: 'month',
  week: 'week of year',
  day: 'day',
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  dayPeriod: 'AM/PM',
}

/** 各段最多能敲几位。年四位，其余两位。 */
const SEGMENT_DIGITS: Readonly<Record<DateSegmentType, number>> = {
  year: 4,
  // 季度一位（1-4），上下午不敲数字（由 a/p 或加减切换）
  quarter: 1,
  month: 2,
  week: 2,
  dayPeriod: 0,
  day: 2,
  hour: 2,
  minute: 2,
  second: 2,
}

/** 时间段随精度递增：day 一段不要，second 三段全要。 */
const TIME_SEGMENTS: Readonly<Record<DateGranularity, readonly DateSegmentType[]>> = {
  day: [],
  hour: ['hour'],
  minute: ['hour', 'minute'],
  second: ['hour', 'minute', 'second'],
}

const DATE_SEGMENTS: readonly DateSegmentType[] = ['year', 'month', 'day']

/**
 * 全部九块，逐段比内容用。
 * 少比一块就等于「那一块改了也算没改」——季度改了会被 commitSegments 当成原地不动而丢掉。
 */
const ALL_SEGMENTS: readonly DateSegmentType[] = [
  'year',
  'quarter',
  'month',
  'week',
  'day',
  'hour',
  'minute',
  'second',
  'dayPeriod',
]

/**
 * ISO 串上真有的那几段，比先后只看它们。
 * 季度、周与上下午是派生块，混进来会与只有年月日的 min/max 比错位（边界那边根本没有季度）。
 */
const ISO_SEGMENTS: readonly DateSegmentType[] = [...DATE_SEGMENTS, ...TIME_SEGMENTS.second]

/** Intl 认不出 locale、或它排不出齐整三段时的兜底排法。 */
const DATE_ORDER_FALLBACK: readonly DateSegmentType[] = ['year', 'month', 'day']

/** 探针日期只用来问顺序，具体是哪一天不影响结果。 */
const ORDER_PROBE = new Date(Date.UTC(2026, 6, 28))

/** locale → 年月日排法。Intl 的构造不便宜，而 connect 每帧都要问一次，故缓存。 */
const ORDER_CACHE = new Map<string, readonly DateSegmentType[]>()

function isDateSegmentType(type: string): type is DateSegmentType {
  return type === 'year' || type === 'month' || type === 'day'
}

/**
 * 年月日三段在该 locale 里的先后：zh-CN / ja-JP 年月日，en-US 月日年，de-DE / fr-FR 日月年。
 * 顺序从 Intl 现问，不自带一张表。
 */
export function localeDateOrder(locale: string = DATE_FIELD_LOCALE): readonly DateSegmentType[] {
  const cached = ORDER_CACHE.get(locale)
  if (cached)
    return cached
  let order: readonly DateSegmentType[] = DATE_ORDER_FALLBACK
  try {
    const parts = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(ORDER_PROBE)
    // 去重：某些日历（和历之类）会额外产出 era / relatedYear，只认这三种类型
    const picked = [...new Set(parts.map(p => String(p.type)).filter(isDateSegmentType))] as DateSegmentType[]
    // 排不齐三段就整份作废，退回兜底
    if (picked.length === DATE_SEGMENTS.length)
      order = picked
  }
  catch {
    // 语言标记写坏了时 Intl 会抛，退回兜底
  }
  ORDER_CACHE.set(locale, order)
  return order
}

/** 段序：年月日按 locale 排，时分秒按精度追加在后面。 */
export function dateSegmentOrder(
  locale: string = DATE_FIELD_LOCALE,
  granularity: DateGranularity = DATE_FIELD_GRANULARITY,
): DateSegmentType[] {
  return [...localeDateOrder(locale), ...(TIME_SEGMENTS[granularity] ?? [])]
}

/** 该精度下必须填齐的段（不含顺序）。 */
export function granularitySegments(granularity: DateGranularity = DATE_FIELD_GRANULARITY): DateSegmentType[] {
  return [...DATE_SEGMENTS, ...(TIME_SEGMENTS[granularity] ?? [])]
}

/** 作者给的段集算不算数：归一后还剩东西才算。写 `[]` 与压根没写是一回事。 */
export function hasSegmentSet(set: DateSegmentSet | undefined): boolean {
  return !!set && normalizeSegmentSet(set).length > 0
}

/**
 * 此刻这份控件由哪几段组成，文档序。
 *
 * 给了段集就以它为准（归一后的顺序，不随 locale 变——「2026 Q2」没有别的排法）；
 * 没给则退回 granularity 那条老路，年月日按 locale 排、时刻段按精度追加。
 */
export function resolveSegmentSet(
  set: DateSegmentSet | undefined,
  locale: string = DATE_FIELD_LOCALE,
  granularity: DateGranularity = DATE_FIELD_GRANULARITY,
): DateSegmentType[] {
  return hasSegmentSet(set) ? normalizeSegmentSet(set!) : dateSegmentOrder(locale, granularity)
}

/** 一份控件的段位口径：两条路（段集 / granularity）都从这里分岔。 */
export interface DateSegmentOptions {
  set?: DateSegmentSet
  locale?: string
  granularity?: DateGranularity
}

/** ISO 串 → 逐段的值。段集在场时按块派生，否则走 granularity 那条老路。 */
export function isoToSegments(iso: string | null | undefined, options: DateSegmentOptions = {}): DateSegments {
  const { set, locale = DATE_FIELD_LOCALE, granularity } = options
  return hasSegmentSet(set)
    ? isoToBlocks(iso, set!, locale)
    : parseIsoSegments(iso, granularity)
}

/** 逐段的值 → ISO 串；要求的段缺一个就是 null。同上，两条路各走各的。 */
export function segmentsToValue(segments: DateSegments, options: DateSegmentOptions = {}): string | null {
  const { set, locale = DATE_FIELD_LOCALE, granularity } = options
  return hasSegmentSet(set)
    ? blocksToIso(segments, set!, locale)
    : segmentsToIso(segments, granularity)
}

/** 该段最多敲几位。 */
export function segmentMaxDigits(type: DateSegmentType): number {
  return SEGMENT_DIGITS[type]
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0')
}

/** 该月有多少天；年或月还没填时给 31。 */
function daysInMonth(year: number | undefined, month: number | undefined): number {
  if (year == null || month == null)
    return 31
  const probe = new CalendarDate(year, month, 1)
  return probe.calendar.getDaysInMonth(probe)
}

/** 逐段比。段位每次写入都是新对象，不比内容的话值没变也会通知一遍。 */
export function sameSegments(a: DateSegments, b: DateSegments | undefined): boolean {
  if (!b)
    return false
  return ALL_SEGMENTS.every(key => a[key] === b[key])
}

/**
 * 逐段比先后：负数表示 a 在 b 之前。缺席的段按 0 算，
 * 因此只精确到天的值与带时刻的边界比较时，落在当天的零点上。
 */
export function compareDateSegments(a: DateSegments, b: DateSegments): number {
  for (const key of ISO_SEGMENTS) {
    const diff = (a[key] ?? 0) - (b[key] ?? 0)
    if (diff !== 0)
      return diff
  }
  return 0
}

/**
 * ISO 串 → 逐段的值。认不出来（空串、写坏了）就是"一段都没填"。
 * 只留该精度用得上的段：多留的段会让 sameSegments 把两份等价的值判成不等。
 */
export function parseIsoSegments(
  iso: string | null | undefined,
  granularity: DateGranularity = DATE_FIELD_GRANULARITY,
): DateSegments {
  if (!iso)
    return {}
  try {
    // parseDateTime 同时吃 'YYYY-MM-DD' 与带 T 的串，时间位缺席按 0 补
    const dt = parseDateTime(iso)
    const all: Partial<Record<DateSegmentType, number>> = {
      year: dt.year,
      month: dt.month,
      day: dt.day,
      hour: dt.hour,
      minute: dt.minute,
      second: dt.second,
    }
    const out: Record<string, number> = {}
    // granularity 只会点到 ISO 串上真有的那几段；季度/周/上下午那三块由 isoToBlocks 派生
    for (const key of granularitySegments(granularity)) {
      const value = all[key]
      if (value != null)
        out[key] = value
    }
    return out as DateSegments
  }
  catch {
    return {}
  }
}

/**
 * 逐段的值 → ISO 串；该精度要求的段少一个就是 null。
 * 日期本身交给值对象构造，2 月 31 日这类越界组合由日历自己收敛。
 */
export function segmentsToIso(
  segments: DateSegments,
  granularity: DateGranularity = DATE_FIELD_GRANULARITY,
): string | null {
  const need = granularitySegments(granularity)
  if (need.some(key => segments[key] == null))
    return null
  const date = new CalendarDate(segments.year!, segments.month!, segments.day!)
  const day = date.toString()
  if (granularity === 'day')
    return day
  const time = new Time(segments.hour!, segments.minute ?? 0, segments.second ?? 0)
  if (granularity === 'hour')
    return `${day}T${pad(time.hour, 2)}`
  const hm = `${day}T${pad(time.hour, 2)}:${pad(time.minute, 2)}`
  return granularity === 'minute' ? hm : `${hm}:${pad(time.second, 2)}`
}

/**
 * 把年月日收敛成日历上真实存在的一天。
 *
 * 只在拼 ISO 串时收敛不够：段位里留着 31 会让界面显示 2 月 31 日而值是 2 月 28 日。
 * 收敛交给值对象，这里不自己算每月有多少天。
 */
export function constrainSegments(segments: DateSegments): DateSegments {
  const { year, month, day } = segments
  if (year == null || month == null || day == null)
    return segments
  const date = new CalendarDate(year, month, day)
  if (date.year === year && date.month === month && date.day === day)
    return segments
  return { ...segments, year: date.year, month: date.month, day: date.day }
}

/** 边界串 → 逐段的值；缺席或写坏了就是"没有这个边界"。 */
export function parseBoundary(iso: string | undefined): DateSegments | null {
  if (!iso)
    return null
  const segments = parseIsoSegments(iso, 'second')
  return segments.year == null ? null : segments
}

/**
 * 某一段此刻的取值区间。
 *
 * 年月日三段会被 min/max 收窄，但只在高位全都贴着边界时才收：min 是 2026-07-28 时，
 * 2026 年的月份下界才是 7；月份一旦选到 8，日的下界退回 1。时分秒不收窄，用天然区间。
 *
 * 季度、周与上下午一律用天然区间：它们只定到「那一季/那一周的头」，收窄到边界所在的那一季
 * 也仍会算出一个早于边界的日子，收了反倒给出「这一档能选」的错觉。越界由 outOfRange 标注。
 */
export function dateSegmentRange(
  type: DateSegmentType,
  segments: DateSegments,
  options: { min?: DateSegments | null, max?: DateSegments | null } & DateSegmentOptions = {},
): DateSegmentRange {
  const { min, max } = options
  const block = blockRange(type, segments, {
    set: options.set ?? [],
    locale: options.locale ?? DATE_FIELD_LOCALE,
  })
  if (block)
    return block
  const natural = naturalRange(type, segments)
  if (type === 'hour' || type === 'minute' || type === 'second')
    return natural

  const atMinYear = !!min && segments.year === min.year
  const atMaxYear = !!max && segments.year === max.year
  let lo = natural.min
  let hi = natural.max

  if (type === 'year') {
    if (min?.year != null)
      lo = min.year
    if (max?.year != null)
      hi = max.year
  }
  else if (type === 'month') {
    if (atMinYear && min?.month != null)
      lo = min.month
    if (atMaxYear && max?.month != null)
      hi = max.month
  }
  else {
    if (atMinYear && segments.month === min?.month && min?.day != null)
      lo = min.day
    if (atMaxYear && segments.month === max?.month && max?.day != null)
      hi = max.day
  }
  // 作者把 min 写得比 max 还大时区间会翻过来，回绕的取模会因此除零；退回天然区间
  return lo > hi ? natural : { min: lo, max: hi }
}

/** 不归块管的那几段的天然区间；季度、周与上下午在 blockRange 里，走不到这儿。 */
function naturalRange(type: DateSegmentType, segments: DateSegments): DateSegmentRange {
  switch (type) {
    case 'year':
      return { min: DATE_FIELD_YEAR_MIN, max: DATE_FIELD_YEAR_MAX }
    case 'month':
      return { min: 1, max: 12 }
    case 'day':
      return { min: 1, max: daysInMonth(segments.year, segments.month) }
    case 'hour':
      return { min: 0, max: 23 }
    default:
      return { min: 0, max: 59 }
  }
}

/** 夹进区间。 */
export function clampSegment(value: number, range: DateSegmentRange): number {
  return Math.min(Math.max(value, range.min), range.max)
}

/** 在区间里回绕：12 月再加一是 1 月，1 月再减一是 12 月。 */
export function wrapSegment(value: number, range: DateSegmentRange): number {
  const span = range.max - range.min + 1
  return range.min + (((value - range.min) % span) + span) % span
}

/**
 * 上下键落到某一段上的结果。
 * 空段不从 0 起步，而是落到参照日（今天）的对应位。
 */
export function stepSegment(
  segments: DateSegments,
  type: DateSegmentType,
  delta: number,
  options: { range: DateSegmentRange, reference: DateSegments },
): number {
  const { range, reference } = options
  const current = segments[type]
  if (current == null)
    return clampSegment(reference[type] ?? range.min, range)
  return wrapSegment(current + delta, range)
}

/** 敲一位数字之后的结果。value 缺席表示"这一位还凑不成一个合法值"（如月份敲了个 0）。 */
export interface DateDigitResult {
  /** 累计敲进去的数字串。 */
  digits: string
  /** 这一段此刻该落的值；还不合法时缺席。 */
  value?: number
  /** 这一段敲满了：再敲一位只会溢出，该跳去下一段。 */
  complete: boolean
}

/**
 * 往某段里再敲一位。返回 null 表示这一位无处可去（连单独成段都超上界），值与缓冲都不动。
 *
 * 接上一位会溢出时按重新起一段处理，不丢弃：月份已是 1 再敲 9，落成 9 月。
 */
export function applySegmentDigit(
  digits: string,
  digit: string,
  options: { range: DateSegmentRange, maxDigits: number },
): DateDigitResult | null {
  const { range, maxDigits } = options
  let next = digits + digit
  if (Number(next) > range.max)
    next = digit
  const value = Number(next)
  if (value > range.max)
    return null
  // 位数用满、或再补一位必定溢出，都算敲满：月份敲了 2 就没有第二位可接了
  const complete = next.length >= maxDigits || value * 10 > range.max
  return { digits: next, value: value >= range.min ? value : undefined, complete }
}

/**
 * 两位年份补全：不超过两位的按世纪分水岭展开，26 → 2026、69 → 1969；
 * 三位以上是用户把年份写全了，原样收下（'0026' 就是公元 26 年）。
 */
export function resolveTwoDigitYear(digits: string): number {
  const value = Number(digits)
  if (digits.length > 2)
    return value
  return value <= DATE_FIELD_YEAR_PIVOT ? 2000 + value : 1900 + value
}

/**
 * 某段该显示的文字。正在敲就把原始数字串原样显示（补零会让刚敲的 "2" 变成 "0002"）。
 *
 * 季度带上 Q（占位串 `Qq` 也是两个字符，宽度对得上）；上下午出的是这个语言里的写法；
 * 周只出数字，「周」字与「年 / 月 / 日」一样由作者写在段位旁边。
 */
export function dateSegmentText(
  type: DateSegmentType,
  value: number | undefined,
  options: { typing?: string | null, placeholder: string, locale?: string },
): string {
  if (options.typing != null)
    return type === 'quarter' ? `Q${options.typing}` : options.typing
  if (value == null)
    return options.placeholder
  if (type === 'quarter')
    return `Q${value}`
  if (type === 'dayPeriod')
    return dayPeriodLabel(value >= 1 ? 'pm' : 'am', options.locale)
  return pad(value, SEGMENT_DIGITS[type])
}

/**
 * 对外的 null 与内部的空串互译。
 *
 * 内部一律用空串表示没有值：cell 初值取 `defaultValue ?? value`，null 是 nullish 会被这一步吃掉。
 * 返回 undefined 表示没给这个 prop，受控与否的分界在它上面，必须原样透传。
 */
export function toValueString(iso: string | null | undefined): string | undefined {
  return iso === undefined ? undefined : (iso ?? '')
}

/** 参照日：空段按上下键时的起点。取今天，因此不是纯函数，只在机器里用。 */
export function todaySegments(timeZone: string): DateSegments {
  const now = today(timeZone)
  return { year: now.year, month: now.month, day: now.day, hour: 0, minute: 0, second: 0 }
}

/** 段集 prop 的指纹：归一后的段名串。没给（或写成空）时是空串，两者本就同义。 */
function setKeyOf(set: DateSegmentSet | undefined): string {
  return hasSegmentSet(set) ? normalizeSegmentSet(set!).join(',') : ''
}

function granularityOf(params: Params<DateFieldSchema>): DateGranularity {
  return params.prop('granularity') ?? DATE_FIELD_GRANULARITY
}

function localeOf(params: Params<DateFieldSchema>): string {
  return params.prop('locale') ?? DATE_FIELD_LOCALE
}

/** 这份控件此刻的段位口径。值往返、区间与参照日都从它分岔。 */
function optionsOf(params: Params<DateFieldSchema>): DateSegmentOptions {
  return {
    set: params.prop('segments'),
    locale: localeOf(params),
    granularity: granularityOf(params),
  }
}

/** 此刻在用的那几段，文档序。 */
function setOf(params: Params<DateFieldSchema>): DateSegmentType[] {
  const options = optionsOf(params)
  return resolveSegmentSet(options.set, options.locale, options.granularity)
}

function boundsOf(params: Params<DateFieldSchema>): { min: DateSegments | null, max: DateSegments | null } {
  return { min: parseBoundary(params.prop('min')), max: parseBoundary(params.prop('max')) }
}

function rangeOf(params: Params<DateFieldSchema>, type: DateSegmentType, segments: DateSegments): DateSegmentRange {
  return dateSegmentRange(type, segments, {
    ...boundsOf(params),
    set: setOf(params),
    locale: localeOf(params),
  })
}

/**
 * 段位的唯一写入口：真变了才落，落完把 ISO 串写回 value cell。
 *
 * 受控时 cell 只发回调、不落内部值；写回来与预期不一致即这次改动没被接受，
 * 段位与数字缓冲一并退回去。段位不完整时算不出 ISO 串，留在段位缓冲里继续编辑。
 */
function commitSegments(params: Params<DateFieldSchema>, next: DateSegments): void {
  const { context } = params
  if (sameSegments(next, context.get('segments')))
    return
  const options = optionsOf(params)
  context.set('segments', constrainBlocks(constrainSegments(next), setOf(params), localeOf(params)))
  const iso = segmentsToValue(context.get('segments'), options) ?? ''
  if (iso !== context.get('value'))
    context.set('value', iso)
  const settled = context.get('value')
  if (iso === settled)
    return
  context.set('segments', isoToSegments(settled, options))
  context.set('typing', null)
}

/** 把正在敲的那一段收尾：两位年份在这一刻才补全，缓冲随后清掉。 */
function finalize(params: Params<DateFieldSchema>): void {
  const { context } = params
  const typing = context.get('typing')
  if (!typing)
    return
  context.set('typing', null)
  if (typing.segment !== 'year' || typing.digits === '')
    return
  const segments = context.get('segments')
  const range = rangeOf(params, 'year', segments)
  const year = clampSegment(resolveTwoDigitYear(typing.digits), range)
  if (segments.year !== year)
    commitSegments(params, { ...segments, year })
}

export const dateFieldMachine = createMachine({
  name: 'date-field',
  context: ({ prop, cell }) => ({
    // 值住在 cell 里：受控/非受控的收口点就是它，因此不需要 CONTROLLED.* 影子事件
    value: cell<string>(() => ({
      value: toValueString(prop('value')),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value: value === '' ? null : value }),
    })),
    // 段位不受控：它允许不完整，而受控的 value 只表达得了完整的日期
    segments: cell<DateSegments>(() => ({
      defaultValue: isoToSegments(
        prop('value') === undefined ? prop('defaultValue') : prop('value'),
        { set: prop('segments'), locale: prop('locale'), granularity: prop('granularity') },
      ),
      isEqual: sameSegments,
    })),
    typing: cell<DateFieldSchema['context']['typing']>(() => ({ defaultValue: null })),
    focusedSegment: cell<DateSegmentType | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  watch: ({ track, context, prop, action }) => {
    // 这条 watch 兜的是宿主侧的写入；自己写进去的那一次段位算出的串与 value 相等，同步自行让路
    track([context.dep('value')], () => action(['syncSegmentsFromValue']))
    // 段集换了（date-picker 按视图换段集）也要重派生：值没动，但要哪几块变了。
    // 指纹取归一后的段名串，作者每帧新建一个同内容的数组不该白惊动一次
    track([() => setKeyOf(prop('segments'))], () => action(['syncSegmentsFromSet']))
  },
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.CLEAR': { guard: 'canEdit', actions: ['clearValue'] },
    'SEGMENT.STEP': { guard: 'canEdit', actions: ['stepSegment'] },
    'SEGMENT.TYPE': { guard: 'canEdit', actions: ['typeSegment'] },
    'SEGMENT.CLEAR': { guard: 'canEdit', actions: ['clearSegment'] },
    'SEGMENT.PERIOD': { guard: 'canEdit', actions: ['setDayPeriod'] },
    // 换段先给上一段收尾，两位年份补全挂在这一步
    'SEGMENT.FOCUS': { actions: ['finalizeTyping', 'setFocusedSegment'] },
    'SEGMENT.BLUR': { actions: ['finalizeTyping', 'clearFocusedSegment'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    guards: {
      // 禁用时段位不可聚焦，只读时段位可聚焦但改不动；两条都由这一道挡住绕过 DOM 的调用
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        params.context.reset('segments')
        params.context.reset('typing')
      },

      /**
       * 值变了就把段位对齐过去。
       * 判据是段位现在算出来的串，不是段位空不空：按空判会在清掉日时把年月一并抹掉。
       */
      syncSegmentsFromValue: (params) => {
        const { context } = params
        const value = context.get('value')
        const options = optionsOf(params)
        if ((segmentsToValue(context.get('segments'), options) ?? '') === value)
          return
        context.set('segments', isoToSegments(value, options))
        context.set('typing', null)
      },

      /**
       * 段集换了就重新派生段位。
       *
       * 不能沿用「算出来的串一样就不动」那道判据：串可能恰好没变而块的口径变了
       * （加上上下午之后小时收的是 12 时制的那个数）。已有完整的值就照它重算；
       * 还没凑出值时段位是填了一半的草稿，只摘掉新段集不要的那几块，不整份抹掉。
       */
      syncSegmentsFromSet: (params) => {
        const { context } = params
        const value = context.get('value')
        context.set('segments', value === ''
          ? pickBlocks(context.get('segments'), setOf(params))
          : isoToSegments(value, optionsOf(params)))
        context.set('typing', null)
      },
      setValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.SET')
          return
        params.context.set('typing', null)
        commitSegments(params, isoToSegments(e.value, optionsOf(params)))
      },
      clearValue: (params) => {
        params.context.set('typing', null)
        commitSegments(params, {})
      },
      stepSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.STEP')
          return
        const { context } = params
        // 上下键是整段替换，正在敲的那半截数字就此作废
        context.set('typing', null)
        const segments = context.get('segments')
        const next = stepSegment(segments, e.segment, e.delta, {
          range: rangeOf(params, e.segment, segments),
          // 参照日要先换到块空间：段集要季度/周时，「今天的对应位」是今天落在第几季、第几周
          reference: blocksReference(
            todaySegments(params.prop('timeZone') ?? getLocalTimeZone()),
            setOf(params),
            localeOf(params),
          ),
        })
        commitSegments(params, { ...segments, [e.segment]: next })
      },
      typeSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.TYPE')
          return
        const { context } = params
        const segments = context.get('segments')
        const buffer = context.get('typing')
        const digits = buffer?.segment === e.segment ? buffer.digits : ''
        const result = applySegmentDigit(digits, e.digit, {
          range: rangeOf(params, e.segment, segments),
          maxDigits: segmentMaxDigits(e.segment),
        })
        // 这一位放哪儿都超上界：值不动、缓冲也不动，等于没敲
        if (!result)
          return
        // 敲满即收尾：缓冲留着会让紧接着的补位数字接到上一段的尾巴上
        context.set('typing', result.complete ? null : { segment: e.segment, digits: result.digits })
        if (result.value == null) {
          // 还凑不成合法值（月份敲了个 0）时先把这一段清空
          if (segments[e.segment] != null)
            commitSegments(params, { ...segments, [e.segment]: undefined })
          return
        }
        commitSegments(params, { ...segments, [e.segment]: result.value })
      },
      clearSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.CLEAR')
          return
        params.context.set('typing', null)
        // 上下午没有独立的量，清它清不出「既不是上午也不是下午」这种状态，
        // 清了只会让段位显示占位而值仍是上午。缺席即上午，清它是空操作
        if (isMetaSegment(e.segment))
          return
        const segments = params.context.get('segments')
        if (segments[e.segment] == null)
          return
        commitSegments(params, { ...segments, [e.segment]: undefined })
      },

      /** 直接指定上午/下午。段集里没有这一块时无处落，直接放过。 */
      setDayPeriod: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.PERIOD')
          return
        const { context } = params
        context.set('typing', null)
        if (!setOf(params).includes('dayPeriod'))
          return
        const segments = context.get('segments')
        commitSegments(params, { ...segments, dayPeriod: e.period === 'pm' ? 1 : 0 })
      },
      finalizeTyping: params => finalize(params),
      setFocusedSegment: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'SEGMENT.FOCUS')
          context.set('focusedSegment', e.segment)
      },
      clearFocusedSegment: ({ context }) => context.set('focusedSegment', null),
    },
  },
})
