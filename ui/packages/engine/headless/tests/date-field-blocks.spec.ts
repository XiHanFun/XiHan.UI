import { CalendarDate } from '@internationalized/date'
import { describe, expect, it } from 'vitest'
import {
  applyDayPeriod,
  blocksFilled,
  blocksToDate,
  blocksToIso,
  hasTimeSegment,
  isoToBlocks,
  isoWeekOf,
  isoWeeksInYear,
  isoWeekStart,
  monthToQuarter,
  normalizeSegmentSet,
  quarterToMonth,
} from '../src/date-field/date-field.blocks'

const ZH = 'zh-CN'

describe('段集归一', () => {
  it('去重并按「粗 → 细」排，作者乱序写也排得回来', () => {
    expect(normalizeSegmentSet(['day', 'year', 'month'])).toEqual(['year', 'month', 'day'])
    expect(normalizeSegmentSet(['year', 'year', 'month'])).toEqual(['year', 'month'])
    expect(normalizeSegmentSet(['dayPeriod', 'minute', 'hour'])).toEqual(['hour', 'minute', 'dayPeriod'])
  })

  it('季度与月同时写时留月：细的表达力更强，季度本就能由月推出来', () => {
    expect(normalizeSegmentSet(['year', 'quarter', 'month'])).toEqual(['year', 'month'])
  })

  it('周与日同时写时留日，同理', () => {
    expect(normalizeSegmentSet(['year', 'week', 'day'])).toEqual(['year', 'day'])
  })

  it('只带日期段时不输出时刻', () => {
    expect(hasTimeSegment(['year', 'month', 'day'])).toBe(false)
    // 上下午自己不是时刻段，它只改写小时
    expect(hasTimeSegment(['year', 'dayPeriod'])).toBe(false)
    expect(hasTimeSegment(['hour'])).toBe(true)
  })
})

describe('季度与月互推', () => {
  it('季度取那一季的头一个月', () => {
    expect([1, 2, 3, 4].map(quarterToMonth)).toEqual([1, 4, 7, 10])
  })

  it('月落在第几季', () => {
    expect([1, 3, 4, 6, 7, 9, 10, 12].map(monthToQuarter)).toEqual([1, 1, 2, 2, 3, 3, 4, 4])
  })

  it('两条互为逆运算：一季之内的任何一个月都推回同一季', () => {
    for (let month = 1; month <= 12; month++)
      expect(quarterToMonth(monthToQuarter(month))).toBeLessThanOrEqual(month)
  })
})

describe('iSO 周与日期互推', () => {
  it('周序号 → 周首日；再推回去是同一个周号', () => {
    expect(isoWeekStart(2026, 33, ZH).toString()).toBe('2026-08-10')
    expect(isoWeekOf(isoWeekStart(2026, 33, ZH), ZH)).toBe(33)
  })

  it('一周之内的任何一天都算同一个周号', () => {
    const start = isoWeekStart(2026, 33, ZH)
    for (let offset = 0; offset < 7; offset++)
      expect(isoWeekOf(start.add({ days: offset }), ZH)).toBe(33)
  })

  it('第 1 周必定含 1 月 4 日', () => {
    for (const year of [2024, 2025, 2026, 2027]) {
      const start = isoWeekStart(year, 1, ZH)
      const end = start.add({ days: 6 })
      // 起点可能落在上一年（2026 第 1 周从 2025-12-29 起），不能拿 start.set 造 1 月 4 日
      const jan4 = new CalendarDate(year, 1, 4)
      expect(start.compare(jan4) <= 0 && end.compare(jan4) >= 0).toBe(true)
    }
  })

  it('一年 52 周还是 53 周算得出来', () => {
    // 2026 年是 53 周年（1 月 1 日是周四）
    expect(isoWeeksInYear(2026)).toBe(53)
    expect(isoWeeksInYear(2025)).toBe(52)
    // 年还没填时给上界，免得把可选值先限死
    expect(isoWeeksInYear(undefined)).toBe(53)
  })
})

describe('段集 → 日期', () => {
  it('缺的粗段按「那一段的头」补', () => {
    expect(blocksToDate({ year: 2026 }, ['year'], ZH)!.toString()).toBe('2026-01-01')
    expect(blocksToDate({ year: 2026, month: 8 }, ['year', 'month'], ZH)!.toString()).toBe('2026-08-01')
  })

  it('年 + 季度落在那一季的头一天', () => {
    expect(blocksToDate({ year: 2026, quarter: 2 }, ['year', 'quarter'], ZH)!.toString()).toBe('2026-04-01')
    expect(blocksToDate({ year: 2026, quarter: 4 }, ['year', 'quarter'], ZH)!.toString()).toBe('2026-10-01')
  })

  it('年 + 周落在那一周的周首日，跨年也对', () => {
    expect(blocksToDate({ year: 2026, week: 33 }, ['year', 'week'], ZH)!.toString()).toBe('2026-08-10')
    // 2026 第 1 周从 2025-12-29 起
    expect(blocksToDate({ year: 2026, week: 1 }, ['year', 'week'], ZH)!.toString()).toBe('2025-12-29')
  })

  it('缺必填段给 null，不猜', () => {
    expect(blocksToDate({ month: 8 }, ['year', 'month'], ZH)).toBeNull()
    expect(blocksToDate({ year: 2026 }, ['year', 'week'], ZH)).toBeNull()
  })
})

