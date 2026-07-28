import type { Params } from '@xihan-ui/machine'
import type {
  TimeDayPeriod,
  TimeDraft,
  TimeFieldSchema,
  TimeGranularity,
  TimeHourCycle,
  TimeSegmentType,
} from './time-field.types'
import { parseTime, Time } from '@internationalized/date'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<TimeFieldSchema>()

/** 未显式给 hourCycle、也没有 locale 可推断时的小时制。 */
export const TIME_FIELD_HOUR_CYCLE: TimeHourCycle = 24
/** 未显式给 granularity 时的精度：时分。 */
export const TIME_FIELD_GRANULARITY: TimeGranularity = 'minute'
/** 空段的占位字符。 */
export const TIME_FIELD_PLACEHOLDER = '-'
/** 每段的显示宽度：两位数字，上午/下午同宽。 */
const SEGMENT_WIDTH = 2

/** 一段都没填的缓冲。每次取都新建一份：这东西会被写进 context，共享同一个对象会串味。 */
export function emptyTimeDraft(): TimeDraft {
  return { hour: null, minute: null, second: null, dayPeriod: null }
}

function pad2(n: number): string {
  return String(n).padStart(SEGMENT_WIDTH, '0')
}

/** 数字段（上午/下午不在其列：它不是一个独立的数，由小时决定）。 */
type NumericSegment = 'hour' | 'minute' | 'second'

/**
 * 换掉缓冲里的一个数字段。逐个字段写而不是用计算键：
 * 计算键的键类型是联合，TypeScript 会把结果推成索引签名，落不回 TimeDraft。
 */
function withField(draft: TimeDraft, field: NumericSegment, value: number | null): TimeDraft {
  if (field === 'hour')
    return { ...draft, hour: value }
  if (field === 'minute')
    return { ...draft, minute: value }
  return { ...draft, second: value }
}

/**
 * 解析 ISO 时间串。解析不了就是 null（不抛）——值是宿主给的，
 * 一个写坏的串不该让整棵组件树炸掉，界面显示成"还没填"即可。
 */
export function parseTimeValue(value: string | null | undefined): Time | null {
  if (!value)
    return null
  try {
    return parseTime(value)
  }
  catch {
    return null
  }
}

/** 时间对象 → 逐段缓冲。小时一旦有值，上午/下午由它决定，故 dayPeriod 归零。 */
export function draftFromTime(time: Time | null): TimeDraft {
  if (!time)
    return emptyTimeDraft()
  return { hour: time.hour, minute: time.minute, second: time.second, dayPeriod: null }
}

/** 逐段缓冲 → 时间对象；小时为空时没有时间可言。空段按 0 补，只用于算加减的基准。 */
export function timeFromDraft(draft: TimeDraft): Time {
  return new Time(draft.hour ?? 0, draft.minute ?? 0, draft.second ?? 0)
}

/**
 * 逐段缓冲 → ISO 串。任一必填段为空就是空串（"填了一半"不是一个时间）。
 *
 * 串的形状只有两种：精度到秒是 'HH:mm:ss'，其余都是 'HH:mm'。
 * granularity 决定的是"哪几段可编辑、哪几段必填"，不是把串截短——
 * 精度只到时的时候分位并非必填，但宿主给进来的分数原样留着（缺省才补 00），
 * 不能在用户第一次改时段时把它悄悄清零。
 */
export function formatTimeValue(draft: TimeDraft, granularity: TimeGranularity = TIME_FIELD_GRANULARITY): string {
  if (draft.hour == null)
    return ''
  if (granularity !== 'hour' && draft.minute == null)
    return ''
  const hhmm = `${pad2(draft.hour)}:${pad2(draft.minute ?? 0)}`
  if (granularity !== 'second')
    return hhmm
  if (draft.second == null)
    return ''
  return `${hhmm}:${pad2(draft.second)}`
}

/**
 * 此刻该拿哪一份逐段值显示与编辑：value 解析得动就以它为准，否则才用编辑缓冲。
 *
 * 这条规则是受控语义的落点：受控宿主不写回 value，这里读到的还是旧值，
 * 界面因此纹丝不动；缓冲只在"值还凑不成一个时间"的那段时间里说话。
 */
