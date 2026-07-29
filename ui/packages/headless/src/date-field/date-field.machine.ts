import type { Params } from '@xihan-ui/machine'
import type {
  DateFieldSchema,
  DateGranularity,
  DateSegmentRange,
  DateSegments,
  DateSegmentType,
} from './date-field.types'
import { CalendarDate, getLocalTimeZone, parseDateTime, Time, today } from '@internationalized/date'
import { setup } from '@xihan-ui/machine'

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
  month: 'mm',
  day: 'dd',
  hour: 'hh',
  minute: 'mm',
  second: 'ss',
}

/** 各段默认的读屏名字。段是 spinbutton，没有名字读屏只念得出一串数字。 */
export const DATE_SEGMENT_LABEL: Readonly<Record<DateSegmentType, string>> = {
  year: 'year',
  month: 'month',
  day: 'day',
  hour: 'hour',
  minute: 'minute',
  second: 'second',
}

/** 各段最多能敲几位。年四位，其余两位。 */
const SEGMENT_DIGITS: Readonly<Record<DateSegmentType, number>> = {
  year: 4,
  month: 2,
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

/** 全部段位，逐段比对用。 */
const ALL_SEGMENTS: readonly DateSegmentType[] = [...DATE_SEGMENTS, ...TIME_SEGMENTS.second]

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
    const picked = [...new Set(parts.map(p => p.type).filter(isDateSegmentType))]
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
  for (const key of ALL_SEGMENTS) {
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
    const all: Record<DateSegmentType, number> = {
      year: dt.year,
      month: dt.month,
      day: dt.day,
      hour: dt.hour,
      minute: dt.minute,
      second: dt.second,
    }
    const out: Record<string, number> = {}
    for (const key of granularitySegments(granularity)) out[key] = all[key]
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
 */
export function dateSegmentRange(
  type: DateSegmentType,
  segments: DateSegments,
  options: { min?: DateSegments | null, max?: DateSegments | null } = {},
): DateSegmentRange {
  const { min, max } = options
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

/** 某段该显示的文字。正在敲就把原始数字串原样显示（补零会让刚敲的 "2" 变成 "0002"）。 */
export function dateSegmentText(
  type: DateSegmentType,
  value: number | undefined,
  options: { typing?: string | null, placeholder: string },
): string {
  if (options.typing != null)
    return options.typing
  if (value == null)
    return options.placeholder
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

function granularityOf(params: Params<DateFieldSchema>): DateGranularity {
  return params.prop('granularity') ?? DATE_FIELD_GRANULARITY
}

function boundsOf(params: Params<DateFieldSchema>): { min: DateSegments | null, max: DateSegments | null } {
  return { min: parseBoundary(params.prop('min')), max: parseBoundary(params.prop('max')) }
}

function rangeOf(params: Params<DateFieldSchema>, type: DateSegmentType, segments: DateSegments): DateSegmentRange {
  return dateSegmentRange(type, segments, boundsOf(params))
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
  const granularity = granularityOf(params)
  context.set('segments', constrainSegments(next))
  const iso = segmentsToIso(context.get('segments'), granularity) ?? ''
  if (iso !== context.get('value'))
    context.set('value', iso)
  const settled = context.get('value')
  if (iso === settled)
    return
  context.set('segments', parseIsoSegments(settled, granularity))
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
      defaultValue: parseIsoSegments(
        prop('value') === undefined ? prop('defaultValue') : prop('value'),
        prop('granularity') ?? DATE_FIELD_GRANULARITY,
      ),
      isEqual: sameSegments,
    })),
    typing: cell<DateFieldSchema['context']['typing']>(() => ({ defaultValue: null })),
    focusedSegment: cell<DateSegmentType | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  watch: ({ track, context, action }) => {
    // 这条 watch 兜的是宿主侧的写入；自己写进去的那一次段位算出的串与 value 相等，同步自行让路
    track([context.dep('value')], () => action(['syncSegmentsFromValue']))
  },
  on: {
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.CLEAR': { actions: ['clearValue'] },
    'SEGMENT.STEP': { guard: 'canEdit', actions: ['stepSegment'] },
    'SEGMENT.TYPE': { guard: 'canEdit', actions: ['typeSegment'] },
    'SEGMENT.CLEAR': { guard: 'canEdit', actions: ['clearSegment'] },
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
      /**
       * 值变了就把段位对齐过去。
       * 判据是段位现在算出来的串，不是段位空不空：按空判会在清掉日时把年月一并抹掉。
       */
      syncSegmentsFromValue: (params) => {
        const { context } = params
        const value = context.get('value')
        const granularity = granularityOf(params)
        if ((segmentsToIso(context.get('segments'), granularity) ?? '') === value)
          return
        context.set('segments', parseIsoSegments(value, granularity))
        context.set('typing', null)
      },
      setValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.SET')
          return
        params.context.set('typing', null)
        commitSegments(params, parseIsoSegments(e.value, granularityOf(params)))
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
          reference: todaySegments(params.prop('timeZone') ?? getLocalTimeZone()),
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
        const segments = params.context.get('segments')
        if (segments[e.segment] == null)
          return
        commitSegments(params, { ...segments, [e.segment]: undefined })
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
