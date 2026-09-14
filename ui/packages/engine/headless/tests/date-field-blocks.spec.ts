import { CalendarDate } from '@internationalized/date'
import { describe, expect, it } from 'vitest'
import {
  applyDayPeriod,
  blockRange,
  blocksFilled,
  blocksReference,
  blocksToDate,
  blocksToIso,
  constrainBlocks,
  hasTimeSegment,
  isoToBlocks,
  isoWeekOf,
  isoWeeksInYear,
  isoWeekStart,
  monthToQuarter,
  normalizeSegmentSet,
  pickBlocks,
  quarterToMonth,
  splitDayPeriod,
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
    // 周一起算（en-GB）时 2026 年是 53 周年：1 月 1 日是周四
    expect(isoWeeksInYear(2026, 'en-GB')).toBe(53)
    expect(isoWeeksInYear(2025, 'en-GB')).toBe(52)
    // 年还没填时给上界，免得把可选值先限死
    expect(isoWeeksInYear(undefined, 'en-GB')).toBe(53)
  })

  it('周数随 locale 变：周首日不同，同一年跨的周数就不同', () => {
    // 周日起算（en-US）与周一起算（en-GB / zh-CN）在同一年上给出的周数不同，
    // 拿写死的口径算上界会让最后一周翻到下一年去
    expect(isoWeeksInYear(2026, 'en-US')).toBe(52)
    expect(isoWeeksInYear(2026, 'en-GB')).toBe(53)
    expect(isoWeeksInYear(2025, 'en-US')).toBe(53)
    expect(isoWeeksInYear(2025, 'en-GB')).toBe(52)
  })

  it('上界与往返口径一致：末周推回去还是末周，不许翻到下一年', () => {
    for (const locale of [ZH, 'en-GB', 'en-US']) {
      for (const year of [2024, 2025, 2026, 2027]) {
        const last = isoWeeksInYear(year, locale)
        expect(isoWeekOf(isoWeekStart(year, last, locale), locale)).toBe(last)
      }
    }
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

  it('上下午从小时推，小时落 12 时制的那个数', () => {
    // 21 点在带上下午的段集里显示成「09 下午」，不是「21 下午」
    expect(isoToBlocks('2026-08-17T21:30', ['hour', 'minute', 'dayPeriod'], ZH))
      .toEqual({ hour: 9, minute: 30, dayPeriod: 1 })
    expect(isoToBlocks('2026-08-17T09:30', ['hour', 'dayPeriod'], ZH))
      .toEqual({ hour: 9, dayPeriod: 0 })
    // 0 点与 12 点都显示 12，靠上下午分辨
    expect(isoToBlocks('2026-08-17T00:00', ['hour', 'dayPeriod'], ZH))
      .toEqual({ hour: 12, dayPeriod: 0 })
    expect(isoToBlocks('2026-08-17T12:00', ['hour', 'dayPeriod'], ZH))
      .toEqual({ hour: 12, dayPeriod: 1 })
  })

  it('段集里没有上下午时小时仍是 24 时制的', () => {
    expect(isoToBlocks('2026-08-17T21:30', ['hour', 'minute'], ZH))
      .toEqual({ hour: 21, minute: 30 })
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

  it('对 24 时制的小时重复施加也不漂', () => {
    // 21 点配下午还是 21 点：段位里存的是 12 时制的 9，但存成 21 也算得对
    expect(applyDayPeriod(21, 1)).toBe(21)
    expect(applyDayPeriod(applyDayPeriod(9, 1), 1)).toBe(21)
  })

  it('splitDayPeriod 是它的逆：24 时制 → 12 时制那个数 + 上下午', () => {
    expect(splitDayPeriod(0)).toEqual({ hour: 12, dayPeriod: 0 })
    expect(splitDayPeriod(9)).toEqual({ hour: 9, dayPeriod: 0 })
    expect(splitDayPeriod(12)).toEqual({ hour: 12, dayPeriod: 1 })
    expect(splitDayPeriod(21)).toEqual({ hour: 9, dayPeriod: 1 })
    for (let hour = 0; hour < 24; hour++) {
      const half = splitDayPeriod(hour)
      expect(applyDayPeriod(half.hour, half.dayPeriod)).toBe(hour)
    }
  })
})

describe('块的取值区间', () => {
  const opts = (set: readonly ('year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'dayPeriod')[]) =>
    ({ set, locale: ZH })

  it('季度四档、上下午两档', () => {
    expect(blockRange('quarter', {}, opts(['year', 'quarter']))).toEqual({ min: 1, max: 4 })
    expect(blockRange('dayPeriod', {}, opts(['hour', 'dayPeriod']))).toEqual({ min: 0, max: 1 })
  })

  it('周的上界随年变，年没填时放到 53', () => {
    expect(blockRange('week', { year: 2026 }, opts(['year', 'week']))).toEqual({ min: 1, max: 53 })
    expect(blockRange('week', { year: 2025 }, opts(['year', 'week']))).toEqual({ min: 1, max: 52 })
    expect(blockRange('week', {}, opts(['year', 'week']))).toEqual({ min: 1, max: 53 })
  })

  it('周的上界也随 locale 变', () => {
    expect(blockRange('week', { year: 2026 }, { set: ['year', 'week'], locale: 'en-US' }))
      .toEqual({ min: 1, max: 52 })
  })

  it('段集里带上下午时小时收 1-12，不带时不归块管', () => {
    expect(blockRange('hour', {}, opts(['hour', 'dayPeriod']))).toEqual({ min: 1, max: 12 })
    expect(blockRange('hour', {}, opts(['hour', 'minute']))).toBeNull()
  })

  it('不归块管的段一律给 null，由原有的天然区间接手', () => {
    for (const type of ['year', 'month', 'day', 'minute', 'second'] as const)
      expect(blockRange(type, { year: 2026, month: 2 }, opts(['year', 'month', 'day']))).toBeNull()
  })
})

describe('段集换掉与收敛', () => {
  it('pickBlocks 只留新段集要的那几块', () => {
    expect(pickBlocks({ year: 2026, month: 8, day: 17 }, ['year', 'quarter'])).toEqual({ year: 2026 })
    expect(pickBlocks({ year: 2026, month: 8 }, ['year', 'month'])).toEqual({ year: 2026, month: 8 })
    // 显式写成 undefined 的键不算填了
    expect(pickBlocks({ year: 2026, month: undefined }, ['year', 'month'])).toEqual({ year: 2026 })
  })

  it('constrainBlocks 把周序号夹进当年的周数', () => {
    // 2025 只有 52 周（周一起算），第 53 周会翻到 2026 年去
    expect(constrainBlocks({ year: 2025, week: 53 }, ['year', 'week'], ZH)).toEqual({ year: 2025, week: 52 })
    // 站得住的原样返回（同一个引用，省掉一次无谓的写）
    const ok = { year: 2026, week: 53 }
    expect(constrainBlocks(ok, ['year', 'week'], ZH)).toBe(ok)
    // 段集里没有周时不插手
    const spare = { year: 2025, week: 53 }
    expect(constrainBlocks(spare, ['year', 'month'], ZH)).toBe(spare)
  })

  it('blocksReference 把参照日换到块空间', () => {
    const today = { year: 2026, month: 8, day: 17, hour: 0, minute: 0, second: 0 }
    expect(blocksReference(today, ['year', 'quarter'], ZH)).toMatchObject({ quarter: 3 })
    expect(blocksReference(today, ['year', 'week'], ZH)).toMatchObject({ week: 34 })
    // 带上下午时零点的参照位是 12 上午，不是 0
    expect(blocksReference(today, ['hour', 'dayPeriod'], ZH)).toMatchObject({ hour: 12, dayPeriod: 0 })
    // 段集里没有新块时原样返回，granularity 那条老路一步不差
    expect(blocksReference(today, ['year', 'month', 'day', 'hour'], ZH)).toBe(today)
  })
})