export function resolveTimeDraft(value: string, draft: TimeDraft): TimeDraft {
  const time = parseTimeValue(value)
  return time ? draftFromTime(time) : draft
}

/** 逐段比对。缓冲每次都是新对象，不比内容的话值没变也会让宿主重渲一遍。 */
export function sameTimeDraft(a: TimeDraft, b: TimeDraft | undefined): boolean {
  return !!b && a.hour === b.hour && a.minute === b.minute && a.second === b.second && a.dayPeriod === b.dayPeriod
}

/**
 * 24 → 12 小时制。0 点显示 12 AM、12 点显示 12 PM，其余取 12 的余数。
 * 入参先回绕到 0-23，24 与 -1 这类越界值不会漏出去。
 */
export function to12Hour(hour24: number): { hour: number, period: TimeDayPeriod } {
  const h = ((Math.trunc(hour24) % 24) + 24) % 24
  const period: TimeDayPeriod = h < 12 ? 'am' : 'pm'
  const hour = h % 12 === 0 ? 12 : h % 12
  return { hour, period }
}

/** 12 → 24 小时制。12 AM 是 0 点、12 PM 是 12 点，其余下午加 12。 */
export function to24Hour(hour12: number, period: TimeDayPeriod): number {
  const base = ((Math.trunc(hour12) % 12) + 12) % 12
  return period === 'pm' ? base + 12 : base
}

/** 此刻参与显示的段，文档序。时段恒在，上午/下午只在 12 小时制下出现。 */
export function timeSegments(
  granularity: TimeGranularity = TIME_FIELD_GRANULARITY,
  hourCycle: TimeHourCycle = TIME_FIELD_HOUR_CYCLE,
): TimeSegmentType[] {
  const out: TimeSegmentType[] = ['hour']
  if (granularity !== 'hour')
    out.push('minute')
  if (granularity === 'second')
    out.push('second')
  if (hourCycle === 12)
    out.push('dayPeriod')
  return out
}

/** 段上可写的取值区间（显示域，不是落存域）：12 小时制的时段是 1-12，24 小时制是 0-23。 */
export function segmentRange(
  segment: TimeSegmentType,
  hourCycle: TimeHourCycle = TIME_FIELD_HOUR_CYCLE,
): { min: number, max: number } {
  if (segment === 'hour')
    return hourCycle === 12 ? { min: 1, max: 12 } : { min: 0, max: 23 }
  if (segment === 'dayPeriod')
    return { min: 0, max: 1 }
  return { min: 0, max: 59 }
}

/** 段上显示的那个数；空段是 null。上午记 0、下午记 1（读屏的 aria-valuenow 要一个数）。 */
export function segmentNumber(
  draft: TimeDraft,
  segment: TimeSegmentType,
  hourCycle: TimeHourCycle = TIME_FIELD_HOUR_CYCLE,
): number | null {
  switch (segment) {
    case 'hour':
      if (draft.hour == null)
        return null
      return hourCycle === 12 ? to12Hour(draft.hour).hour : draft.hour
    case 'minute':
      return draft.minute
    case 'second':
      return draft.second
    default: {
      // 小时填上了就由它定上下午，没填才看缓冲里记着的那次按键
      const period = draft.hour != null ? to12Hour(draft.hour).period : draft.dayPeriod
      return period == null ? null : (period === 'pm' ? 1 : 0)
    }
  }
}

/** 指定上午/下午。小时已填时换的是小时本身（上下午不是独立存量），未填时先记着。 */
export function setTimeDayPeriod(draft: TimeDraft, period: TimeDayPeriod): TimeDraft {
  if (draft.hour == null)
    return { ...draft, dayPeriod: period }
  return { ...draft, hour: to24Hour(to12Hour(draft.hour).hour, period), dayPeriod: period }
}

/**
 * 往某一段写一个"段上显示的数"。12 小时制下时段收的是 1-12，
 * 换算回 0-23 时的上下午取当前值；当前值为空就用缓冲里记着的那次按键，再没有按上午。
 */
