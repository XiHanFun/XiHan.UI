import type { Direction } from '@xihan-ui/core'

// 热力图的纯数学与纯格式化：把一段日期区间摊成「周列 × 星期行」的网格，把计数分成档位，
// 再把方向键翻成落点。不碰 DOM、不认识状态机，也不引日期库——日期一律是 ISO 的 YYYY-MM-DD 串。

/** 一天的毫秒数。日期加减一律以 UTC 计，避开夏令时那两天的 23/25 小时。 */
const DAY_MS = 86_400_000

/** 只认这一种日期写法，多一个字符都判非法。 */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** 1970-01-04 是星期日：按它加天数就能拿到任意星期几的参照日。 */
const WEEK_EPOCH_SUNDAY = Date.UTC(1970, 0, 4)

/** 一周恒七天：网格的行数。 */
export const HEATMAP_WEEK_LENGTH = 7

/** 缺省档数：0 档表示当天没有数据，其余四档按最大值均分。 */
export const HEATMAP_LEVELS = 5

/**
 * 这些纯函数没拿到 locale 时用的兜底，决定月份名与星期名怎么写。
 * 连接层不走这里：它先按宿主语言解析，解析不出才落到同一个值。
 */
export const HEATMAP_LOCALE = 'en-US'

/** 缺省周首日，1 = 星期一（网格的第一行）。 */
export const HEATMAP_FIRST_DAY_OF_WEEK = 1

/**
 * 色阶对照条两端的缺省文字。它是写进界面的可见文本，与其余内建文案同一口径写英文，
 * 换语言经 translations 的 legendLow / legendHigh。
 */
export const HEATMAP_LEGEND_TEXT: { low: string, high: string } = { low: 'Less', high: 'More' }

/** 三种形态：连续周列的日历、按自然月分块的月历、行列由作者给的矩阵。 */
export type HeatmapVariant = 'calendar' | 'month' | 'matrix'

/** 一天的数据。 */
export interface HeatmapDatum {
  /** ISO 日期串 YYYY-MM-DD。 */
  date: string
  /** 当天的计数；负数与非数字按 0 计。 */
  count: number
}

/** 矩阵形态的一格数据，按行列定位而不按日期。 */
export interface HeatmapMatrixDatum {
  /** 行身份，与 rows 里的取值对应。 */
  row: string
  /** 列身份，与 columns 里的取值对应。 */
  column: string
  /** 该格的值；负数与非数字按 0 计。 */
  value: number
}

/** 两种数据形状之一，按有没有 date 分辨。 */
export type HeatmapValue = HeatmapDatum | HeatmapMatrixDatum

/** 作者给的一条轴项：只写身份，或身份与显示文本分开写。 */
export type HeatmapAxisInput = string | { value: string, label?: string }

/** 归一化后的一条轴项。 */
export interface HeatmapAxisMeta {
  value: string
  label: string
  /** 在这条轴上排第几，0 起。 */
  index: number
}

export interface HeatmapGridOptions {
  /** 形态；缺省 calendar。 */
  variant?: HeatmapVariant
  /** 区间起点（含）。 */
  startDate?: string
  /** 区间终点（含）。 */
  endDate?: string
  /** 数据；同一格出现多次即累加。 */
  value?: readonly HeatmapValue[]
  /** 矩阵的行，顺序即渲染顺序。 */
  rows?: readonly HeatmapAxisInput[]
  /** 矩阵的列，顺序即渲染顺序。 */
  columns?: readonly HeatmapAxisInput[]
  /** 档数，缺省 5；给了 thresholds 则档数由它定。 */
  levels?: number
  /** 各档的下界，升序；给了它 levels 不再起作用。 */
  thresholds?: readonly number[]
  /** 周首日，0 = 星期日；缺省 1。 */
  firstDayOfWeek?: number
  /** 月份名与星期名的书写 locale。 */
  locale?: string
}

/** 是不是按日期写的那一种数据。 */
function isDateDatum(item: HeatmapValue): item is HeatmapDatum {
  return typeof (item as HeatmapDatum).date === 'string'
}

/** 网格里的一格，一格就是一天。 */
export interface HeatmapCellMeta {
  date: string
  count: number
  /** 0 到 levels-1；0 表示当天没有数据。 */
  level: number
  /** 第几列，0 起；一列是一周。 */
  weekIndex: number
  /** 第几行，0 起；行序相对周首日。 */
  weekDay: number
}

/** 一个星期几占的那一行。 */
export interface HeatmapRowMeta {
  weekDay: number
  /** 行首空出的列数：区间起点不在周首日时，排在它前面的几行要往后错一列。 */
  offset: number
  /** 该行的格子，按周次升序。 */
  cells: HeatmapCellMeta[]
}

/** 一个月在列方向上占的那一段。 */
export interface HeatmapMonthMeta {
  /** 月份身份，YYYY-MM。 */
  value: string
  /** 可见文本。 */
  label: string
  /** 起始列。 */
  weekIndex: number
  /** 占几列。 */
  weeks: number
}

/** 一行的星期名。 */
export interface HeatmapWeekDayMeta {
  /** 行序 0-6，相对周首日。 */
  weekDay: number
  /** 窄标签，给眼睛看。 */
  label: string
  /** 全称。 */
  long: string
}

/** 一格的计数与档位，附带当时的档数（算色阶位置要用）。 */
export interface HeatmapCellStats {
  count: number
  level: number
  levels: number
}

