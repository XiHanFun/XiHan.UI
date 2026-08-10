// 毫秒到时分秒的整数拆分与补零。不做日历、不做时区、不认识"日期"这个概念。
import type { CountdownParts } from './countdown.types'

/** 模板缺省：两位时、两位分、两位秒。 */
export const COUNTDOWN_FORMAT = 'HH:mm:ss'

/** 精度缺省：整秒。 */
export const COUNTDOWN_PRECISION = 0

/** 精度上限：毫秒。 */
export const COUNTDOWN_PRECISION_MAX = 3

const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 3_600_000

/** 精度归一：取整并夹进 [0, 3]，缺省或非有限数退回 0。 */
export function resolveCountdownPrecision(precision: number | undefined): number {
  if (precision == null || !Number.isFinite(precision))
    return COUNTDOWN_PRECISION
  return Math.min(Math.max(Math.trunc(precision), 0), COUNTDOWN_PRECISION_MAX)
}

/** 剩余毫秒归一：负数、缺省与非有限数一律按 0——倒计时不倒着走。 */
export function resolveCountdownValue(value: number | undefined): number {
  if (value == null || !Number.isFinite(value) || value <= 0)
    return 0
  return value
}

/**
 * 按精度把剩余毫秒往下取到最近的一档：精度 0 取到整秒，3 取到整毫秒。
 *
 * 往下取而不是四舍五入：还剩 900 毫秒时显示 1 秒，会让人看到"1 秒"之后直接归零，
 * 而那一秒其实没走完。往下取的话最后一秒是真的走完了才变 0。
 */
export function quantizeCountdown(value: number, precision: number): number {
  const safe = resolveCountdownValue(value)
  const step = 10 ** (COUNTDOWN_PRECISION_MAX - precision)
  return Math.floor(safe / step) * step
}

/** 拆成时、分、秒、毫秒四段。 */
export function splitCountdown(value: number): CountdownParts {
  const total = Math.floor(resolveCountdownValue(value))
  return {
    hours: Math.floor(total / MS_PER_HOUR),
    minutes: Math.floor(total / MS_PER_MINUTE) % 60,
    seconds: Math.floor(total / MS_PER_SECOND) % 60,
    milliseconds: total % MS_PER_SECOND,
  }
}

// 识别的记号：H 时、m 分、s 秒、S 毫秒；重复的字母个数就是最少位数。
// 模板里其余字符原样留下，所以 'HH 小时 mm 分' 这样写是成立的。
const TOKEN = /H{1,2}|m{1,2}|s{1,2}|S{1,3}/g

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0')
}

/**
 * 按模板铺字。位数不够补零，位数超了不截断——`HH` 遇上 100 小时就是 `100`，
 * 截成 `00` 会把"还早着呢"说成"到点了"。
 * 毫秒那一段先补满三位再取前几位：`S` 是十分之一秒、`SS` 是百分之一秒、`SSS` 是毫秒。
 */
export function formatCountdown(value: number, format?: string): string {
  const parts = splitCountdown(value)
  return (format ?? COUNTDOWN_FORMAT).replace(TOKEN, (token) => {
    const width = token.length
    switch (token[0]) {
      case 'H':
        return pad(parts.hours, width)
      case 'm':
        return pad(parts.minutes, width)
      case 's':
        return pad(parts.seconds, width)
      default:
        return pad(parts.milliseconds, COUNTDOWN_PRECISION_MAX).slice(0, width)
    }
  })
}