export function setTimeSegment(
  draft: TimeDraft,
  segment: TimeSegmentType,
  display: number,
  hourCycle: TimeHourCycle = TIME_FIELD_HOUR_CYCLE,
): TimeDraft {
  if (segment === 'dayPeriod')
    return setTimeDayPeriod(draft, display >= 1 ? 'pm' : 'am')
  const { min, max } = segmentRange(segment, hourCycle)
  const clamped = Math.min(Math.max(Math.trunc(display), min), max)
  if (segment === 'hour') {
    const period = draft.hour != null ? to12Hour(draft.hour).period : (draft.dayPeriod ?? 'am')
    return withField(draft, 'hour', hourCycle === 12 ? to24Hour(clamped, period) : clamped)
  }
  return withField(draft, segment, clamped)
}

/**
 * 清掉某一段。
 *
 * 清时段时把它当时的上午/下午留进缓冲：12 小时制下上下午段还杵在那儿，
 * 一并清掉会让它突然变成占位符，看起来像是两段一起没了。
 * 反过来，小时还在的时候单清上下午没有意义（它是小时的一部分），此时原样返回。
 */
export function clearTimeSegment(draft: TimeDraft, segment: TimeSegmentType): TimeDraft {
  if (segment === 'dayPeriod')
    return draft.hour == null ? { ...draft, dayPeriod: null } : draft
  if (segment === 'hour')
    return { ...draft, hour: null, dayPeriod: draft.hour == null ? draft.dayPeriod : to12Hour(draft.hour).period }
  return withField(draft, segment, null)
}

/**
 * 上下键：把某一段加减一格，到头回绕。
 *
 * 空段没有"当前值"可加减，上键落到下界、下键落到上界。
 * 有值时回绕交给日期库算（23 加一格回 0、0 减一格回 23）；
 * 12 小时制的时段按库的约定不跨上下午——上午 11 点加一格是上午 12 点（即 0 点），不会跳成下午。
 */
export function cycleTimeSegment(
  draft: TimeDraft,
  segment: TimeSegmentType,
  delta: 1 | -1,
  hourCycle: TimeHourCycle = TIME_FIELD_HOUR_CYCLE,
): TimeDraft {
  const current = segmentNumber(draft, segment, hourCycle)
  if (segment === 'dayPeriod') {
    if (current == null)
      return setTimeDayPeriod(draft, delta > 0 ? 'am' : 'pm')
    // 只有两个取值，加也好减也好都是翻到另一面
    return setTimeDayPeriod(draft, current === 1 ? 'am' : 'pm')
  }
  const range = segmentRange(segment, hourCycle)
  if (current == null)
    return setTimeSegment(draft, segment, delta > 0 ? range.min : range.max, hourCycle)
  const base = timeFromDraft(draft)
  const next = segment === 'hour'
    ? base.cycle('hour', delta, { hourCycle })
    : base.cycle(segment, delta)
  return withField(draft, segment, next[segment])
}

/**
 * 数字直输：把一位数字并进当前段的输入缓冲。
 *
 * - 拼上去越界就另起一段（时段先敲 2 再敲 5，得到的是 5，不是填不进去的 25）；
 * - 缓冲够宽、或者再吃一位必定越界，这一段就算填完了（done），焦点该往下一段走；
 * - 拼出来的数还不到下界时先只记着不落值（12 小时制时段敲 0，等第二位凑成 09）。
 */
export function appendSegmentDigit(
  buffer: string,
  digit: string,
  range: { min: number, max: number },
): { value: number | null, buffer: string, done: boolean } {
  let next = buffer + digit
  let num = Number(next)
  if (num > range.max) {
    next = digit
    num = Number(digit)
  }
  const done = next.length >= String(range.max).length || num * 10 > range.max
  const rest = done ? '' : next
  return { value: num < range.min ? null : num, buffer: rest, done }
}

/**
 * 实际生效的小时制。prop 说了算；没说就问 locale；locale 也没有就用 24。
 * Intl 在某些运行时里可能拿不到这个 locale 的数据，取不到就退回默认值，不抛。
 */
