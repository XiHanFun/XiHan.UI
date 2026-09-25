import { describe, expect, it } from 'vitest'
import { createTimeIntervalSet, localCalendar, localIntervals, timeTickInterval, timeTicks, utcCalendar, utcIntervals } from '../src'
import { forAll, integer } from './helpers/property'
import { zonedCalendar } from './helpers/zoned-calendar'

const U = (y: number, m: number, d: number, h = 0, mi = 0, s = 0, ms = 0): Date => new Date(Date.UTC(y, m, d, h, mi, s, ms))
const iso = (dates: Date[]): string[] => dates.map(d => d.toISOString())

const ny = zonedCalendar('America/New_York')
const nyIntervals = createTimeIntervalSet(ny)
const nyAt = (y: number, m: number, d: number, h = 0, mi = 0): Date => new Date(ny.fromWall(y, m, d, h, mi))
const nyHour = (d: Date): number => ny.toWall(+d).hour

describe('日历', () => {
  it('uTC 日历的年份 0–99 按字面年份处理', () => {
    const time = utcCalendar.fromWall(50, 0, 1)
    expect(new Date(time).getUTCFullYear()).toBe(50)
    expect(utcCalendar.toWall(time)).toMatchObject({ year: 50, month: 0, day: 1 })
  })

  it('字段越界时进位', () => {
    expect(new Date(utcCalendar.fromWall(2025, 12, 1)).toISOString()).toBe('2026-01-01T00:00:00.000Z')
    expect(new Date(utcCalendar.fromWall(2026, 2, 0)).toISOString()).toBe('2026-02-28T00:00:00.000Z')
  })

  it('本地日历往返不丢字段', () => {
    const time = localCalendar.fromWall(2026, 8, 26, 13, 45, 7, 123)
    expect(localCalendar.toWall(time)).toMatchObject({ year: 2026, month: 8, day: 26, hour: 13, minute: 45, second: 7, millisecond: 123 })
  })
})

