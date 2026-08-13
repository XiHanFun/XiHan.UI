// showTime 的日期与时间拆并：值升格为 'YYYY-MM-DDTHH:mm[:ss]'，
// 日历与段位只认日期段、时间列只认时间段，拆并全在编排边界完成。纯运算，不碰 DOM。
import type { TimeGranularity } from '../time-field'

/** showTime 下时间段的精度：分或秒（时间列没有只到小时的形态）。 */
export type DatePickerTimeGranularity = Extract<TimeGranularity, 'minute' | 'second'>

/** 取日期段；空串原样返回（区间占位）。 */
export function datePickerDatePart(value: string): string {
  const at = value.indexOf('T')
  return at === -1 ? value : value.slice(0, at)
}

/** 取时间段；没有时间段（纯日期或空串）为 null。 */
export function datePickerTimePart(value: string): string | null {
  const at = value.indexOf('T')
  return at === -1 ? null : value.slice(at + 1)
}

/** 精度对应的零点。 */
export function datePickerZeroTime(granularity: DatePickerTimeGranularity): string {
  return granularity === 'second' ? '00:00:00' : '00:00'
}

/** 拼回 datetime；日期为空（区间占位）不拼，时间缺席补零点。 */
export function datePickerJoinDateTime(
  date: string,
  time: string | null,
  granularity: DatePickerTimeGranularity,
): string {
  if (date === '')
    return ''
  return `${date}T${time ?? datePickerZeroTime(granularity)}`
}

/** 把时间段的某个单位换成新值（两位补零串），其余单位原样；时间缺席从零点起改。 */
export function datePickerSetTimeUnit(
  time: string | null,
  unit: 'hour' | 'minute' | 'second',
  next: string,
  granularity: DatePickerTimeGranularity,
): string {
  const parts = (time ?? datePickerZeroTime(granularity)).split(':')
  const out = [parts[0] ?? '00', parts[1] ?? '00', ...(granularity === 'second' ? [parts[2] ?? '00'] : [])]
  const at = unit === 'hour' ? 0 : unit === 'minute' ? 1 : 2
  if (at < out.length)
    out[at] = next
  return out.join(':')
}