export function resolveHourCycle(hourCycle?: TimeHourCycle, locale?: string): TimeHourCycle {
  if (hourCycle === 12 || hourCycle === 24)
    return hourCycle
  if (!locale)
    return TIME_FIELD_HOUR_CYCLE
  try {
    const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle
    return resolved === 'h11' || resolved === 'h12' ? 12 : 24
  }
  catch {
    return TIME_FIELD_HOUR_CYCLE
  }
}

/**
 * 上午/下午在这个语言里怎么写。没给 locale 就用 AM/PM——
 * 此处刻意不落到运行环境的默认 locale：那会让同一份代码在不同机器上产出不同的 DOM。
 */
export function dayPeriodLabel(period: TimeDayPeriod, locale?: string): string {
  const fallback = period === 'am' ? 'AM' : 'PM'
  if (!locale)
    return fallback
  try {
    const date = new Date(Date.UTC(2020, 0, 1, period === 'am' ? 6 : 18))
    const parts = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true, timeZone: 'UTC' }).formatToParts(date)
    return parts.find(p => p.type === 'dayPeriod')?.value ?? fallback
  }
  catch {
    return fallback
  }
}

export interface SegmentTextOptions {
  hourCycle?: TimeHourCycle
  locale?: string
  placeholder?: string
}

/** 某一段该显示的文字。空段是占位字符按段宽重复；数字段一律补零，各段等宽才不会左右跳。 */
export function timeSegmentText(draft: TimeDraft, segment: TimeSegmentType, options: SegmentTextOptions = {}): string {
  const { hourCycle = TIME_FIELD_HOUR_CYCLE, locale, placeholder } = options
  const num = segmentNumber(draft, segment, hourCycle)
  if (num == null) {
    // 占位只取首个码点：给了整串也不铺开，段宽是固定的
    const char = [...(placeholder ?? '')][0] ?? TIME_FIELD_PLACEHOLDER
    return char.repeat(SEGMENT_WIDTH)
  }
  if (segment === 'dayPeriod')
    return dayPeriodLabel(num === 1 ? 'pm' : 'am', locale)
  return pad2(num)
}

/** 已填全但落在 min/max 之外。只是标注：越界不改写用户填进去的东西。 */
export function isTimeOutOfRange(value: string, min?: string, max?: string): boolean {
  const time = parseTimeValue(value)
  if (!time)
    return false
  const lo = parseTimeValue(min)
  const hi = parseTimeValue(max)
  return (!!lo && time.compare(lo) < 0) || (!!hi && time.compare(hi) > 0)
}

/** 此刻该编辑哪一份逐段值：与 connect 显示用的是同一条规则，不然改的和看到的会是两份东西。 */
function currentDraft(params: Params<TimeFieldSchema>): TimeDraft {
  return resolveTimeDraft(params.context.get('value'), params.context.get('draft'))
}

function currentHourCycle(params: Params<TimeFieldSchema>): TimeHourCycle {
  return resolveHourCycle(params.prop('hourCycle'), params.prop('locale'))
}

/**
 * 值的唯一写入口：先落缓冲、再落值。
 *
 * 顺序不能反——落值会触发 syncDraft，它拿缓冲与值对账；缓冲要是还没更新，
 * 这一轮刚敲进去的那一段会被当成"外部改了值"而被拨回去。
 */
function commitDraft(params: Params<TimeFieldSchema>, next: TimeDraft): void {
  const granularity = params.prop('granularity') ?? TIME_FIELD_GRANULARITY
  params.context.set('draft', next)
  params.context.set('value', formatTimeValue(next, granularity))
}

/**
 * 值住在 context 的 cell 里，不编码进状态：cell 本身就是受控/非受控的收口点
 * （value prop 给定即受控，读直取 prop，写只发 onValueChange 不落内部值），
 * 因此不需要影子事件与受控守卫。机器只有一个状态，逻辑全在 context + actions。
 */