describe('时间间隔', () => {
  const { day, hour, minute, month, second, week, year, millisecond } = utcIntervals

  it('floor / ceil / round 落在边界上，边界本身取整不变', () => {
    const t = U(2026, 8, 26, 13, 45)
    expect(day.floor(t)).toEqual(U(2026, 8, 26))
    expect(day.ceil(t)).toEqual(U(2026, 8, 27))
    expect(day.round(t)).toEqual(U(2026, 8, 27))
    expect(day.round(U(2026, 8, 26, 11))).toEqual(U(2026, 8, 26))
    expect(day.ceil(U(2026, 8, 26))).toEqual(U(2026, 8, 26))
    expect(day.round(U(2026, 8, 26, 12))).toEqual(U(2026, 8, 27))
  })

  it('不修改传入的日期', () => {
    const t = U(2026, 8, 26, 13)
    day.floor(t)
    day.offset(t, 3)
    expect(t).toEqual(U(2026, 8, 26, 13))
  })

  it('offset 保留零头，步数小数向下取整，可为负', () => {
    expect(day.offset(U(2026, 8, 26, 13), 2)).toEqual(U(2026, 8, 28, 13))
    expect(day.offset(U(2026, 8, 26), 1.9)).toEqual(U(2026, 8, 27))
    expect(hour.offset(U(2026, 8, 26, 1), -3)).toEqual(U(2026, 8, 25, 22))
  })

  it('range 是左闭右开的边界序列', () => {
    expect(iso(day.range(U(2026, 8, 26, 1), U(2026, 8, 29)))).toEqual(['2026-09-27T00:00:00.000Z', '2026-09-28T00:00:00.000Z'])
    expect(day.range(U(2026, 8, 26), U(2026, 8, 26))).toEqual([])
    expect(day.range(U(2026, 8, 29), U(2026, 8, 26))).toEqual([])
    expect(iso(month.range(U(2026, 10, 15), U(2027, 2, 1)))).toEqual(['2026-12-01T00:00:00.000Z', '2027-01-01T00:00:00.000Z', '2027-02-01T00:00:00.000Z'])
  })

  it('count 是 start 之后、end 及以前的边界个数', () => {
    expect(day.count(U(2026, 8, 26, 23), U(2026, 8, 28, 1))).toBe(2)
    expect(month.count(U(2025, 10, 30), U(2026, 1, 1))).toBe(3)
    expect(year.count(U(2020, 5, 1), U(2026, 0, 1))).toBe(6)
  })

  it('闰年：2 月 28 日到 3 月 1 日在闰年相隔两天', () => {
    expect(day.count(U(2024, 1, 28), U(2024, 2, 1))).toBe(2)
    expect(day.count(U(2023, 1, 28), U(2023, 2, 1))).toBe(1)
    expect(iso(day.range(U(2024, 1, 28), U(2024, 2, 2)))).toHaveLength(3)
  })

  it('周按首日取整，首日必须是 0–6', () => {
    const thursday = U(2026, 8, 24, 10)
    expect(week(1).floor(thursday)).toEqual(U(2026, 8, 21))
    expect(week(0).floor(thursday)).toEqual(U(2026, 8, 20))
    expect(week(1).count(U(2026, 8, 21), U(2026, 9, 5))).toBe(2)
    expect(week(1)).toBe(week(1))
    expect(() => week(7)).toThrow(/周首日/)
  })

  it('every 按上一级里的序号取余', () => {
    expect(iso(minute.every(15)!.range(U(2026, 8, 26, 10, 7), U(2026, 8, 26, 11, 1)))).toEqual([
      '2026-09-26T10:15:00.000Z',
      '2026-09-26T10:30:00.000Z',
      '2026-09-26T10:45:00.000Z',
      '2026-09-26T11:00:00.000Z',
    ])
    // 每两日在月初重新起算：31 日之后是下月 1 日
    expect(iso(day.every(2)!.range(U(2026, 0, 29), U(2026, 1, 4)))).toEqual([
      '2026-01-29T00:00:00.000Z',
      '2026-01-31T00:00:00.000Z',
      '2026-02-01T00:00:00.000Z',
      '2026-02-03T00:00:00.000Z',
    ])
    expect(year.every(5)!.floor(U(2027, 6, 1))).toEqual(U(2025, 0, 1))
    expect(millisecond.every(250)!.floor(new Date(1_000_380))).toEqual(new Date(1_000_250))
    expect(second.every(10)!.offset(U(2026, 8, 26, 0, 0, 20), 2)).toEqual(U(2026, 8, 26, 0, 0, 40))
    expect(minute.every(15)!.count(U(2026, 8, 26, 10), U(2026, 8, 26, 11))).toBe(4)
  })

  it('every 的步数不是正整数时为 null，1 就是原间隔', () => {
    expect(day.every(0)).toBeNull()
    expect(day.every(Number.NaN)).toBeNull()
    expect(day.every(1)!.floor(U(2026, 8, 26, 5))).toEqual(U(2026, 8, 26))
  })

  it('无效日期立即报错', () => {
    expect(() => day.floor(new Date(Number.NaN))).toThrow(/有效日期/)
    expect(() => day.offset(U(2026, 0, 1), Number.POSITIVE_INFINITY)).toThrow(/有限数/)
  })

  it('本地间隔与 UTC 间隔在本地日历上各自取整', () => {
    const t = new Date(localCalendar.fromWall(2026, 8, 26, 13, 45))
    expect(localCalendar.toWall(+localIntervals.day.floor(t))).toMatchObject({ day: 26, hour: 0, minute: 0 })
    expect(localCalendar.toWall(+localIntervals.hour.floor(t))).toMatchObject({ hour: 13, minute: 0 })
  })

  it('性质：floor ≤ date ≤ ceil，二者都是边界，且 offset(floor, 1) 不早于 ceil', () => {
    const names = ['second', 'minute', 'hour', 'day', 'month', 'year'] as const
    forAll(600, 23, random => ({
      time: integer(random, -2_000_000_000, 4_000_000_000) * 1000 + integer(random, 0, 999),
      name: names[integer(random, 0, names.length - 1)] as typeof names[number],
    }), ({ time, name }) => {
      const interval = utcIntervals[name]
      const date = new Date(time)
      const low = interval.floor(date)
      const high = interval.ceil(date)
      expect(+low).toBeLessThanOrEqual(time)
      expect(+high).toBeGreaterThanOrEqual(time)
      expect(+interval.floor(low)).toBe(+low)
      expect(+interval.floor(high)).toBe(+high)
      expect(+interval.offset(low, 1)).toBeGreaterThanOrEqual(+high)
    })
  })
})

