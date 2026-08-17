// 上午/下午的文字。时间输入与日期输入都要它，放在共用层：
// 从组件目录里拿会把那个组件的状态机一并拖进产物，摇树摇不掉一个顶层 createMachine。

/** 半天：上午或下午。 */
export type DayPeriod = 'am' | 'pm'

/**
 * 上午/下午在这个语言里怎么写。没给 locale 时用 AM/PM，
 * 不落到运行环境默认 locale，否则同一份代码在不同机器上产出不同的 DOM。
 */
export function dayPeriodLabel(period: DayPeriod, locale?: string): string {
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
