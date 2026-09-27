// 带时区日期时间：时间点保持、DST 歧义、严格偏移校验与序列化。
import { describe, expect, it } from 'vitest'
import { formatTimeZoneOffset, getAvailableTimeZones, ZonedDateTime } from '../src/date'

describe('zonedDateTime 构造与转换', () => {
  it('由墙上时间构造，并按 DST 歧义策略选取时间点', () => {
    const earlier = ZonedDateTime.from({
      year: 2026,
      month: 11,
      day: 1,
      hour: 1,
      minute: 30,
      timeZone: 'America/Los_Angeles',
    })
    const later = ZonedDateTime.from(
      { year: 2026, month: 11, day: 1, hour: 1, minute: 30, timeZone: 'America/Los_Angeles' },
      { disambiguation: 'later' },
    )
    expect(earlier.toDate().toISOString()).toBe('2026-11-01T08:30:00.000Z')
    expect(later.toDate().toISOString()).toBe('2026-11-01T09:30:00.000Z')
    expect(() => ZonedDateTime.from(
      { year: 2026, month: 3, day: 8, hour: 2, minute: 30, timeZone: 'America/Los_Angeles' },
      { disambiguation: 'reject' },
    )).toThrow(RangeError)
  })

  it('withTimeZone 保持时间点，withPlainDateTime 保持时区并重算时间点', () => {
    const shanghai = ZonedDateTime.from('2026-01-01T08:00:00+08:00[Asia/Shanghai]')
    const losAngeles = shanghai.withTimeZone('America/Los_Angeles')
    expect(losAngeles.epochMilliseconds).toBe(shanghai.epochMilliseconds)
    expect(losAngeles.toPlainDateTime().toString()).toBe('2025-12-31T16:00:00')

    const moved = losAngeles.withPlainDateTime({ year: 2026, month: 1, day: 1, hour: 9 })
    expect(moved.timeZoneId).toBe('America/Los_Angeles')
    expect(moved.toDate().toISOString()).toBe('2026-01-01T17:00:00.000Z')
  })

  it('字符串偏移量必须与 IANA 时区在该时刻的真实偏移一致', () => {
    expect(ZonedDateTime.from('2026-07-01T12:30:00-04:00[America/New_York]').offset).toBe('-04:00')
    expect(() => ZonedDateTime.from('2026-07-01T12:30:00-05:00[America/New_York]')).toThrow(RangeError)
    expect(() => ZonedDateTime.from('2026-07-01T12:30:00[Mars/Olympus]')).toThrow(RangeError)
    expect(() => ZonedDateTime.from('2026-07-01T12:30:00')).toThrow(RangeError)
  })

  it('输出包含偏移与时区，JSON 可无损回读', () => {
    const value = ZonedDateTime.fromDate(Date.UTC(2026, 0, 1, 0, 0, 0, 7), 'Asia/Kathmandu')
    expect(value.toString()).toBe('2026-01-01T05:45:00.007+05:45[Asia/Katmandu]')
    expect(ZonedDateTime.from(JSON.parse(JSON.stringify(value))).equals(value)).toBe(true)
    expect(value.year).toBe(2026)
    expect(value.minute).toBe(45)
    expect(Object.isFrozen(value)).toBe(true)
    expect(() => (value as unknown as number) + 1).toThrow(TypeError)
  })

  it('偏移格式保留历史秒与毫秒，非法精度拒绝', () => {
    expect(formatTimeZoneOffset(8 * 3_600_000 + 5 * 60_000 + 43_000)).toBe('+08:05:43')
    expect(formatTimeZoneOffset(-3_723_004)).toBe('-01:02:03.004')
    expect(() => formatTimeZoneOffset(0.5)).toThrow(RangeError)
    expect(() => new ZonedDateTime(0.5, 'UTC')).toThrow(RangeError)
  })

  it('可用时区显式包含 UTC 且返回冻结快照', () => {
    const zones = getAvailableTimeZones()
    expect(zones[0]).toBe('UTC')
    expect(zones).toContain('Asia/Shanghai')
    expect(Object.isFrozen(zones)).toBe(true)
  })
})