export const timeFieldMachine = createMachine({
  name: 'time-field',
  context: ({ prop, cell }) => ({
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    draft: cell<TimeDraft>(() => ({
      defaultValue: draftFromTime(parseTimeValue(prop('value') ?? prop('defaultValue'))),
      // 逐段比内容而不是比引用：每次写入都产出新对象，值原样不动也会通知宿主一遍
      isEqual: sameTimeDraft,
    })),
    // 焦点锚点：不受控、不对外通知，服务 roving tabindex 与 data-focus 标记
    focusedSegment: cell<TimeSegmentType | null>(() => ({ defaultValue: null })),
    typeBuffer: cell<string>(() => ({ defaultValue: '' })),
  }),
  initialState: () => 'idle',
  // 只兜宿主侧的写入（受控回写、外部改 value）：内部提交当场就把缓冲一起更新过了
  watch: ({ track, context, action }) => track([context.dep('value')], () => action(['syncDraft'])),
  // 这些事从哪个状态发出都一样（机器本来也只有一个状态），因此挂根级
  on: {
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.CLEAR': { guard: 'canEdit', actions: ['clearValue'] },
    'SEGMENT.STEP': { guard: 'canEdit', actions: ['stepSegment'] },
    'SEGMENT.DIGIT': { guard: 'canEdit', actions: ['typeDigit'] },
    'SEGMENT.CLEAR': { guard: 'canEdit', actions: ['clearSegment'] },
    'SEGMENT.PERIOD': { guard: 'canEdit', actions: ['setPeriod'] },
    'SEGMENT.FOCUS': { actions: ['setFocusedSegment'] },
    'SEGMENT.BLUR': { actions: ['clearFocusedSegment'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    guards: {
      // 只读仍可聚焦、可在段间走，只是改不动值；禁用连键都不该到这儿
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      setValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.SET')
          return
        // 走一遍解析再回填：写坏的串等同于清空，写多余精度的串按 granularity 收窄
        commitDraft(params, draftFromTime(parseTimeValue(e.value)))
      },
      clearValue: (params) => {
        commitDraft(params, emptyTimeDraft())
        params.context.set('typeBuffer', '')
      },
      stepSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.STEP')
          return
        // 加减是另一种输入方式，之前敲了一半的数字不再作数
        params.context.set('typeBuffer', '')
        commitDraft(params, cycleTimeSegment(currentDraft(params), e.segment, e.delta, currentHourCycle(params)))
      },
      typeDigit: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.DIGIT')
          return
        const hourCycle = currentHourCycle(params)
        const result = appendSegmentDigit(
          params.context.get('typeBuffer'),
          e.digit,
          segmentRange(e.segment, hourCycle),
        )
        params.context.set('typeBuffer', result.buffer)
        // 还凑不成一个合法值时只记着，不往段上落——落了会让界面在半途闪一个错的数
        if (result.value == null)
          return
        commitDraft(params, setTimeSegment(currentDraft(params), e.segment, result.value, hourCycle))
      },
      clearSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.CLEAR')
          return
        params.context.set('typeBuffer', '')
        commitDraft(params, clearTimeSegment(currentDraft(params), e.segment))
      },
      setPeriod: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.PERIOD')
          return
        params.context.set('typeBuffer', '')
        commitDraft(params, setTimeDayPeriod(currentDraft(params), e.period))
      },
      setFocusedSegment: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'SEGMENT.FOCUS')
          return
        // 换段就重开一轮数字输入：上一段敲了一半的数不该续到这一段上
        if (context.get('focusedSegment') !== e.segment)
          context.set('typeBuffer', '')
        context.set('focusedSegment', e.segment)
      },
      clearFocusedSegment: ({ context }) => {
        context.set('focusedSegment', null)
        context.set('typeBuffer', '')
      },
      /**
       * 把缓冲拨回权威值。
       * 缓冲算出来的串与当前值一致时直接返回：那说明这一轮变化正是内部提交引起的，
       * 再拨一次会把"填了一半"的那些段（值此时是空串）当成外部清空而抹掉。
       */
      syncDraft: (params) => {
        const value = params.context.get('value')
        const granularity = params.prop('granularity') ?? TIME_FIELD_GRANULARITY
        if (formatTimeValue(params.context.get('draft'), granularity) === value)
          return
        params.context.set('draft', draftFromTime(parseTimeValue(value)))
      },
    },
  },
})
