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