describe('填齐判定', () => {
  it('上下午不算必填：缺席就是上午', () => {
    expect(blocksFilled({ hour: 9 }, ['hour', 'dayPeriod'])).toBe(true)
    expect(blocksFilled({}, ['hour', 'dayPeriod'])).toBe(false)
  })

  it('互斥掉的那一段不再要求填', () => {
    // 季度被月挤掉了，只填年月即算齐
    expect(blocksFilled({ year: 2026, month: 8 }, ['year', 'quarter', 'month'])).toBe(true)
  })
})

describe('段集 → ISO 串', () => {
  it('只有日期段时给纯日期串', () => {
    expect(blocksToIso({ year: 2026, quarter: 2 }, ['year', 'quarter'], ZH)).toBe('2026-04-01')
    expect(blocksToIso({ year: 2026, week: 33 }, ['year', 'week'], ZH)).toBe('2026-08-10')
    expect(blocksToIso({ year: 2026 }, ['year'], ZH)).toBe('2026-01-01')
  })

  it('精细程度只看段集里最细的那个时刻段', () => {
    const base = { year: 2026, month: 8, day: 17, hour: 14, minute: 30, second: 45 }
    expect(blocksToIso(base, ['year', 'month', 'day', 'hour'], ZH)).toBe('2026-08-17T14')
    expect(blocksToIso(base, ['year', 'month', 'day', 'hour', 'minute'], ZH)).toBe('2026-08-17T14:30')
    expect(blocksToIso(base, ['year', 'month', 'day', 'hour', 'minute', 'second'], ZH)).toBe('2026-08-17T14:30:45')
  })

  it('只要时刻段也成立：日期缺席按年初补', () => {
    expect(blocksToIso({ year: 2026, hour: 9, minute: 5 }, ['year', 'hour', 'minute'], ZH)).toBe('2026-01-01T09:05')
  })

  it('上下午改写小时：12 AM 是 0 点、12 PM 是 12 点', () => {
    const set = ['year', 'month', 'day', 'hour', 'dayPeriod'] as const
    const at = (hour: number, dayPeriod: number): string | null =>
      blocksToIso({ year: 2026, month: 8, day: 17, hour, dayPeriod }, set, ZH)
    expect(at(9, 0)).toBe('2026-08-17T09')
    expect(at(9, 1)).toBe('2026-08-17T21')
    expect(at(12, 0)).toBe('2026-08-17T00')
    expect(at(12, 1)).toBe('2026-08-17T12')
  })

  it('缺段给 null', () => {
    expect(blocksToIso({ year: 2026 }, ['year', 'month'], ZH)).toBeNull()
  })
})

describe('iSO 串 → 段集', () => {
  it('要哪块派生哪块', () => {
    expect(isoToBlocks('2026-08-17', ['year', 'quarter'], ZH)).toEqual({ year: 2026, quarter: 3 })
    expect(isoToBlocks('2026-08-17', ['year', 'week'], ZH)).toEqual({ year: 2026, week: 34 })
    expect(isoToBlocks('2026-08-17', ['year', 'month'], ZH)).toEqual({ year: 2026, month: 8 })
  })

  it('上下午从小时推', () => {
    expect(isoToBlocks('2026-08-17T21:30', ['hour', 'minute', 'dayPeriod'], ZH))
      .toEqual({ hour: 21, minute: 30, dayPeriod: 1 })
    expect(isoToBlocks('2026-08-17T09:30', ['hour', 'dayPeriod'], ZH))
      .toEqual({ hour: 9, dayPeriod: 0 })
  })

  it('写坏的串给空段集，不抛', () => {
    expect(isoToBlocks('不是日期', ['year', 'month'], ZH)).toEqual({})
    expect(isoToBlocks(null, ['year'], ZH)).toEqual({})
    expect(isoToBlocks(undefined, ['year'], ZH)).toEqual({})
  })
})

describe('往返一致', () => {
  it('季度、周、年月日、时分秒各自都能原样往返', () => {
    const cases: { iso: string, set: readonly ('year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'dayPeriod')[] }[] = [
      { iso: '2026-04-01', set: ['year', 'quarter'] },
      { iso: '2026-10-01', set: ['year', 'quarter'] },
      { iso: '2026-08-10', set: ['year', 'week'] },
      { iso: '2026-08-01', set: ['year', 'month'] },
      { iso: '2026-08-17', set: ['year', 'month', 'day'] },
      { iso: '2026-08-17T14:30', set: ['year', 'month', 'day', 'hour', 'minute'] },
      { iso: '2026-08-17T21', set: ['year', 'month', 'day', 'hour', 'dayPeriod'] },
    ]
    for (const { iso, set } of cases)
      expect(blocksToIso(isoToBlocks(iso, set, ZH), set, ZH)).toBe(iso)
  })
})

describe('applyDayPeriod', () => {
  it('没给上下午时小时原样不动', () => {
    expect(applyDayPeriod(21, undefined)).toBe(21)
  })
})