/** 档位标尺。 */
export interface HeatmapScale {
  levels: number
  thresholds: number[]
  /** 区间内的最大计数。 */
  max: number
  /** 区间内的计数总和。 */
  total: number
}

/** 一整张网格。 */
export interface HeatmapGrid {
  /** 区间起点；日期非法或区间倒置时是空串。 */
  startDate: string
  endDate: string
  /** 列数（周数）。 */
  weekCount: number
  firstDayOfWeek: number
  levels: number
  thresholds: number[]
  max: number
  total: number
  /**
   * 值为 0 的格子数：没有数据的日子与写了 0 的日子都算。
   * 格子总数从 `cells.size` 读，两个数一比就是空白占比。
   * 数的只是 0，不是色阶的第 0 档——给了 `thresholds` 时第 0 档还会收进
   * 低于首个下界的那些非零值，两个数不相等。
   */
  emptyCount: number
  /** 七行，行序相对周首日；每行的格子可能为空（区间不足一周时）。 */
  rows: HeatmapRowMeta[]
  months: HeatmapMonthMeta[]
  weekDays: HeatmapWeekDayMeta[]
  /** 日期 → 格子，按日期取格用它。 */
  cells: Map<string, HeatmapCellMeta>
  /** 文档序的头一格与末一格；一格都没有时为 null。 */
  firstDate: string | null
  lastDate: string | null
}

/** ISO 串 → UTC 时间戳；写法不对或日期不存在（2 月 31 日）一律给 null。 */
export function parseHeatmapDate(iso: string | null | undefined): number | null {
  if (!iso)
    return null
  const matched = ISO_DATE.exec(iso)
  if (!matched)
    return null
  const year = Number(matched[1])
  const month = Number(matched[2])
  const day = Number(matched[3])
  const time = Date.UTC(year, month - 1, day)
  const back = new Date(time)
  // Date.UTC 会把 2 月 31 日顺延到 3 月 3 日，回读一遍才认得出这种不存在的日期
  if (back.getUTCFullYear() !== year || back.getUTCMonth() + 1 !== month || back.getUTCDate() !== day)
    return null
  return time
}

