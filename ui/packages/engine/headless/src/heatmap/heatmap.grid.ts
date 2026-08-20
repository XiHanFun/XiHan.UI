import type { Direction } from '@xihan-ui/kernel'

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

/** 缺省 locale，决定月份名与星期名怎么写。 */
export const HEATMAP_LOCALE = 'zh-CN'

/** 缺省周首日，1 = 星期一（网格的第一行）。 */
export const HEATMAP_FIRST_DAY_OF_WEEK = 1

/** 一天的数据。 */
export interface HeatmapDatum {
  /** ISO 日期串 YYYY-MM-DD。 */
  date: string
  /** 当天的计数；负数与非数字按 0 计。 */
  count: number
}

export interface HeatmapGridOptions {
  /** 区间起点（含）。 */
  startDate?: string
  /** 区间终点（含）。 */
  endDate?: string
  /** 数据；同一天出现多次即累加。 */
  value?: readonly HeatmapDatum[]
  /** 档数，缺省 5；给了 thresholds 则档数由它定。 */
  levels?: number
  /** 各档的下界，升序；给了它 levels 不再起作用。 */
  thresholds?: readonly number[]
  /** 周首日，0 = 星期日；缺省 1。 */
  firstDayOfWeek?: number
  /** 月份名与星期名的书写 locale。 */
  locale?: string
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

/** 一天的计数与档位。 */
export interface HeatmapCellStats {
  count: number
  level: number
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

/** 把数据摊成「日期 → 计数」；同一天出现多次即累加，日期串不合法的条目丢掉。 */
export function heatmapCountsOf(value: readonly HeatmapDatum[] | undefined): Map<string, number> {
  const out = new Map<string, number>()
  for (const item of value ?? []) {
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

/** 档位标尺：给了 thresholds 就以它为准（档数随之定死），否则按区间内的最大值均分。 */
export function heatmapScaleOf(options: HeatmapGridOptions, counts: Map<string, number>): HeatmapScale {
  const startTime = parseHeatmapDate(options.startDate)
  const endTime = parseHeatmapDate(options.endDate)
  let max = 0
  let total = 0
  for (const [date, count] of counts) {
    const time = parseHeatmapDate(date)
    if (time == null)
      continue
    // 区间外的数据既不进网格，也不该把标尺顶高
    if (startTime != null && time < startTime)
      continue
    if (endTime != null && time > endTime)
      continue
    total += count
    if (count > max)
      max = count
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

/**
 * 单独查一天的计数与档位，不建整张网格：焦点回调只要这两个数。
 * 区间外的日期一律给 0 档 0 计数，与网格里查不到那一格的取值一致。
 */
export function heatmapStatsOf(options: HeatmapGridOptions, date: string): HeatmapCellStats {
  const time = parseHeatmapDate(date)
  const startTime = parseHeatmapDate(options.startDate)
  const endTime = parseHeatmapDate(options.endDate)
  const outside = time == null
    || startTime == null
    || endTime == null
    || time < startTime
    || time > endTime
  if (outside)
    return { count: 0, level: 0 }
  const counts = heatmapCountsOf(options.value)
  const scale = heatmapScaleOf(options, counts)
  const count = counts.get(date) ?? 0
  return { count, level: heatmapLevelOf(count, scale.thresholds) }
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
      rowCells.push(meta)
      cells.set(date, meta)
    }
    rows.push({ weekDay, offset, cells: rowCells })
  }

  const months: HeatmapMonthMeta[] = []
  for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
    // 一列归哪个月：取这一列里落在区间内的头一天所在的月，连着同月的列并成一段
    const columnStart = Math.max(gridStart + weekIndex * HEATMAP_WEEK_LENGTH * DAY_MS, startTime)
    const at = new Date(columnStart)
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
    rows,
    months,
    weekDays,
    cells,
    firstDate: filled[0]?.cells[0]?.date ?? null,
    lastDate: lastRow ? (lastRow.cells[lastRow.cells.length - 1]?.date ?? null) : null,
  }
}

/** 方向键与 Home/End 的落点意图。 */
export type HeatmapNavIntent
  = | 'day.prev'
    | 'day.next'
    | 'week.prev'
    | 'week.next'
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

/** 四个方向键各走一步的天数：列是周，行是天。 */
const NAV_STEP: Record<'day.prev' | 'day.next' | 'week.prev' | 'week.next', number> = {
  'day.prev': -1,
  'day.next': 1,
  'week.prev': -HEATMAP_WEEK_LENGTH,
  'week.next': HEATMAP_WEEK_LENGTH,
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
    return 'day.prev'
  if (event.key === 'ArrowDown')
    return 'day.next'
  // 列沿 inline 轴排开，视觉次序随书写方向翻转，左右键的语义跟着翻
  if (event.key === 'ArrowLeft')
    return dir === 'rtl' ? 'week.next' : 'week.prev'
  if (event.key === 'ArrowRight')
    return dir === 'rtl' ? 'week.prev' : 'week.next'
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
  const next = addHeatmapDays(from, NAV_STEP[intent])
  return next != null && grid.cells.has(next) ? next : null
}
