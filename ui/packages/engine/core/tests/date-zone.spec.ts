// 时区换算：夏令时跳过与重复的取舍、半小时与四十五分的偏移、整天被跳过的时区、零点被跳过时一天从哪一刻开始。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getLocalTimeZone, getTimeZoneOffset, isValidTimeZone, now, PlainDate, PlainDateTime, today } from '../src/date'

afterEach(() => {
  vi.useRealTimers()
})

const iso = (date: Date): string => date.toISOString()

describe('墙上时间 → 时刻', () => {
  it('夏令时跳过的时间：compatible 与 later 取跳过之后，earlier 取之前，reject 抛错', () => {
    const gap = PlainDateTime.from('2026-03-08T02:30')
    expect(iso(gap.toDate('America/Los_Angeles'))).toBe('2026-03-08T10:30:00.000Z')
    expect(iso(gap.toDate('America/Los_Angeles', { disambiguation: 'later' }))).toBe('2026-03-08T10:30:00.000Z')
    expect(iso(gap.toDate('America/Los_Angeles', { disambiguation: 'earlier' }))).toBe('2026-03-08T09:30:00.000Z')
    expect(() => gap.toDate('America/Los_Angeles', { disambiguation: 'reject' })).toThrow(RangeError)
  })

  it('夏令时重复的时间：compatible 与 earlier 取较早的一次，later 取较晚的一次', () => {
    const fold = PlainDateTime.from('2026-11-01T01:30')
    expect(iso(fold.toDate('America/Los_Angeles'))).toBe('2026-11-01T08:30:00.000Z')
    expect(iso(fold.toDate('America/Los_Angeles', { disambiguation: 'later' }))).toBe('2026-11-01T09:30:00.000Z')
    expect(() => fold.toDate('America/Los_Angeles', { disambiguation: 'reject' })).toThrow(RangeError)
  })

  it('半小时的夏令时跳变与整天被跳过的时区', () => {
    expect(iso(PlainDateTime.from('2026-10-04T02:15').toDate('Australia/Lord_Howe'))).toBe('2026-10-03T15:45:00.000Z')
    expect(iso(PlainDateTime.from('2011-12-30T12:00').toDate('Pacific/Apia'))).toBe('2011-12-30T22:00:00.000Z')
  })

  it('零点被跳过的那一天从跳过之后的第一刻开始', () => {
    expect(iso(PlainDate.from('2026-09-06').toDate('America/Santiago'))).toBe('2026-09-06T04:00:00.000Z')
    expect(iso(PlainDate.from('2026-09-26').toDate('UTC'))).toBe('2026-09-26T00:00:00.000Z')
  })

  it('不认识的时区抛 RangeError', () => {
    expect(isValidTimeZone('Asia/Shanghai')).toBe(true)
    expect(isValidTimeZone('Mars/Olympus')).toBe(false)
    expect(() => PlainDate.from('2026-09-26').toDate('Mars/Olympus')).toThrow(RangeError)
  })
})

describe('时刻 → 墙上时间', () => {
  it('按时区读出日期时间，含非整点偏移', () => {
    const instant = Date.UTC(2026, 0, 1, 0, 30)
    expect(PlainDateTime.fromDate(instant, 'Asia/Kolkata').toString()).toBe('2026-01-01T06:00:00')
    expect(PlainDateTime.fromDate(new Date(instant), 'Asia/Kathmandu').toString()).toBe('2026-01-01T06:15:00')
    expect(PlainDate.fromDate(instant, 'America/Los_Angeles').toString()).toBe('2025-12-31')
    expect(PlainDateTime.fromDate(instant + 7, 'UTC').millisecond).toBe(7)
  })

  it('偏移量东正西负，历史上的秒级偏移原样给出', () => {
    expect(getTimeZoneOffset(Date.UTC(2026, 6, 1), 'America/New_York')).toBe(-4 * 3_600_000)
    expect(getTimeZoneOffset(Date.UTC(2026, 0, 1), 'Asia/Kathmandu')).toBe((5 * 60 + 45) * 60_000)
    expect(getTimeZoneOffset(Date.UTC(1900, 0, 1), 'Asia/Shanghai')).toBe((8 * 3600 + 5 * 60 + 43) * 1000)
    expect(() => getTimeZoneOffset(Number.NaN, 'UTC')).toThrow(RangeError)
  })

  it('今天与此刻按给定时区读', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-01-01T02:00:00Z'))
    expect(today('America/Los_Angeles').toString()).toBe('2025-12-31')
    expect(today('Asia/Tokyo').toString()).toBe('2026-01-01')
    expect(now('Asia/Tokyo').toString()).toBe('2026-01-01T11:00:00')
    expect(today().equals(PlainDate.fromDate(Date.now(), getLocalTimeZone()))).toBe(true)
  })
})