/** UTC 时间戳 → ISO 串。 */
export function formatHeatmapDate(time: number): string {
  const date = new Date(time)
  const year = String(date.getUTCFullYear()).padStart(4, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 日期加减天数；入参非法时给 null。 */
export function addHeatmapDays(iso: string, days: number): string | null {
  const time = parseHeatmapDate(iso)
  return time == null ? null : formatHeatmapDate(time + days * DAY_MS)
}

/** 周首日归一到 0-6，非数字退回缺省。 */
function normalizeFirstDay(input: number | undefined): number {
  if (input == null || !Number.isFinite(input))
    return HEATMAP_FIRST_DAY_OF_WEEK
  return ((Math.floor(input) % HEATMAP_WEEK_LENGTH) + HEATMAP_WEEK_LENGTH) % HEATMAP_WEEK_LENGTH
}

/** 某个时间戳落在第几行（相对周首日）。 */
function weekDayOf(time: number, firstDayOfWeek: number): number {
  const js = new Date(time).getUTCDay()
  return (js - firstDayOfWeek + HEATMAP_WEEK_LENGTH) % HEATMAP_WEEK_LENGTH
}

// Intl 的格式化器建一次要好几毫秒，而方向键每按一下都会重跑一遍连接层，按 locale 记住它们。
const FORMATTERS = new Map<string, Intl.DateTimeFormat | null>()

/** 取（并缓存）一个格式化器；宿主没有 Intl 时给 null，调用方自行退回数字。 */
function dateFormatter(locale: string, tag: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat | null {
  const key = `${locale}|${tag}`
  const hit = FORMATTERS.get(key)
  if (hit !== undefined)
    return hit
  let made: Intl.DateTimeFormat | null = null
  try {
    made = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' })
  }
  catch {
    made = null
  }
  FORMATTERS.set(key, made)
  return made
}

/**
 * 把数据摊成「日期 → 计数」；同一天出现多次即累加，日期串不合法的条目丢掉。
 * 按行列写的那一种数据不属于日期形态，一并跳过。
 */
export function heatmapCountsOf(value: readonly HeatmapValue[] | undefined): Map<string, number> {
  const out = new Map<string, number>()
  for (const item of value ?? []) {
    if (!isDateDatum(item))
      continue
    if (parseHeatmapDate(item.date) == null)
      continue
    const count = Number.isFinite(item.count) ? Math.max(0, item.count) : 0
    out.set(item.date, (out.get(item.date) ?? 0) + count)
  }
  return out
}

/**
 * 按最大值均分出各档的下界，升序，长度 levels-1：计数 ≥ thresholds[i] 即进第 i+1 档。
 * 逐档至少加 1，数据只有一两个不同取值时低档也不会被挤空。
 */
export function buildHeatmapThresholds(max: number, levels: number): number[] {
  const steps = Math.max(1, Math.floor(levels) - 1)
  const peak = Math.max(1, Math.floor(max))
  const out: number[] = []
  for (let i = 0; i < steps; i++) {
    const even = Math.ceil((peak * i) / steps)
    const previous = out[i - 1] ?? 0
    out.push(Math.max(previous + 1, even))
  }
  return out
}

/** 计数落在第几档：没有数据恒是第 0 档，thresholds 每越过一条就进一档。 */
export function heatmapLevelOf(count: number, thresholds: readonly number[]): number {
  if (!(count > 0))
    return 0
  let level = 0
  for (let i = 0; i < thresholds.length; i++) {
    if (count >= thresholds[i]!)
      level = i + 1
  }
  return level
}

/** 档位在色阶上的位置，0-100；皮肤按它把主色兑进空格底色，档数随便改都不必再写选择器。 */
export function heatmapLevelPercent(level: number, levels: number): number {
  const top = Math.max(1, Math.floor(levels) - 1)
  const clamped = Math.min(Math.max(Math.floor(level), 0), top)
  return Math.round((clamped / top) * 100)
}

/**
 * 由一串数值定出档位标尺：给了 thresholds 就以它为准（档数随之定死），否则按最大值均分。
 * 三种形态共用这一处，只是喂进来的数值来路不同。
 */
export function heatmapScaleOfValues(
  options: Pick<HeatmapGridOptions, 'levels' | 'thresholds'>,
  values: Iterable<number>,
): HeatmapScale {
  let max = 0
  let total = 0
  for (const value of values) {
    total += value
    if (value > max)
      max = value
  }
  const declared = options.thresholds
  if (declared && declared.length > 0) {
    const thresholds = [...declared].sort((a, b) => a - b)
    return { levels: thresholds.length + 1, thresholds, max, total }
  }
  // 档数非数字（属性写成 levels="abc" 就是 NaN）时退回缺省：
  // Math.max(2, NaN) 还是 NaN，一路漏下去会让标尺为空、内联样式写成 NaN%
  const declaredLevels = options.levels
  const requested = declaredLevels != null && Number.isFinite(declaredLevels) ? Math.floor(declaredLevels) : HEATMAP_LEVELS
  const levels = Math.max(2, requested)
  return { levels, thresholds: buildHeatmapThresholds(max, levels), max, total }
}

/** 档位标尺：只把落在区间内的那些天喂给标尺，区间外的数据不该把标尺顶高。 */
export function heatmapScaleOf(options: HeatmapGridOptions, counts: Map<string, number>): HeatmapScale {
  const startTime = parseHeatmapDate(options.startDate)
  const endTime = parseHeatmapDate(options.endDate)
  const inRange: number[] = []
  for (const [date, count] of counts) {
    const time = parseHeatmapDate(date)
    if (time == null)
      continue
    if (startTime != null && time < startTime)
      continue
    if (endTime != null && time > endTime)
      continue
    inRange.push(count)
  }
  return heatmapScaleOfValues(options, inRange)
}

/**
 * 单独查一天的计数与档位，不建整张网格：焦点回调只要这两个数。
 * 区间外的日期一律给 0 档 0 计数，与网格里查不到那一格的取值一致。
 */
export function heatmapStatsOf(options: HeatmapGridOptions, date: string): HeatmapCellStats {
  const counts = heatmapCountsOf(options.value)
  const scale = heatmapScaleOf(options, counts)
  const time = parseHeatmapDate(date)
  const startTime = parseHeatmapDate(options.startDate)
  const endTime = parseHeatmapDate(options.endDate)
  const outside = time == null
    || startTime == null
    || endTime == null
    || time < startTime
    || time > endTime
  if (outside)
    return { count: 0, level: 0, levels: scale.levels }
  const count = counts.get(date) ?? 0
  return { count, level: heatmapLevelOf(count, scale.thresholds), levels: scale.levels }
}

/** 七行的星期名，行序相对周首日。 */
export function buildHeatmapWeekDays(firstDayOfWeek?: number, locale: string = HEATMAP_LOCALE): HeatmapWeekDayMeta[] {
  const first = normalizeFirstDay(firstDayOfWeek)
  const narrow = dateFormatter(locale, 'weekday-narrow', { weekday: 'narrow' })
  const long = dateFormatter(locale, 'weekday-long', { weekday: 'long' })
  const out: HeatmapWeekDayMeta[] = []
  for (let weekDay = 0; weekDay < HEATMAP_WEEK_LENGTH; weekDay++) {
    const js = (first + weekDay) % HEATMAP_WEEK_LENGTH
    const date = new Date(WEEK_EPOCH_SUNDAY + js * DAY_MS)
    out.push({
      weekDay,
      label: narrow ? narrow.format(date) : String(js),
      long: long ? long.format(date) : String(js),
    })
  }
  return out
}

/**
 * 生成整张网格。
 *
 * 行是星期几（七行恒在），列是周次。区间起点不在周首日时，排在它前面的那几行没有第 0 列的格子，
 * 行自己带一个 offset 说明要往后错几列——不铺占位格，读屏里就不会多出几个没有日期的空格。
 *
 * 起止日期非法、或终点早于起点时给一张空网格（档位标尺仍按数据算好）。
 */
export function buildHeatmapGrid(options: HeatmapGridOptions = {}): HeatmapGrid {
  const locale = options.locale ?? HEATMAP_LOCALE
  const firstDayOfWeek = normalizeFirstDay(options.firstDayOfWeek)
  const counts = heatmapCountsOf(options.value)
  const scale = heatmapScaleOf(options, counts)
  const weekDays = buildHeatmapWeekDays(firstDayOfWeek, locale)
  const startTime = parseHeatmapDate(options.startDate)
  const endTime = parseHeatmapDate(options.endDate)

  if (startTime == null || endTime == null || endTime < startTime) {
    return {
      startDate: '',
      endDate: '',
      weekCount: 0,
      firstDayOfWeek,
      levels: scale.levels,
      thresholds: scale.thresholds,
      max: scale.max,
      total: scale.total,
      emptyCount: 0,
      rows: [],
      months: [],
      weekDays,
      cells: new Map(),
      firstDate: null,
      lastDate: null,
    }
  }

  const startWeekDay = weekDayOf(startTime, firstDayOfWeek)
  // 第 0 列的列首：起点所在那一周的周首日，它本身可能早于起点
  const gridStart = startTime - startWeekDay * DAY_MS
  const weekCount = Math.ceil((Math.round((endTime - gridStart) / DAY_MS) + 1) / HEATMAP_WEEK_LENGTH)

  const cells = new Map<string, HeatmapCellMeta>()
  const rows: HeatmapRowMeta[] = []
  let emptyCount = 0
  for (let weekDay = 0; weekDay < HEATMAP_WEEK_LENGTH; weekDay++) {
    // 排在起点星期之前的那几行，第 0 列那一天早于起点，整行往后错一列
    const offset = weekDay < startWeekDay ? 1 : 0
    const rowCells: HeatmapCellMeta[] = []
    for (let weekIndex = offset; weekIndex < weekCount; weekIndex++) {
      const time = gridStart + (weekIndex * HEATMAP_WEEK_LENGTH + weekDay) * DAY_MS
      if (time > endTime)
        break
      const date = formatHeatmapDate(time)
      const count = counts.get(date) ?? 0
      const meta: HeatmapCellMeta = { date, count, level: heatmapLevelOf(count, scale.thresholds), weekIndex, weekDay }
      if (count === 0)
        emptyCount += 1
      rowCells.push(meta)
      cells.set(date, meta)
    }
    rows.push({ weekDay, offset, cells: rowCells })
  }

  const months: HeatmapMonthMeta[] = []
  for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
    // 一列归哪个月：取这一列里落在区间内的末一天所在的月，连着同月的列并成一段。
    // 取末一天而不是头一天，一列跨两个月时就归后一个月，月份名因此落在
    // 「这个月头一天所在的那一列」上；取头一天会让 1 号不在周首日的月份整体晚一列
    const columnEnd = Math.min(
      gridStart + (weekIndex * HEATMAP_WEEK_LENGTH + HEATMAP_WEEK_LENGTH - 1) * DAY_MS,
      endTime,
    )
    // 第 0 列改按区间首日所在的月归：只有这一列可能只露出上个月末尾那几天，
    // 跟着末一天走会让整段区间的头一个月一个名字都不出（近 365 天这类起点常落在月末）
    const at = new Date(weekIndex === 0 ? startTime : columnEnd)
    const value = `${String(at.getUTCFullYear()).padStart(4, '0')}-${String(at.getUTCMonth() + 1).padStart(2, '0')}`
    const last = months[months.length - 1]
    if (last && last.value === value) {
      last.weeks += 1
      continue
    }
    const formatter = dateFormatter(locale, 'month-short', { month: 'short' })
    months.push({
      value,
      label: formatter ? formatter.format(at) : String(at.getUTCMonth() + 1),
      weekIndex,
      weeks: 1,
    })
  }

  const filled = rows.filter(row => row.cells.length > 0)
  const lastRow = filled[filled.length - 1]

  return {
    startDate: formatHeatmapDate(startTime),
    endDate: formatHeatmapDate(endTime),
    weekCount,
    firstDayOfWeek,
    levels: scale.levels,
    thresholds: scale.thresholds,
    max: scale.max,
    total: scale.total,
    emptyCount,
    rows,
    months,
    weekDays,
    cells,
    firstDate: filled[0]?.cells[0]?.date ?? null,
    lastDate: lastRow ? (lastRow.cells[lastRow.cells.length - 1]?.date ?? null) : null,
  }
}

/**
 * 方向键与 Home/End 的落点意图，按两条轴命名而不按日历名词命名：
 * inline 是横着走一格，block 是竖着走一格。三种形态的按键映射一样，
 * 一格是「一周」还是「一天」还是「一列」由各自的落点函数解释。
 */
export type HeatmapNavIntent
  = | 'inline.prev'
    | 'inline.next'
    | 'block.prev'
    | 'block.next'
    | 'row.start'
    | 'row.end'
    | 'grid.start'
    | 'grid.end'

/** 只需要读键名与修饰键，形状放宽以便直接传 KeyboardEvent。 */
export interface HeatmapNavKeyEventLike {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

/** 日历形态四个方向键各走一步的天数：列是周（横），行是天（竖）。 */
const CALENDAR_STEP: Record<'inline.prev' | 'inline.next' | 'block.prev' | 'block.next', number> = {
  'inline.prev': -HEATMAP_WEEK_LENGTH,
  'inline.next': HEATMAP_WEEK_LENGTH,
  'block.prev': -1,
  'block.next': 1,
}

/** 月历形态两条轴对调：一行是一周（横着走一天），一列是一个星期几（竖着走一周）。 */
const MONTH_STEP: Record<'inline.prev' | 'inline.next' | 'block.prev' | 'block.next', number> = {
  'inline.prev': -1,
  'inline.next': 1,
  'block.prev': -HEATMAP_WEEK_LENGTH,
  'block.next': HEATMAP_WEEK_LENGTH,
}

/**
 * 按键 → 落点意图；不归网格管的键给 null（此时调用方绝不能 preventDefault）。
 * Ctrl/Meta 只配 Home/End 用，其余组合一律放行给宿主。
 */
export function heatmapNavIntentFromKey(event: HeatmapNavKeyEventLike, dir: Direction = 'ltr'): HeatmapNavIntent | null {
  if (event.altKey === true || event.shiftKey === true)
    return null
  const stepped = event.ctrlKey === true || event.metaKey === true
  if (event.key === 'Home')
    return stepped ? 'grid.start' : 'row.start'
  if (event.key === 'End')
    return stepped ? 'grid.end' : 'row.end'
  if (stepped)
    return null
  if (event.key === 'ArrowUp')
    return 'block.prev'
  if (event.key === 'ArrowDown')
    return 'block.next'
  // 横轴沿 inline 排开，视觉次序随书写方向翻转，左右键的语义跟着翻
  if (event.key === 'ArrowLeft')
    return dir === 'rtl' ? 'inline.next' : 'inline.prev'
  if (event.key === 'ArrowRight')
    return dir === 'rtl' ? 'inline.prev' : 'inline.next'
  return null
}

/** 从某一天走一步的落点；走出区间或起点不在网格里时给 null（焦点原地不动）。 */
export function heatmapNavTarget(grid: HeatmapGrid, from: string, intent: HeatmapNavIntent): string | null {
  if (intent === 'grid.start')
    return grid.firstDate
  if (intent === 'grid.end')
    return grid.lastDate
  const at = grid.cells.get(from)
  if (!at)
    return null
  if (intent === 'row.start' || intent === 'row.end') {
    const cells = grid.rows[at.weekDay]?.cells ?? []
    const target = intent === 'row.start' ? cells[0] : cells[cells.length - 1]
    return target?.date ?? null
  }
  const next = addHeatmapDays(from, CALENDAR_STEP[intent])
  return next != null && grid.cells.has(next) ? next : null
}

// ── 月历形态：按自然月分块，每块是一张真正的月历 ──

/** 月历块里的一行，一行是这个月里的一周。 */
export interface HeatmapMonthWeekMeta {
  /** 所属月份，YYYY-MM。 */
  month: string
  /** 月内第几周，0 起。 */
  week: number
  /** 全网格连续行号，0 起；读屏报的行号按它给。 */
  rowIndex: number
  /** 行首空出的列数：这一周里排在首个格子之前的那几个星期几。 */
  offset: number
  /** 该行的格子，按星期几升序。 */
  cells: HeatmapCellMeta[]
}

/** 一个自然月占的那一块。 */
export interface HeatmapMonthBlockMeta {
  /** 月份身份，YYYY-MM。 */
  value: string
  /** 可见的短标题。 */
  label: string
  /** 长标题，给读屏念。 */
  long: string
  weeks: HeatmapMonthWeekMeta[]
}

/** 一整张月历网格。 */
export interface HeatmapMonthGrid {
  startDate: string
  endDate: string
  firstDayOfWeek: number
  levels: number
  thresholds: number[]
  max: number
  total: number
  /**
   * 值为 0 的格子数；格子总数从 `cells.size` 读，两个数一比就是空白占比。
   * 数的只是 0，不是色阶的第 0 档——给了 `thresholds` 时两个数不相等。
   */
  emptyCount: number
  /** 各个月块，按时间升序。 */
  blocks: HeatmapMonthBlockMeta[]
  /** 全部周行摊平，顺序即 rowIndex。 */
  weeks: HeatmapMonthWeekMeta[]
  weekDays: HeatmapWeekDayMeta[]
  /** 日期 → 格子；weekIndex 是月内周序，weekDay 是列序。 */
  cells: Map<string, HeatmapCellMeta>
  /** 日期 → 它所在的那一周行，Home/End 要用。 */
  rowOf: Map<string, HeatmapMonthWeekMeta>
  firstDate: string | null
  lastDate: string | null
}

/** 某个时间戳所在月份的身份串 YYYY-MM。 */
function monthValueOf(time: number): string {
  const at = new Date(time)
  return `${String(at.getUTCFullYear()).padStart(4, '0')}-${String(at.getUTCMonth() + 1).padStart(2, '0')}`
}

/** 某个时间戳所在月份的下个月一号。 */
function nextMonthStart(time: number): number {
  const at = new Date(time)
  return Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1)
}

/**
 * 生成月历网格。
 *
 * 与日历形态用同一段区间、同一套分档，只是摊法不同：一个自然月一块，块内一行是一周、
 * 一列是一个星期几，1 号落在它真实的星期几上（行首空出的列数写在行的 offset 里）。
 * 区间只覆盖半个月时也只铺那半个月，不补区间外的日子。
 */
export function buildHeatmapMonthGrid(options: HeatmapGridOptions = {}): HeatmapMonthGrid {
  const locale = options.locale ?? HEATMAP_LOCALE
  const firstDayOfWeek = normalizeFirstDay(options.firstDayOfWeek)
  const counts = heatmapCountsOf(options.value)
  const scale = heatmapScaleOf(options, counts)
  const weekDays = buildHeatmapWeekDays(firstDayOfWeek, locale)
  const startTime = parseHeatmapDate(options.startDate)
  const endTime = parseHeatmapDate(options.endDate)

  const base = {
    firstDayOfWeek,
    levels: scale.levels,
    thresholds: scale.thresholds,
    max: scale.max,
    total: scale.total,
    weekDays,
  }

  if (startTime == null || endTime == null || endTime < startTime) {
    return {
      ...base,
      startDate: '',
      endDate: '',
      emptyCount: 0,
      blocks: [],
      weeks: [],
      cells: new Map(),
      rowOf: new Map(),
      firstDate: null,
      lastDate: null,
    }
  }

  const shortMonth = dateFormatter(locale, 'month-short', { month: 'short' })
  const longMonth = dateFormatter(locale, 'month-long', { year: 'numeric', month: 'long' })

  const cells = new Map<string, HeatmapCellMeta>()
  const rowOf = new Map<string, HeatmapMonthWeekMeta>()
  const blocks: HeatmapMonthBlockMeta[] = []
  const weeks: HeatmapMonthWeekMeta[] = []
  let emptyCount = 0

  let cursor = startTime
  while (cursor <= endTime) {
    const value = monthValueOf(cursor)
    const blockEnd = Math.min(nextMonthStart(cursor) - DAY_MS, endTime)
    // 块内的第 0 列：本块首个日子所在那一周的周首日，1 号因此落回它真实的星期几
    const blockGridStart = cursor - weekDayOf(cursor, firstDayOfWeek) * DAY_MS
    const block: HeatmapMonthBlockMeta = {
      value,
      label: shortMonth ? shortMonth.format(new Date(cursor)) : value,
      long: longMonth ? longMonth.format(new Date(cursor)) : value,
      weeks: [],
    }
    for (let time = cursor; time <= blockEnd; time += DAY_MS) {
      const week = Math.floor(Math.round((time - blockGridStart) / DAY_MS) / HEATMAP_WEEK_LENGTH)
      const weekDay = weekDayOf(time, firstDayOfWeek)
      let row = block.weeks[block.weeks.length - 1]
      if (!row || row.week !== week) {
        row = { month: value, week, rowIndex: weeks.length, offset: weekDay, cells: [] }
        block.weeks.push(row)
        weeks.push(row)
      }
      const date = formatHeatmapDate(time)
      const count = counts.get(date) ?? 0
      const meta: HeatmapCellMeta = {
        date,
        count,
        level: heatmapLevelOf(count, scale.thresholds),
        weekIndex: week,
        weekDay,
      }
      if (count === 0)
        emptyCount += 1
      row.cells.push(meta)
      cells.set(date, meta)
      rowOf.set(date, row)
    }
    blocks.push(block)
    cursor = nextMonthStart(cursor)
  }

  return {
    ...base,
    startDate: formatHeatmapDate(startTime),
    endDate: formatHeatmapDate(endTime),
    emptyCount,
    blocks,
    weeks,
    cells,
    rowOf,
    firstDate: formatHeatmapDate(startTime),
    lastDate: formatHeatmapDate(endTime),
  }
}

/**
 * 月历形态的落点：横着走一天、竖着走一周，两头都在整段区间上算，
 * 因此走到月末会自然落进下一块，不会困在一块里。
 */
export function heatmapMonthNavTarget(grid: HeatmapMonthGrid, from: string, intent: HeatmapNavIntent): string | null {
  if (intent === 'grid.start')
    return grid.firstDate
  if (intent === 'grid.end')
    return grid.lastDate
  if (!grid.cells.has(from))
    return null
  if (intent === 'row.start' || intent === 'row.end') {
    const cells = grid.rowOf.get(from)?.cells ?? []
    const target = intent === 'row.start' ? cells[0] : cells[cells.length - 1]
    return target?.date ?? null
  }
  const next = addHeatmapDays(from, MONTH_STEP[intent])
  return next != null && grid.cells.has(next) ? next : null
}

// ── 矩阵形态：行列都由作者给，数据按 (row, column) 定位 ──

/** 矩阵里的一格。 */
export interface HeatmapMatrixCellMeta {
  row: string
  column: string
  count: number
  level: number
  rowIndex: number
  columnIndex: number
}

/** 一整张矩阵。 */
export interface HeatmapMatrixGrid {
  rows: HeatmapAxisMeta[]
  columns: HeatmapAxisMeta[]
  levels: number
  thresholds: number[]
  max: number
  total: number
  /**
   * 值为 0 的格子数；格子总数从 `cells.size` 读，两个数一比就是空白占比。
   * 数的只是 0，不是色阶的第 0 档——给了 `thresholds` 时两个数不相等。
   */
  emptyCount: number
  /** heatmapMatrixKey(row, column) → 格子。 */
  cells: Map<string, HeatmapMatrixCellMeta>
  /** 文档序的头一格与末一格；一格都没有时为 null。 */
  firstCell: HeatmapMatrixCellMeta | null
  lastCell: HeatmapMatrixCellMeta | null
}

/** 单元分隔符：拼行列身份用，作者写得出的标识里不会出现它。 */
const KEY_SEP = '\u001F'

/** 行列两个身份拼成查表用的键。 */
export function heatmapMatrixKey(row: string, column: string): string {
  return `${row}${KEY_SEP}${column}`
}

/** 归一化一条轴：只写身份的补上同名文本，身份为空串或重复的丢掉。 */
export function buildHeatmapAxis(input: readonly HeatmapAxisInput[] | undefined): HeatmapAxisMeta[] {
  const out: HeatmapAxisMeta[] = []
  const seen = new Set<string>()
  for (const item of input ?? []) {
    const value = typeof item === 'string' ? item : item.value
    if (typeof value !== 'string' || value === '' || seen.has(value))
      continue
    seen.add(value)
    const label = typeof item === 'string' ? item : (item.label ?? item.value)
    out.push({ value, label, index: out.length })
  }
  return out
}

/** 把矩阵数据摊成「行列键 → 值」；同一格出现多次即累加。 */
export function heatmapMatrixValuesOf(value: readonly HeatmapValue[] | undefined): Map<string, number> {
  const out = new Map<string, number>()
  for (const item of value ?? []) {
    if (isDateDatum(item))
      continue
    if (typeof item.row !== 'string' || typeof item.column !== 'string')
      continue
    const amount = Number.isFinite(item.value) ? Math.max(0, item.value) : 0
    const key = heatmapMatrixKey(item.row, item.column)
    out.set(key, (out.get(key) ?? 0) + amount)
  }
  return out
}

/**
 * 生成矩阵网格。行列的身份与顺序全由作者给，组件一个都不猜；
 * 轴上没有的行列，数据里写了也不进网格、也不把标尺顶高。
 */
export function buildHeatmapMatrixGrid(options: HeatmapGridOptions = {}): HeatmapMatrixGrid {
  const rows = buildHeatmapAxis(options.rows)
  const columns = buildHeatmapAxis(options.columns)
  const values = heatmapMatrixValuesOf(options.value)

  const inGrid: number[] = []
  for (const row of rows) {
    for (const column of columns)
      inGrid.push(values.get(heatmapMatrixKey(row.value, column.value)) ?? 0)
  }
  const scale = heatmapScaleOfValues(options, inGrid)

  const cells = new Map<string, HeatmapMatrixCellMeta>()
  let firstCell: HeatmapMatrixCellMeta | null = null
  let lastCell: HeatmapMatrixCellMeta | null = null
  let emptyCount = 0
  for (const row of rows) {
    for (const column of columns) {
      const key = heatmapMatrixKey(row.value, column.value)
      const count = values.get(key) ?? 0
      const meta: HeatmapMatrixCellMeta = {
        row: row.value,
        column: column.value,
        count,
        level: heatmapLevelOf(count, scale.thresholds),
        rowIndex: row.index,
        columnIndex: column.index,
      }
      if (count === 0)
        emptyCount += 1
      cells.set(key, meta)
      firstCell ??= meta
      lastCell = meta
    }
  }

  return {
    rows,
    columns,
    levels: scale.levels,
    thresholds: scale.thresholds,
    max: scale.max,
    total: scale.total,
    emptyCount,
    cells,
    firstCell,
    lastCell,
  }
}

/** 矩阵里一格的身份。 */
export interface HeatmapMatrixRef {
  row: string
  column: string
}

/** 矩阵形态的落点：横着走一列、竖着走一行，走到边界给 null（焦点原地不动）。 */
export function heatmapMatrixNavTarget(
  grid: HeatmapMatrixGrid,
  from: HeatmapMatrixRef,
  intent: HeatmapNavIntent,
): HeatmapMatrixRef | null {
  const pick = (cell: HeatmapMatrixCellMeta | null): HeatmapMatrixRef | null =>
    cell ? { row: cell.row, column: cell.column } : null
  if (intent === 'grid.start')
    return pick(grid.firstCell)
  if (intent === 'grid.end')
    return pick(grid.lastCell)
  const at = grid.cells.get(heatmapMatrixKey(from.row, from.column))
  if (!at)
    return null
  if (intent === 'row.start' || intent === 'row.end') {
    const column = intent === 'row.start' ? grid.columns[0] : grid.columns[grid.columns.length - 1]
    return column ? { row: at.row, column: column.value } : null
  }
  const step = intent === 'inline.prev' || intent === 'block.prev' ? -1 : 1
  if (intent === 'inline.prev' || intent === 'inline.next') {
    const column = grid.columns[at.columnIndex + step]
    return column ? { row: at.row, column: column.value } : null
  }
  const row = grid.rows[at.rowIndex + step]
  return row ? { row: row.value, column: at.column } : null
}

// ── 一格的身份与它的全部数据（三种形态共用一处出口）──

/** 定位一格：日期形态给 date，矩阵形态给 row 与 column。 */
export interface HeatmapCellRef {
  date?: string
  row?: string
  column?: string
}

/** 一格的全部数据：身份、原始值、档位，以及档位在色阶上的位置。 */
export interface HeatmapCellDetails {
  /** ISO 日期；矩阵形态下是空串。 */
  date: string
  /** 行身份；日期形态下是空串。 */
  row: string
  /** 列身份；日期形态下是空串。 */
  column: string
  /** 原始值：日期形态是当天计数，矩阵形态是该格的值。 */
  count: number
  /** 0 到 levels-1；0 表示这一格没有数据。 */
  level: number
  /** 档位在色阶上的位置，0-100。 */
  percent: number
}

/** 一格的身份摊成一个串，用来判「还是不是同一格」。 */
export function heatmapCellKey(ref: HeatmapCellRef): string {
  return ref.date != null && ref.date !== ''
    ? ref.date
    : heatmapMatrixKey(ref.row ?? '', ref.column ?? '')
}

/** 两个身份是不是同一格。 */
export function sameHeatmapCell(a: HeatmapCellRef | null | undefined, b: HeatmapCellRef | null | undefined): boolean {
  if (a == null || b == null)
    return a == null && b == null
  return a.date === b.date && a.row === b.row && a.column === b.column
}

/** 单独查矩阵里一格的值与档位，不建整张网格。 */
export function heatmapMatrixStatsOf(options: HeatmapGridOptions, row: string, column: string): HeatmapCellStats {
  const rows = buildHeatmapAxis(options.rows)
  const columns = buildHeatmapAxis(options.columns)
  const values = heatmapMatrixValuesOf(options.value)
  const inGrid: number[] = []
  for (const rowItem of rows) {
    for (const columnItem of columns)
      inGrid.push(values.get(heatmapMatrixKey(rowItem.value, columnItem.value)) ?? 0)
  }
  const scale = heatmapScaleOfValues(options, inGrid)
  const known = rows.some(item => item.value === row) && columns.some(item => item.value === column)
  if (!known)
    return { count: 0, level: 0, levels: scale.levels }
  const count = values.get(heatmapMatrixKey(row, column)) ?? 0
  return { count, level: heatmapLevelOf(count, scale.thresholds), levels: scale.levels }
}

/**
 * 一格的全部数据。三种形态收在这一处：机器与连接层都调它，
 * 悬停与聚焦看到的数字因此不会各算各的。
 */
export function heatmapDetailsOf(options: HeatmapGridOptions, ref: HeatmapCellRef): HeatmapCellDetails {
  if ((options.variant ?? 'calendar') === 'matrix') {
    const row = ref.row ?? ''
    const column = ref.column ?? ''
    const stats = heatmapMatrixStatsOf(options, row, column)
    return {
      date: '',
      row,
      column,
      count: stats.count,
      level: stats.level,
      percent: heatmapLevelPercent(stats.level, stats.levels),
    }
  }
  const date = ref.date ?? ''
  const stats = heatmapStatsOf(options, date)
  return {
    date,
    row: '',
    column: '',
    count: stats.count,
    level: stats.level,
    percent: heatmapLevelPercent(stats.level, stats.levels),
  }
}

// ── 详情条的几何：不引浮层引擎，位置由适配器在事件那一刻量出来回写 ──

/** 一个矩形，只取定位要用的四个数。 */
export interface HeatmapBox {
  left: number
  top: number
  width: number
  height: number
}

/** 详情条落点，相对承载它的那个盒子的内边距盒，按逻辑方向给。 */
export interface HeatmapTipRect {
  inlineStart: number
  blockStart: number
  inlineSize: number
  blockSize: number
  /**
   * 条从格子的哪一缘长出去，取两侧空间大的那一边。
   * 给 'end' 时条从格子的末缘往回长，不再越过滚动容器的末缘。
   */
  inlineAnchor: 'start' | 'end'
}

/**
 * 由承载盒与目标格的盒子算出详情条该落在哪。
 *
 * 起始缘按逻辑方向算：rtl 下从右缘往左量，样式侧因此只写一条 inset-inline-start 就两向通用。
 * 承载盒会横向滚动，绝对定位的偏移相对未滚动的内容算，两向都要把滚动量加回去
 * （rtl 下 scrollLeft 往内容末尾方向走是负值，符号因此相反）。
 *
 * @param host 承载盒的内边距盒
 * @param cell 目标格的盒子
 * @param scrollInline 承载盒的 scrollLeft
 * @param scrollBlock 承载盒的 scrollTop
 * @param rtl 文字方向是否从右往左
 */
export function resolveHeatmapTip(
  host: HeatmapBox,
  cell: HeatmapBox,
  scrollInline: number,
  scrollBlock: number,
  rtl: boolean,
): HeatmapTipRect {
  // 格子此刻在可视区里的起始缘（还没把滚动量加回去的那一半），条往哪一缘长按它定
  const visibleStart = rtl
    ? (host.left + host.width) - (cell.left + cell.width)
    : cell.left - host.left
  // 条比一格宽得多，伸出滚动容器就会被裁掉，还会把横向滚动条撑长。
  // 条的宽这里量不到（渲染前拿不到、收起时是 display:none），改按两侧的空间判：
  // 从格子末缘往回长有 visibleStart + 格宽 那么多地方，从起始缘往后长有 host.width - visibleStart，
  // 挑大的那一侧，条能摆得下的情形一概摆得下。
  // 条比大的那一侧还宽时（容器很窄配很长的文案）仍会裁掉一截，两侧都摆不下是没有解的
  const before = visibleStart + cell.width
  const after = host.width - visibleStart
  return {
    inlineStart: rtl ? visibleStart - scrollInline : visibleStart + scrollInline,
    blockStart: (cell.top - host.top) + scrollBlock,
    inlineSize: cell.width,
    blockSize: cell.height,
    inlineAnchor: before > after ? 'end' : 'start',
  }
}

/** 两次量测是否一样：不给它，每次量测都是新对象，版本号会一直空转自增。 */
export function sameHeatmapTip(a: HeatmapTipRect | null, b: HeatmapTipRect | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.inlineStart === b.inlineStart && a.blockStart === b.blockStart
    && a.inlineSize === b.inlineSize && a.blockSize === b.blockSize
    && a.inlineAnchor === b.inlineAnchor
}

/**
 * 详情条摆在格子的上边还是下边：格子落在网格的下半时摆上边，否则摆下边。
 * 按行序算而不按像素算，两个适配器与无布局环境给出的结论一致。
 */
export function heatmapTipPlacement(rowIndex: number, rowCount: number): 'block-start' | 'block-end' {
  if (rowCount <= 0)
    return 'block-end'
  return rowIndex >= Math.ceil(rowCount / 2) ? 'block-start' : 'block-end'
}
