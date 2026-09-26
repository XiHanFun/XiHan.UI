// 不带时区的日期值：构造与解析的严格度、越界规则、年月加减的夹取、差值、取整与字符串形态。
import { describe, expect, it } from 'vitest'
import { PlainDate, PlainDateTime, PlainTime } from '../src/date'

describe('日期值的构造与解析', () => {
  it('构造函数拒收越界字段，from(fields) 缺省夹到合法值', () => {
    expect(() => new PlainDate(2026, 2, 29)).toThrow(RangeError)
    expect(() => new PlainDate(2026, 13, 1)).toThrow(RangeError)
    expect(() => new PlainDate(2026, 1, 1.5)).toThrow(RangeError)
    expect(PlainDate.from({ year: 2026, month: 2, day: 31 }).toString()).toBe('2026-02-28')
    expect(PlainDate.from({ year: 2024, month: 14, day: 0 }).toString()).toBe('2024-12-01')
    expect(() => PlainDate.from({ year: 2026, month: 2, day: 31 }, { overflow: 'reject' })).toThrow(RangeError)
  })

  it('字符串只认 YYYY-MM-DD 与 ±YYYYYY-MM-DD，日号按当月天数校验', () => {
    expect(PlainDate.from('2024-02-29').toString()).toBe('2024-02-29')
    expect(PlainDate.from('+012026-01-05').year).toBe(12026)
    expect(PlainDate.from('-000001-12-31').year).toBe(-1)
    for (const bad of ['2026-02-29', '2026-1-1', '26-01-01', '2026-01-01T00:00', ' 2026-01-01', '-000000-01-01', ''])
      expect(() => PlainDate.from(bad), bad).toThrow(RangeError)
  })

  it('0–99 年按字面年份处理，不映射到 1900 年代', () => {
    const date = PlainDate.from('0045-03-01')
    expect(date.subtract({ days: 1 }).toString()).toBe('0045-02-28')
    expect(date.dayOfWeek).toBe(3)
    expect(PlainDate.from('0000-02-29').inLeapYear).toBe(true)
  })

  it('超出 Temporal 的日期范围抛错，边界本身可以表示', () => {
    expect(PlainDate.from('+275760-09-13').toString()).toBe('+275760-09-13')
    expect(PlainDate.from('-271821-04-19').toString()).toBe('-271821-04-19')
    expect(() => PlainDate.from('+275760-09-14')).toThrow(RangeError)
    expect(() => PlainDate.from('+275760-09-13').add({ days: 1 })).toThrow(RangeError)
  })

  it('实例冻结，且不能拿 < / > 直接比较', () => {
    const date = PlainDate.from('2026-09-26')
    expect(Object.isFrozen(date)).toBe(true)
    expect(() => `${date}`).not.toThrow()
    expect(() => (date as unknown as number) + 1).toThrow(TypeError)
    expect(JSON.stringify({ date })).toBe('{"date":"2026-09-26"}')
  })
})

