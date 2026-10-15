// 混合输入的墙上时间：字符串按写下的取、时刻按时区换算，分桶键与可比较的墙上时间串。
import { describe, expect, it } from 'vitest'
import { bucketKey, DATE_BUCKET_UNITS, wallClock, wallClockParts } from '../src/date'

const utc = { timeZone: 'UTC' }
const shanghai = { timeZone: 'Asia/Shanghai' }

function errorOf(run: () => unknown): string | undefined {
  try {
    run()
  }
  catch (error) {
    return error instanceof Error ? error.name : 'other'
  }
  return undefined
}

describe('wallClockParts', () => {
  it('不带偏移的字符串按写下的取，没写到的部分为 null，与时区无关', () => {
    expect(wallClockParts('2026', shanghai)).toEqual({ year: 2026, month: null, day: null, hour: null, minute: null, second: null, millisecond: null })
    expect(wallClockParts('2026-10', shanghai)).toMatchObject({ year: 2026, month: 10, day: null })
    expect(wallClockParts('2026-10-16', shanghai)).toMatchObject({ day: 16, hour: null })
    expect(wallClockParts('2026-10-16 08:30', shanghai)).toMatchObject({ hour: 8, minute: 30, second: null, millisecond: null })
    expect(wallClockParts('2026-10-16T08:30:05.12', utc)).toMatchObject({ second: 5, millisecond: 120 })
  })

  it('带偏移的字符串、毫秒数与 Date 是时刻，部分齐全', () => {
    expect(wallClockParts('2026-10-15T20:00:00Z', shanghai)).toEqual({ year: 2026, month: 10, day: 16, hour: 4, minute: 0, second: 0, millisecond: 0 })
    expect(wallClockParts(Date.UTC(2026, 9, 15, 20, 0, 0, 7), shanghai)).toMatchObject({ day: 16, hour: 4, millisecond: 7 })
    expect(wallClockParts(new Date(Date.UTC(2026, 0, 1)), utc)).toMatchObject({ year: 2026, month: 1, day: 1, hour: 0 })
  })

  it('偏移可写成 ±HH、±HHmm 或 ±HH:mm；两位数年份不被当成 19xx', () => {
    expect(wallClockParts('2026-10-16T01:00:00+08', utc)).toMatchObject({ day: 15, hour: 17 })
    expect(wallClockParts('2026-10-16T01:00:00+0800', utc)).toMatchObject({ day: 15, hour: 17 })
    expect(wallClockParts('2026-10-16T01:00:00-03:30', utc)).toMatchObject({ day: 16, hour: 4, minute: 30 })
    expect(wallClockParts('0050-06-01T00:00:00Z', utc)).toMatchObject({ year: 50, month: 6, day: 1 })
  })

  it('缺失值为 null', () => {
    for (const value of [null, undefined, Number.NaN, new Date('invalid')])
      expect(wallClockParts(value, utc)).toBeNull()
  })

  it('不合法的字符串、非有限数与不认识的时区抛 RangeError，其它类型抛 TypeError', () => {
    expect(errorOf(() => wallClockParts('abc', utc))).toBe('RangeError')
    expect(errorOf(() => wallClockParts('2026-13', utc))).toBe('RangeError')
    expect(errorOf(() => wallClockParts('2026-02-30', utc))).toBe('RangeError')
    expect(errorOf(() => wallClockParts(Number.POSITIVE_INFINITY, utc))).toBe('RangeError')
    expect(errorOf(() => wallClockParts(0, { timeZone: 'Mars/Olympus' }))).toBe('RangeError')
    expect(errorOf(() => wallClockParts(true, utc))).toBe('TypeError')
  })

  it('不写时区时取运行环境所在的时区', () => {
    const instant = Date.UTC(2026, 9, 15, 20)
    const local = new Date(instant)
    expect(wallClockParts(instant)).toMatchObject({ day: local.getDate(), hour: local.getHours() })
  })
})

describe('bucketKey', () => {
  it('按粒度取键', () => {
    expect(DATE_BUCKET_UNITS).toEqual(['year', 'quarter', 'month', 'week', 'day', 'hour'])
    expect(bucketKey('2026-10-16', 'year', utc)).toBe('2026')
    expect(bucketKey('2026-10-16', 'quarter', utc)).toBe('2026-Q4')
    expect(bucketKey('2026-10-16', 'month', utc)).toBe('2026-10')
    expect(bucketKey('2026-10-16', 'week', utc)).toBe('2026-W42')
    expect(bucketKey('2026-10-16', 'day', utc)).toBe('2026-10-16')
    expect(bucketKey('2026-10-16T08:30:00', 'hour', utc)).toBe('2026-10-16T08')
    expect(bucketKey('2026-10-16T23:30:00', 'day', shanghai)).toBe('2026-10-16')
  })

  it('跨年的 ISO 周归到周四所在的年', () => {
    expect(bucketKey('2021-01-01', 'week', utc)).toBe('2020-W53')
    expect(bucketKey('2024-12-30', 'week', utc)).toBe('2025-W01')
    expect(bucketKey('2026-01-01', 'week', utc)).toBe('2026-W01')
  })

  it('时刻按时区换算后取键', () => {
    expect(bucketKey('2026-10-15T20:00:00Z', 'day', utc)).toBe('2026-10-15')
    expect(bucketKey('2026-10-15T20:00:00Z', 'day', shanghai)).toBe('2026-10-16')
    const instant = Date.UTC(2026, 9, 15, 20)
    expect(bucketKey(instant, 'day', shanghai)).toBe('2026-10-16')
    expect(bucketKey(new Date(instant), 'hour', shanghai)).toBe('2026-10-16T04')
  })

  it('缺失值为 null；没写到所需部分或粒度不认识时抛 RangeError', () => {
    expect(bucketKey(null, 'day', utc)).toBeNull()
    expect(bucketKey('2026-10', 'quarter', utc)).toBe('2026-Q4')
    expect(errorOf(() => bucketKey('2026-10', 'day', utc))).toBe('RangeError')
    expect(errorOf(() => bucketKey('2026-10-16', 'hour', utc))).toBe('RangeError')
    expect(errorOf(() => bucketKey('2026-10-16', 'minute' as never, utc))).toBe('RangeError')
  })

  it('键按字符串排序即按时间排序', () => {
    const values = ['2026-10-16', '2025-12-31', '2026-01-05', '2026-03-01']
    for (const unit of DATE_BUCKET_UNITS.filter(u => u !== 'hour')) {
      const keys = values.map(v => bucketKey(v, unit, utc)!)
      const byTime = [...values].sort().map(v => bucketKey(v, unit, utc))
      expect([...keys].sort()).toEqual(byTime)
    }
  })
})

describe('wallClock', () => {
  it('写成可比较的墙上时间，没写到的部分取最小值', () => {
    expect(wallClock('2026-10', 'date', utc)).toBe('2026-10-01')
    expect(wallClock('2026-10-16', 'datetime', utc)).toBe('2026-10-16T00:00:00.000')
    expect(wallClock('2026-10-16T08:30:05.12', 'datetime', utc)).toBe('2026-10-16T08:30:05.120')
    expect(wallClock(Date.UTC(2026, 9, 15, 20, 0, 0, 7), 'datetime', shanghai)).toBe('2026-10-16T04:00:00.007')
    expect(wallClock(null, 'date', utc)).toBeNull()
  })
})
