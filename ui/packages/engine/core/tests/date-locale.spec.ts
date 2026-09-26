// 按地区划分的周与按 locale 的格式化，以及月、季、年的边界与 ISO 周反查。
import { describe, expect, it } from 'vitest'
import {
  createDateFormatter,
  dayOfWeekIn,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  fromIsoWeek,
  getWeekInfo,
  isoWeeksInYear,
  isWeekend,
  PlainDate,
  PlainDateTime,
  PlainTime,
  quarterOf,
  startOfQuarter,
  startOfWeek,
  weeksInMonth,
} from '../src/date'

describe('周规则', () => {
  it('按地区查周首日与周末，只有语言时按语言推断地区', () => {
    expect(getWeekInfo('en-US')).toEqual({ firstDay: 7, weekend: [6, 7] })
    expect(getWeekInfo('en-GB')).toEqual({ firstDay: 1, weekend: [6, 7] })
    expect(getWeekInfo('zh')).toEqual({ firstDay: 1, weekend: [6, 7] })
    expect(getWeekInfo('ar')).toEqual({ firstDay: 6, weekend: [5, 6] })
    expect(getWeekInfo('dv-MV').firstDay).toBe(5)
    expect(getWeekInfo('fa-IR').weekend).toEqual([5])
    expect(getWeekInfo('hi-IN')).toEqual({ firstDay: 7, weekend: [7] })
  })

  it('认 -u-fw-、-u-ca-iso8601 与 -u-rg- 扩展', () => {
    expect(getWeekInfo('en-US-u-fw-tue').firstDay).toBe(2)
    expect(getWeekInfo('en-US-u-ca-iso8601').firstDay).toBe(1)
    expect(getWeekInfo('en-US-u-rg-gbzzzz').firstDay).toBe(1)
    expect(getWeekInfo('en-GB-u-ca-gregory-fw-sun').firstDay).toBe(7)
  })

  it('周的起止与月历行数随周首日变化，也可以直接给星期几', () => {
    const date = PlainDate.from('2026-09-26')
    expect(startOfWeek(date, 'en-US').toString()).toBe('2026-09-20')
    expect(startOfWeek(date, 'en-GB').toString()).toBe('2026-09-21')
    expect(endOfWeek(date, 1).toString()).toBe('2026-09-27')
    expect(dayOfWeekIn(date, 'ar-EG')).toBe(0)
    expect(weeksInMonth(PlainDate.from('2026-02-10'), 7)).toBe(4)
    expect(weeksInMonth(PlainDate.from('2026-02-10'), 1)).toBe(5)
    expect(weeksInMonth(PlainDate.from('2026-08-10'), 'en-US')).toBe(6)
    expect(startOfWeek(PlainDateTime.from('2026-09-26T08:30'), 1).toString()).toBe('2026-09-21T08:30:00')
    expect(() => startOfWeek(date, 0 as 1)).toThrow(RangeError)
  })

  it('周末按地区判断', () => {
    expect(isWeekend(PlainDate.from('2026-09-25'), 'ar-EG')).toBe(true)
    expect(isWeekend(PlainDate.from('2026-09-25'), 'en-US')).toBe(false)
    expect(isWeekend(PlainDate.from('2026-09-26'), 'hi-IN')).toBe(false)
  })
})

// ICU 在「2:05 PM」「21 – 27」里用的是窄不换行空格与细空格，比较前归一成普通空格
const flat = (text: string): string => text.replace(/\s/g, ' ')

describe('格式化', () => {
  it('只由字段决定：日期按年月日、时间按时分秒、日期时间两者都有', () => {
    const formatter = createDateFormatter('en-US')
    expect(formatter.format(PlainDate.from('2026-09-26'))).toBe('9/26/2026')
    expect(flat(formatter.format(PlainTime.from('14:05')))).toBe('2:05:00 PM')
    expect(flat(formatter.format(PlainDateTime.from('2026-09-26T14:05')))).toBe('9/26/2026, 2:05:00 PM')
  })

  it('按给定字段与 locale 输出，拆段与区间可用', () => {
    const heading = createDateFormatter('zh-CN', { year: 'numeric', month: 'long' })
    expect(heading.format(PlainDate.from('2026-02-01'))).toBe('2026年2月')
    expect(heading.formatToParts(PlainDate.from('2026-02-01')).map(p => p.type)).toEqual(['year', 'literal', 'month', 'literal'])
    const range = createDateFormatter('en-US', { month: 'short', day: 'numeric' })
    expect(flat(range.formatRange(PlainDate.from('2026-09-21'), PlainDate.from('2026-09-27')))).toBe('Sep 21 – 27')
    expect(() => range.formatRange(PlainDate.from('2026-09-21'), PlainTime.from('10:00'))).toThrow(TypeError)
    expect(PlainDate.from('0045-03-01').toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })).toBe('Mar 1, 45')
  })
})

describe('月、季、年的边界', () => {
  it('季度的起止', () => {
    const date = PlainDate.from('2026-08-19')
    expect(quarterOf(date)).toBe(3)
    expect(startOfQuarter(date).toString()).toBe('2026-07-01')
    expect(endOfQuarter(date).toString()).toBe('2026-09-30')
    expect(endOfQuarter(PlainDate.from('2024-02-01')).toString()).toBe('2024-03-31')
  })

  it('日期时间只挪日期，保留时间部分', () => {
    const at = PlainDateTime.from('2024-02-10T09:15')
    expect(endOfMonth(at).toString()).toBe('2024-02-29T09:15:00')
    expect(endOfYear(at).toString()).toBe('2024-12-31T09:15:00')
  })

  it('按 ISO 周反查：周年的第几周、星期几是哪一天', () => {
    expect(fromIsoWeek(2020, 53, 4).toString()).toBe('2020-12-31')
    expect(fromIsoWeek(2025, 1).toString()).toBe('2024-12-30')
    expect(isoWeeksInYear(2026)).toBe(53)
    expect(isoWeeksInYear(2027)).toBe(52)
    expect(() => fromIsoWeek(2027, 53)).toThrow(RangeError)
  })
})