describe('夏令时', () => {
  it('日按日历推进：夏令时开始的那天只有 23 小时，刻度仍在当地零点', () => {
    const days = nyIntervals.day.range(nyAt(2026, 2, 7), nyAt(2026, 2, 10))
    expect(days.map(nyHour)).toEqual([0, 0, 0])
    expect((+days[2]! - +days[1]!) / 3_600_000).toBe(23)
    expect(nyIntervals.day.count(nyAt(2026, 2, 7), nyAt(2026, 2, 10))).toBe(3)
  })

  it('日偏移保留墙上时间', () => {
    const noon = nyAt(2026, 2, 7, 12)
    const next = nyIntervals.day.offset(noon, 1)
    expect(ny.toWall(+next)).toMatchObject({ day: 8, hour: 12 })
    expect((+next - +noon) / 3_600_000).toBe(23)
  })

  it('时按绝对时长推进：跳过的 2 点不出现，重复的 1 点出现两次', () => {
    expect(nyIntervals.hour.range(nyAt(2026, 2, 8, 0), nyAt(2026, 2, 8, 4)).map(nyHour)).toEqual([0, 1, 3])
    expect(nyIntervals.hour.range(nyAt(2026, 10, 1, 0), nyAt(2026, 10, 1, 3)).map(nyHour)).toEqual([0, 1, 1, 2])
  })

  it('重复的那一小时里取整到本次的整点，而不是前一次', () => {
    const second130 = new Date(+nyAt(2026, 10, 1, 1, 30) + 3_600_000)
    expect(ny.toWall(+second130)).toMatchObject({ hour: 1, minute: 30 })
    expect(+second130 - +nyIntervals.hour.floor(second130)).toBe(30 * 60_000)
  })

  it('周与月在夏令时切换处仍落在当地零点', () => {
    expect(nyHour(nyIntervals.week(1).ceil(nyAt(2026, 2, 7)))).toBe(0)
    expect(nyIntervals.month.range(nyAt(2026, 1, 15), nyAt(2026, 11, 15)).map(nyHour)).toEqual(Array.from<number>({ length: 10 }).fill(0))
  })
})

describe('时间刻度', () => {
  it('一天分十格取 3 小时', () => {
    const chosen = timeTickInterval(U(2026, 8, 26), U(2026, 8, 27), 10, utcIntervals)
    expect(chosen?.name).toBe('hour')
    expect(timeTicks(U(2026, 8, 26), U(2026, 8, 27), 10, utcIntervals).map(d => d.getUTCHours())).toEqual([0, 3, 6, 9, 12, 15, 18, 21, 0])
  })

  it('跨度超过一年时按年数取刻度步长', () => {
    const out = timeTicks(U(2020, 0, 1), U(2030, 0, 1), 5, utcIntervals)
    expect(out.map(d => d.getUTCFullYear())).toEqual([2020, 2022, 2024, 2026, 2028, 2030])
    expect(timeTickInterval(U(2020, 0, 1), U(2030, 0, 1), 5, utcIntervals)?.name).toBe('year')
  })

  it('不足一秒时按毫秒取刻度步长', () => {
    const out = timeTicks(new Date(0), new Date(1000), 5, utcIntervals)
    expect(out.map(d => +d)).toEqual([0, 200, 400, 600, 800, 1000])
    expect(timeTickInterval(new Date(0), new Date(1000), 5, utcIntervals)?.name).toBe('millisecond')
  })

  it('周刻度缺省从星期一开始，可以改成星期日', () => {
    const start = U(2026, 8, 1)
    const stop = U(2026, 9, 31)
    expect(timeTickInterval(start, stop, 9, utcIntervals)?.name).toBe('week')
    expect(timeTicks(start, stop, 9, utcIntervals).every(d => d.getUTCDay() === 1)).toBe(true)
    expect(timeTicks(start, stop, 9, utcIntervals, { firstDayOfWeek: 0 }).every(d => d.getUTCDay() === 0)).toBe(true)
  })

  it('反向区间得到降序刻度；count ≤ 0 没有刻度', () => {
    expect(timeTicks(U(2026, 8, 27), U(2026, 8, 26), 4, utcIntervals)).toEqual(timeTicks(U(2026, 8, 26), U(2026, 8, 27), 4, utcIntervals).reverse())
    expect(timeTicks(U(2026, 8, 26), U(2026, 8, 27), 0, utcIntervals)).toEqual([])
    expect(timeTickInterval(U(2026, 8, 26), U(2026, 8, 27), 0, utcIntervals)).toBeNull()
  })

  it('性质：刻度升序、落在区间内，每个刻度都是所选间隔的边界', () => {
    forAll(400, 29, (random) => {
      const start = integer(random, 0, 2_000_000_000) * 1000
      const span = 10 ** (integer(random, 2, 11) + random())
      return { start, stop: start + Math.round(span), count: integer(random, 2, 15) }
    }, ({ start, stop, count }) => {
      const out = timeTicks(new Date(start), new Date(stop), count, utcIntervals)
      const chosen = timeTickInterval(new Date(start), new Date(stop), count, utcIntervals)!
      out.forEach((tick, i) => {
        expect(+tick).toBeGreaterThanOrEqual(start)
        expect(+tick).toBeLessThanOrEqual(stop)
        expect(+chosen.interval.floor(tick)).toBe(+tick)
        if (i > 0)
          expect(+tick).toBeGreaterThan(+out[i - 1]!)
      })
      expect(out.length).toBeLessThanOrEqual(count * 4 + 2)
    })
  })
})
