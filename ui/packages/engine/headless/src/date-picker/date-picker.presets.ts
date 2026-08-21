import { getLocalTimeZone, startOfMonth, startOfYear, today } from '@internationalized/date'

/**
 * 快捷选项的值：单日就是一条 ISO 日期串，区间用 ISO 8601 的区间写法把两端拼在一起
 * （`2026-08-15/2026-08-21`）。一个串同时充当这一项的身份，作者在 Web Components
 * 侧把它写在节点的 value 属性上。
 *
 * 这里的函数全是纯函数，"今天"由调用方传进来的时区决定。库不在渲染期算日子：
 * connect 每帧都会跑一遍，每帧算一次 today() 会让缓存永远失配，跨零点还会算出两个答案。
 * 作者在自己的 computed / memo 里算好一次，把结果当常量交给组件。
 */

/** 区间两端的分隔符。 */
export const DATE_PICKER_RANGE_SEPARATOR = '/'

/** 把快捷选项的值拆成写进选中集合的那几条日期；单日得到长度 1 的数组。 */
export function datePickerPresetDates(value: string): string[] {
  return value.split(DATE_PICKER_RANGE_SEPARATOR).filter(part => part !== '')
}

/** 反向：把一到两条日期拼成快捷选项的值。 */
export function datePickerPresetValue(dates: readonly string[]): string {
  return dates.join(DATE_PICKER_RANGE_SEPARATOR)
}

/** 相对今天偏移若干天的那一日。0 是今天，-1 是昨天。 */
export function datePickerPresetDay(offsetDays = 0, timeZone?: string): string {
  return today(timeZone ?? getLocalTimeZone()).add({ days: offsetDays }).toString()
}

/**
 * 一段连续的日子，两端都含。含今天在内的最近七天写作 `datePickerPresetRange(-6, 0)`。
 * 两个偏移谁大谁小都行，产出的区间恒是先起后止。
 */
export function datePickerPresetRange(fromOffsetDays: number, toOffsetDays: number, timeZone?: string): string {
  const base = today(timeZone ?? getLocalTimeZone())
  const from = base.add({ days: Math.min(fromOffsetDays, toOffsetDays) })
  const to = base.add({ days: Math.max(fromOffsetDays, toOffsetDays) })
  return datePickerPresetValue([from.toString(), to.toString()])
}

/** 整个月，从 1 号到月末。0 是本月，-1 是上个月。 */
export function datePickerPresetMonth(offsetMonths = 0, timeZone?: string): string {
  const first = startOfMonth(today(timeZone ?? getLocalTimeZone()).add({ months: offsetMonths }))
  // 下个月 1 号往回退一天，比查每月天数省事，也自动吃掉闰年
  const last = startOfMonth(first.add({ months: 1 })).subtract({ days: 1 })
  return datePickerPresetValue([first.toString(), last.toString()])
}

/** 整年，从 1 月 1 日到 12 月 31 日。0 是今年，-1 是去年。 */
export function datePickerPresetYear(offsetYears = 0, timeZone?: string): string {
  const first = startOfYear(today(timeZone ?? getLocalTimeZone()).add({ years: offsetYears }))
  const last = startOfYear(first.add({ years: 1 })).subtract({ days: 1 })
  return datePickerPresetValue([first.toString(), last.toString()])
}