describe('日期值的运算', () => {
  it('先加年月、夹住越界的日，再加周与日', () => {
    expect(PlainDate.from('2024-01-31').add({ months: 1 }).toString()).toBe('2024-02-29')
    expect(PlainDate.from('2024-01-31').add({ months: 1, days: 1 }).toString()).toBe('2024-03-01')
    expect(PlainDate.from('2024-02-29').add({ years: 1 }).toString()).toBe('2025-02-28')
    expect(PlainDate.from('2026-03-31').subtract({ months: 1, weeks: 1 }).toString()).toBe('2026-02-21')
    expect(() => PlainDate.from('2024-01-31').add({ months: 1 }, { overflow: 'reject' })).toThrow(RangeError)
    expect(() => PlainDate.from('2024-01-31').add({ days: 0.5 })).toThrow(RangeError)
  })

  it('with 换字段时同样夹住日号', () => {
    expect(PlainDate.from('2026-01-31').with({ month: 2 }).toString()).toBe('2026-02-28')
    expect(PlainDate.from('2026-05-18').with({ year: 2020, day: 31 }).toString()).toBe('2020-05-31')
  })

  it('until 缺省只给天数，按月取时起点加上结果恰好落在终点', () => {
    const start = PlainDate.from('2024-01-31')
    expect(start.until(PlainDate.from('2024-03-01'))).toEqual({ years: 0, months: 0, weeks: 0, days: 30 })
    expect(start.until(PlainDate.from('2024-02-29'), { largestUnit: 'month' })).toEqual({ years: 0, months: 0, weeks: 0, days: 29 })
    expect(start.until(PlainDate.from('2024-03-01'), { largestUnit: 'month' })).toEqual({ years: 0, months: 1, weeks: 0, days: 1 })
    expect(PlainDate.from('2020-02-29').until(PlainDate.from('2021-02-28'), { largestUnit: 'year' })).toEqual({ years: 0, months: 11, weeks: 0, days: 30 })
    expect(PlainDate.from('2026-03-15').until(PlainDate.from('2026-01-20'), { largestUnit: 'month' })).toEqual({ years: 0, months: -1, weeks: 0, days: -26 })
    expect(PlainDate.from('2026-01-01').until(PlainDate.from('2026-01-18'), { largestUnit: 'week' })).toEqual({ years: 0, months: 0, weeks: 2, days: 3 })
  })

  it('since 是 until 的相反数，零值不出现 -0', () => {
    const a = PlainDate.from('2026-01-01')
    const b = PlainDate.from('2027-03-04')
    expect(a.since(b, { largestUnit: 'year' })).toEqual({ years: -1, months: -2, weeks: 0, days: -3 })
    expect(Object.is(a.since(b, { largestUnit: 'year' }).weeks, 0)).toBe(true)
  })

  it('按 ISO 周：跨年的周归星期四所在的年', () => {
    expect([PlainDate.from('2020-12-31').weekOfYear, PlainDate.from('2020-12-31').yearOfWeek]).toEqual([53, 2020])
    expect([PlainDate.from('2021-01-03').weekOfYear, PlainDate.from('2021-01-03').yearOfWeek]).toEqual([53, 2020])
    expect([PlainDate.from('2024-12-30').weekOfYear, PlainDate.from('2024-12-30').yearOfWeek]).toEqual([1, 2025])
    expect(PlainDate.from('2026-12-31').dayOfYear).toBe(365)
    expect(PlainDate.from('1900-02-01').daysInMonth).toBe(28)
    expect(PlainDate.from('2000-02-01').daysInMonth).toBe(29)
  })

  it('compare 与 equals 按字段比', () => {
    expect(PlainDate.compare(PlainDate.from('2026-01-02'), PlainDate.from('2026-01-10'))).toBe(-1)
    expect(PlainDate.from('2026-01-02').equals({ year: 2026, month: 1, day: 2 })).toBe(true)
  })
})

describe('时间值', () => {
  it('字符串认 HH、HH:mm、HH:mm:ss 与小数秒，小数只保留到毫秒', () => {
    expect(PlainTime.from('09').toString()).toBe('09:00:00')
    expect(PlainTime.from('T09:30').toString()).toBe('09:30:00')
    expect(PlainTime.from('09:30:05.5').millisecond).toBe(500)
    expect(PlainTime.from('09:30:05,123456789').millisecond).toBe(123)
    for (const bad of ['24:00', '9:30', '09:60', '09:30:5', '09:30.5'])
      expect(() => PlainTime.from(bad), bad).toThrow(RangeError)
  })

  it('加减跨过午夜时绕回', () => {
    expect(PlainTime.from('23:30').add({ hours: 1 }).toString()).toBe('00:30:00')
    expect(PlainTime.from('00:10').subtract({ minutes: 20 }).toString()).toBe('23:50:00')
  })

  it('toString 可截到分或恒带毫秒，缺省去掉毫秒末尾的 0', () => {
    const time = new PlainTime(8, 5, 0, 120)
    expect(time.toString()).toBe('08:05:00.12')
    expect(time.toString({ smallestUnit: 'minute' })).toBe('08:05')
    expect(new PlainTime(8, 5).toString({ smallestUnit: 'millisecond' })).toBe('08:05:00.000')
  })

  it('round 按单位与步长取整，步长须整除上一级单位', () => {
    expect(PlainTime.from('10:07:29').round({ smallestUnit: 'minute', roundingIncrement: 15 }).toString()).toBe('10:00:00')
    expect(PlainTime.from('10:07:30').round({ smallestUnit: 'minute', roundingIncrement: 15 }).toString()).toBe('10:15:00')
    expect(PlainTime.from('10:00:01').round({ smallestUnit: 'minute', roundingIncrement: 15, roundingMode: 'ceil' }).toString()).toBe('10:15:00')
    expect(PlainTime.from('10:14:59').round({ smallestUnit: 'minute', roundingIncrement: 15, roundingMode: 'trunc' }).toString()).toBe('10:00:00')
    expect(PlainTime.from('10:07:30').round('minute').toString()).toBe('10:08:00')
    expect(PlainTime.from('10:07:30').round({ smallestUnit: 'minute', roundingMode: 'halfEven' }).toString()).toBe('10:08:00')
    expect(PlainTime.from('10:06:30').round({ smallestUnit: 'minute', roundingMode: 'halfEven' }).toString()).toBe('10:06:00')
    expect(PlainTime.from('23:59:59.9').round('second').toString()).toBe('00:00:00')
    expect(() => PlainTime.from('10:00').round({ smallestUnit: 'minute', roundingIncrement: 7 })).toThrow(RangeError)
    expect(() => PlainTime.from('10:00').round({ smallestUnit: 'hour', roundingIncrement: 24 })).toThrow(RangeError)
  })

  it('until 按最大单位折算', () => {
    expect(PlainTime.from('08:00').until(PlainTime.from('10:30:15'))).toEqual({ hours: 2, minutes: 30, seconds: 15, milliseconds: 0 })
    expect(PlainTime.from('08:00').until(PlainTime.from('10:30'), { largestUnit: 'minute' })).toEqual({ hours: 0, minutes: 150, seconds: 0, milliseconds: 0 })
    expect(PlainTime.from('10:30').until(PlainTime.from('08:00'))).toEqual({ hours: -2, minutes: -30, seconds: 0, milliseconds: 0 })
  })
})

