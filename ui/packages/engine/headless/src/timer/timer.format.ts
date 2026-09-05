// 计时的纯算术：间隔与起止值的归一、按已走时长求当前值、拆成五段并补零。
// 这里不认识时钟，也不持有任何定时器——时间由调用方在事件那一刻取好交进来。
import type { TimerSegments, TimerUnit } from './timer.types'

/** 刷新间隔缺省：一秒。 */
export const TIMER_INTERVAL = 1000

/** 刷新间隔下限：比一帧还密的间隔只是白跑定时器，屏幕也画不出来。 */
export const TIMER_INTERVAL_MIN = 16

/** 五段单位，从大到小。 */
export const TIMER_UNITS: readonly TimerUnit[] = ['days', 'hours', 'minutes', 'seconds', 'milliseconds']

/** 各段的最少位数。天不补零：它没有上限，补几位都不对。 */
const SEGMENT_WIDTH: Record<TimerUnit, number> = {
  days: 1,
  hours: 2,
  minutes: 2,
  seconds: 2,
  milliseconds: 3,
}

const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000

/** 一个字符串是不是认识的段单位，供适配器校验作者写在条目上的声明。 */
export function isTimerUnit(value: string | null | undefined): value is TimerUnit {
  return value != null && (TIMER_UNITS as readonly string[]).includes(value)
}

/** 间隔归一：非有限数与非正数退回一秒，其余取整并抬到一帧以上。 */
export function resolveTimerInterval(interval: number | undefined): number {
  if (interval == null || !Number.isFinite(interval) || interval <= 0)
    return TIMER_INTERVAL
  return Math.max(Math.trunc(interval), TIMER_INTERVAL_MIN)
}

/** 起始值归一：非有限数与负数一律按 0——时间不从负数开始数。 */
export function resolveTimerStart(startMs: number | undefined): number {
  if (startMs == null || !Number.isFinite(startMs) || startMs <= 0)
    return 0
  return startMs
}

/**
 * 终点值归一。
 *
 * 倒计时缺省 0：倒着走总得有个底。正计时缺省 undefined，那是「没有终点、一直走」，
 * 不能归成 0——那会变成「一开跑就已经到点」，秒表从此按不动。
 */
export function resolveTimerTarget(targetMs: number | undefined, countdown: boolean): number | undefined {
  if (targetMs == null || !Number.isFinite(targetMs) || targetMs < 0)
    return countdown ? 0 : undefined
  return targetMs
}

/**
 * 这一轮要跑多久。返回 undefined 即没有终点。
 * 终点落在起点的反方向时长度为 0：一开跑就到点，而不是往回跑。
 */
export function timerTotalMs(startMs: number | undefined, targetMs: number | undefined, countdown: boolean): number | undefined {
  const start = resolveTimerStart(startMs)
  const target = resolveTimerTarget(targetMs, countdown)
  if (target == null)
    return undefined
  return Math.max(countdown ? start - target : target - start, 0)
}

/**
 * 已走 elapsed 毫秒时该显示的值，两个方向都夹在起点与终点之间。
 *
 * 夹之前先把终点挪到起点的正确一侧：终点落在反方向时这一轮长度本就是 0，
 * 显示值该停在起点上，而不是一步跳到那个走不到的终点上去。
 */
export function timerValueAt(
  elapsed: number,
  startMs: number | undefined,
  targetMs: number | undefined,
  countdown: boolean,
): number {
  const start = resolveTimerStart(startMs)
  const target = resolveTimerTarget(targetMs, countdown)
  const passed = Number.isFinite(elapsed) && elapsed > 0 ? elapsed : 0
  if (countdown) {
    // 倒着走时终点是下界，且不可能高于起点
    const floor = Math.min(target ?? 0, start)
    return Math.max(start - passed, floor)
  }
  const value = start + passed
  if (target == null)
    return value
  // 正着走时终点是上界，且不可能低于起点
  return Math.min(value, Math.max(target, start))
}

/**
 * 结算这一段走了多久：从本段的基准与起跑时刻算到 now，再夹进 [0, total]。
 * 累加间隔会漂，所以每次都拿两个时刻相减重算。
 */
export function timerElapsedAt(baseElapsed: number, startedAt: number, now: number, total: number | undefined): number {
  const raw = Math.max(baseElapsed + (now - startedAt), 0)
  return total == null ? raw : Math.min(raw, total)
}

