// 时间格式化的纯函数：不碰 DOM、不认识解剖，把一个时刻翻成给人看的文本与给机器读的戳。
//
// 不做时区换算。取的是运行时自己的年月日时分秒（Date 的本地取值器），
// 显示与 datetime 用的是同一个墙钟，所以 datetime 不带偏移量——
// 带偏移量就等于替宿主宣称了一个时区，而选时区是宿主的事。

/** 三种呈现方式：只到日、到秒、以及相对现在的说法。 */
export type TimestampType = 'date' | 'datetime' | 'relative'

/** 可以当时刻用的三种写法。 */
export type TimestampValue = Date | number | string

/** 一套用词：两个缺省格式串加四档相对说法。 */
export interface TimestampWords {
  readonly date: string
  readonly datetime: string
  readonly justNow: string
  readonly minutes: (n: number) => string
  readonly hours: (n: number) => string
  readonly days: (n: number) => string
}

const ZH: TimestampWords = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  justNow: '刚刚',
  minutes: n => `${n} 分钟前`,
  hours: n => `${n} 小时前`,
  days: n => `${n} 天前`,
}

const EN: TimestampWords = {
  date: 'MM/DD/YYYY',
  datetime: 'MM/DD/YYYY HH:mm:ss',
  justNow: 'just now',
  minutes: n => `${n} minute${n === 1 ? '' : 's'} ago`,
  hours: n => `${n} hour${n === 1 ? '' : 's'} ago`,
  days: n => `${n} day${n === 1 ? '' : 's'} ago`,
}

/** 取一套用词：zh 开头的语言标记用中文那套，其余（含没给）一律英文。 */
export function timestampWords(locale: string | undefined): TimestampWords {
  return locale !== undefined && locale.toLowerCase().startsWith('zh') ? ZH : EN
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** 相对说法的上界：更久之前改报绝对日期，「四百多天前」没人读得出是哪天。 */
export const TIMESTAMP_RELATIVE_LIMIT = 30 * DAY

/** 只写年月日的那种串。 */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * 把一个时刻解析成 Date；认不出时返回 undefined。
 *
 * 只写年月日的串（`2026-08-11`）会被 Date 按 UTC 零点解读，而带时分秒的串按本地解读——
 * 同一批数据里两种写法会差出一天。这里把只写年月日的串也按本地零点建，两种写法对齐。
 */
export function toTimeDate(value: TimestampValue | undefined | null): Date | undefined {
  if (value == null)
    return undefined
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? undefined : value
  if (typeof value === 'number')
    return Number.isFinite(value) ? new Date(value) : undefined

  const text = value.trim()
  if (text === '')
    return undefined
  if (DATE_ONLY.test(text)) {
    const [year, month, day] = text.split('-').map(Number) as [number, number, number]
    return new Date(year, month - 1, day)
  }
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * 格式串里认得的记号，长的排在前面：正则的分支是先到先得，
 * `M` 排在 `MM` 前面的话两位月份会被拆成两次一位月份。
 */
const TOKEN = /YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g

/**
 * 按格式串把一个时刻铺成文本。
 *
 * 一遍扫完，换上去的数字不会再被当成记号回扫：分两遍替换的话，
 * 先换出来的年份里那两位数字会在下一遍里被别的记号啃掉。
 * 记号之外的字符原样留着，没有转义写法——要写字面量的 `M`，换个不含记号的写法。
 */
export function formatTimePattern(date: Date, pattern: string): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return pattern.replace(TOKEN, (token) => {
    switch (token) {
      case 'YYYY': return String(year)
      case 'YY': return pad2(((year % 100) + 100) % 100)
      case 'MM': return pad2(month)
      case 'M': return String(month)
      case 'DD': return pad2(day)
      case 'D': return String(day)
      case 'HH': return pad2(hour)
      case 'H': return String(hour)
      case 'mm': return pad2(minute)
      case 'm': return String(minute)
      case 'ss': return pad2(second)
      default: return String(second)
    }
  })
}

/**
 * 相对说法：刚刚 / n 分钟前 / n 小时前 / n 天前，四档之外返回 undefined（由调用方改报绝对日期）。
 *
 * 领先参照时刻一分钟以内仍算「刚刚」，收住两台机器之间那点钟差；
 * 更远的未来落不进任何一档，同样返回 undefined。
 */
export function formatRelativeTime(date: Date, now: Date, locale: string | undefined): string | undefined {
  const elapsed = now.getTime() - date.getTime()
  if (elapsed < -MINUTE || elapsed >= TIMESTAMP_RELATIVE_LIMIT)
    return undefined

  const words = timestampWords(locale)
  if (elapsed < MINUTE)
    return words.justNow
  if (elapsed < HOUR)
    return words.minutes(Math.floor(elapsed / MINUTE))
  if (elapsed < DAY)
    return words.hours(Math.floor(elapsed / HOUR))
  return words.days(Math.floor(elapsed / DAY))
}

/**
 * 给机器读的那个戳，写进 `datetime`。
 * 精度跟着呈现方式走：只到日的那种给日期串，其余给到秒的本地日期时间串。
 * 相对说法底下仍是一个确切时刻，故与 datetime 型同样给到秒。
 */
export function timestampMachineStamp(date: Date, type: TimestampType): string {
  return type === 'date'
    ? formatTimePattern(date, 'YYYY-MM-DD')
    : formatTimePattern(date, 'YYYY-MM-DDTHH:mm:ss')
}