describe('日期时间值', () => {
  it('字符串认只有日期（取 00:00）与带时间的形态，分隔符可以是 T 或空格', () => {
    expect(PlainDateTime.from('2026-09-26').toString()).toBe('2026-09-26T00:00:00')
    expect(PlainDateTime.from('2026-09-26T14').toString()).toBe('2026-09-26T14:00:00')
    expect(PlainDateTime.from('2026-09-26 14:05:09.007').toString()).toBe('2026-09-26T14:05:09.007')
    expect(PlainDateTime.from('2026-09-26T14:05').toString({ smallestUnit: 'minute' })).toBe('2026-09-26T14:05')
    for (const bad of ['2026-09-26T', '2026-09-26T25:00', '2026-09-26T14:05Z', '2026-09-26T14:05+08:00'])
      expect(() => PlainDateTime.from(bad), bad).toThrow(RangeError)
  })

  it('先加时间并进位，再加年月与日', () => {
    const at = PlainDateTime.from('2020-01-31T23:00')
    expect(at.add({ hours: 2 }).toString()).toBe('2020-02-01T01:00:00')
    expect(at.add({ months: 1, hours: 2 }).toString()).toBe('2020-03-01T01:00:00')
    expect(at.subtract({ minutes: 23 * 60 + 1 }).toString()).toBe('2020-01-30T23:59:00')
  })

  it('until 时间差与日期差不同号就借一天', () => {
    const start = PlainDateTime.from('2026-01-01T10:00')
    expect(start.until(PlainDateTime.from('2026-01-03T08:00'))).toEqual({ years: 0, months: 0, weeks: 0, days: 1, hours: 22, minutes: 0, seconds: 0, milliseconds: 0 })
    expect(start.until(PlainDateTime.from('2026-01-03T08:00'), { largestUnit: 'hour' })).toEqual({ years: 0, months: 0, weeks: 0, days: 0, hours: 46, minutes: 0, seconds: 0, milliseconds: 0 })
    expect(start.until(PlainDateTime.from('2026-03-01T09:00'), { largestUnit: 'month' })).toEqual({ years: 0, months: 1, weeks: 0, days: 27, hours: 23, minutes: 0, seconds: 0, milliseconds: 0 })
  })

  it('round 满一天进位到下一天，按天取整只能以 1 为步长', () => {
    expect(PlainDateTime.from('2026-12-31T23:59:40').round('minute').toString()).toBe('2027-01-01T00:00:00')
    expect(PlainDateTime.from('2026-12-31T12:00').round('day').toString()).toBe('2027-01-01T00:00:00')
    expect(() => PlainDateTime.from('2026-12-31T12:00').round({ smallestUnit: 'day', roundingIncrement: 2 })).toThrow(RangeError)
  })

  it('拆成日期与时间、换掉时间部分', () => {
    const at = PlainDateTime.from('2026-09-26T14:05')
    expect(at.toPlainDate().toString()).toBe('2026-09-26')
    expect(at.toPlainTime().toString()).toBe('14:05:00')
    expect(at.withPlainTime().toString()).toBe('2026-09-26T00:00:00')
    expect(PlainDate.from('2026-09-26').toPlainDateTime({ hour: 9 }).toString()).toBe('2026-09-26T09:00:00')
    expect(PlainDateTime.from(PlainDate.from('2026-09-26')).toString()).toBe('2026-09-26T00:00:00')
  })
})