/** 拆成天、时、分、秒、毫秒。天单独成段，所以时满 24 进位。 */
export function splitTimer(value: number): TimerSegments {
  const total = Math.max(Math.floor(Number.isFinite(value) ? value : 0), 0)
  return {
    days: Math.floor(total / MS_PER_DAY),
    hours: Math.floor(total / MS_PER_HOUR) % 24,
    minutes: Math.floor(total / MS_PER_MINUTE) % 60,
    seconds: Math.floor(total / MS_PER_SECOND) % 60,
    milliseconds: total % MS_PER_SECOND,
  }
}

/** 某一段补零后的字面。位数超了不截断：截掉高位会把大数说成小数。 */
export function timerSegmentText(segments: TimerSegments, unit: TimerUnit): string {
  return String(segments[unit]).padStart(SEGMENT_WIDTH[unit], '0')
}

/** 文本模板缺省：两位时、两位分、两位秒。 */
export const TIMER_FORMAT = 'HH:mm:ss'

/** 取值粒度上限，也是缺省：毫秒，即不做量化。 */
export const TIMER_PRECISION_MAX = 3

/** 取值粒度归一：取整并夹进 [0, 3]，缺省或非有限数退回毫秒档。 */
export function resolveTimerPrecision(precision: number | undefined): number {
  if (precision == null || !Number.isFinite(precision))
    return TIMER_PRECISION_MAX
  return Math.min(Math.max(Math.trunc(precision), 0), TIMER_PRECISION_MAX)
}

/**
 * 按粒度把显示值往下取到最近的一档：0 取到整秒，3 取到整毫秒。
 *
 * 往下取而不是四舍五入：还剩 900 毫秒时显示 1 秒，会让人看到「1 秒」之后直接归零，
 * 而那一秒其实没走完。往下取的话最后一秒是真的走完了才变 0。
 */
export function quantizeTimer(value: number, precision: number): number {
  const safe = Number.isFinite(value) && value > 0 ? value : 0
  const step = 10 ** (TIMER_PRECISION_MAX - precision)
  return Math.floor(safe / step) * step
}

// 识别的记号：D 天、H 时、m 分、s 秒、S 毫秒；重复的字母个数就是最少位数。
// 模板里其余字符原样留下，所以 'HH 小时 mm 分' 这样写是成立的。
const TEXT_TOKEN = /D{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}/g

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0')
}

/**
 * 按模板把显示值铺成一串字。位数不够补零，位数超了不截断——`HH` 遇上 100 小时就是 `100`，
 * 截成 `00` 会把「还早着呢」说成「到点了」。
 * 毫秒那一段先补满三位再取前几位：`S` 是十分之一秒、`SS` 是百分之一秒、`SSS` 是毫秒。
 *
 * 模板里没写 `D` 时，`H` 收下全部小时数（30 小时就是 `30`）；写了 `D` 才把天分出来、`H` 只剩 0-23。
 */
export function formatTimerText(value: number, format?: string): string {
  const pattern = format ?? TIMER_FORMAT
  const segments = splitTimer(value)
  const hours = /D/.test(pattern) ? segments.hours : segments.hours + segments.days * 24
  return pattern.replace(TEXT_TOKEN, (token) => {
    const width = token.length
    switch (token[0]) {
      case 'D':
        return pad(segments.days, width)
      case 'H':
        return pad(hours, width)
      case 'm':
        return pad(segments.minutes, width)
      case 's':
        return pad(segments.seconds, width)
      default:
        return pad(segments.milliseconds, TIMER_PRECISION_MAX).slice(0, width)
    }
  })
}

/** 这一轮的起点、终点与方向。 */
export interface TimerRun {
  startMs: number | undefined
  targetMs: number | undefined
  countdown: boolean
}

/**
 * 解出这一轮的起止与方向。
 *
 * 受控剩余量 `value` 在场时由它接管：它就是起点，方向锁成倒着走、终点锁成 0，
 * 此时 `startMs` / `targetMs` / `countdown` 三个都不再参与。
 */
export function timerRunOf(props: {
  value?: number
  startMs?: number
  targetMs?: number
  countdown?: boolean
}): TimerRun {
  if (props.value != null)
    return { startMs: props.value, targetMs: 0, countdown: true }
  return { startMs: props.startMs, targetMs: props.targetMs, countdown: !!props.countdown }
}

/** 走的是受控通道吗：给了 value 或 active 即是。 */
export function isTimerControlled(value: number | undefined, active: boolean | undefined): boolean {
  return value != null || active != null
}

/** 挂载那一刻开不开跑：受控时看 active（缺省真），否则看 autoStart。 */
export function timerRunsOnMount(value: number | undefined, active: boolean | undefined, autoStart: boolean | undefined): boolean {
  return isTimerControlled(value, active) ? (active ?? true) : !!autoStart
}
