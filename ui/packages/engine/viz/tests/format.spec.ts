import { describe, expect, it } from 'vitest'
import { createDurationFormat, createNumberFormat, createTimeFormat, isVizError, roundToTotal, tickFormat, ticks, tickStep } from '../src'
import { between, forAll, integer, magnitude } from './helpers/property'

/** ICU 在时间与 AM/PM 之间用窄不换行空格，统一成普通空格再比较。 */
const plain = (text: string): string => text.replace(/\s/g, ' ')

describe('数字格式', () => {
  it('按语言与样式格式化', () => {
    expect(createNumberFormat('en-US')(1234.5)).toBe('1,234.5')
    expect(createNumberFormat('en-US', { style: 'percent' })(0.256)).toBe('26%')
    expect(createNumberFormat('en-US', { style: 'currency', currency: 'USD' })(1234.5)).toBe('$1,234.50')
    expect(createNumberFormat('en-US', { style: 'unit', unit: 'kilobyte' })(12)).toBe('12 kB')
  })

  it('紧凑记数直接用 Intl：中文按万、亿，英文按 K、M', () => {
    expect(createNumberFormat('zh-CN', { notation: 'compact' })(12000)).toBe('1.2万')
    expect(createNumberFormat('zh-CN', { notation: 'compact' })(340000000)).toBe('3.4亿')
    expect(createNumberFormat('en-US', { notation: 'compact' })(12000)).toBe('12K')
  })

  it('显式精度：固定小数位补零，有效数字不补零', () => {
    expect(createNumberFormat('en-US', { precision: { type: 'fixed', digits: 2 } })(3)).toBe('3.00')
    expect(createNumberFormat('en-US', { precision: { type: 'significant', digits: 3 } })(1234.5)).toBe('1,230')
    expect(createNumberFormat('en-US', { signDisplay: 'always' })(5)).toBe('+5')
  })

  it('参数不合法时抛 VizError', () => {
    expect(() => createNumberFormat('en-US', { style: 'currency' })).toThrow(/currency/)
    expect(() => createNumberFormat('en-US', { style: 'unit' })).toThrow(/unit/)
    expect(() => createNumberFormat('en-US', { precision: { type: 'fixed', digits: -1 } })).toThrow(/精度/)
    expect(() => createNumberFormat('en-US', { precision: { type: 'significant', digits: 0 } })).toThrow(/有效数字/)
    try {
      createNumberFormat('not a locale!')
      expect.unreachable()
    }
    catch (error) {
      expect(isVizError(error)).toBe(true)
    }
  })
})

describe('刻度格式', () => {
  it('小数位由步长推导，同一根轴上位数一致', () => {
    const format = tickFormat(0.5, 'en-US')
    expect([0, 0.5, 1].map(format)).toEqual(['0.0', '0.5', '1.0'])
    expect([0, 5, 10].map(tickFormat(5, 'en-US'))).toEqual(['0', '5', '10'])
    expect(tickFormat(0.05, 'en-US')(0.15)).toBe('0.15')
    expect(tickFormat(0.001, 'en-US')(0.004)).toBe('0.004')
  })

  it('百分比先乘 100 再推导', () => {
    expect(tickFormat(0.1, 'en-US', { style: 'percent' })(0.3)).toBe('30%')
    expect(tickFormat(0.025, 'en-US', { style: 'percent' })(0.075)).toBe('7.5%')
  })

  it('货币的小数位同样跟着步长走', () => {
    expect(tickFormat(500, 'en-US', { style: 'currency', currency: 'USD' })(1000)).toBe('$1,000')
    expect(tickFormat(0.5, 'en-US', { style: 'currency', currency: 'USD' })(1)).toBe('$1.0')
  })

  it('紧凑记数按每个值与步长的数量级之差取有效数字', () => {
    const format = tickFormat(2500, 'en-US', { notation: 'compact' })
    expect([0, 2500, 10000, 12500].map(format)).toEqual(['0', '2.5K', '10K', '12.5K'])
    expect(tickFormat(20000, 'zh-CN', { notation: 'compact' })(60000)).toBe('6万')
  })

  it('步长为 0 时退回缺省格式；显式精度优先于推导', () => {
    expect(tickFormat(0, 'en-US')(1.25)).toBe('1.25')
    expect(tickFormat(0.5, 'en-US', { precision: { type: 'fixed', digits: 3 } })(1)).toBe('1.000')
  })

  it('性质：同一组刻度的标签两两不同', () => {
    forAll(500, 31, (random) => {
      const a = magnitude(random, -4, 8)
      return { a, b: a + Math.abs(a) * between(random, 0.01, 4), count: integer(random, 2, 12), compact: random() < 0.3 }
    }, ({ a, b, count, compact }) => {
      const values = ticks(a, b, count)
      const format = tickFormat(tickStep(a, b, count), 'en-US', compact ? { notation: 'compact' } : {})
      const labels = values.map(format)
      expect(new Set(labels).size).toBe(labels.length)
    })
  })
})

describe('最大余数取整', () => {
  it('三个三分之一取整后合计仍是 100，余数相同先给靠前的项', () => {
    expect(roundToTotal([1, 1, 1], 100, 0)).toEqual([34, 33, 33])
    expect(roundToTotal([33.333, 33.333, 33.334], 100, 0)).toEqual([33, 33, 34])
    expect(roundToTotal([1, 2, 3], 100, 1)).toEqual([16.7, 33.3, 50])
  })

  it('全部为 0 时全部取 0；负数与非有限数立即报错', () => {
    expect(roundToTotal([0, 0], 100, 0)).toEqual([0, 0])
    expect(() => roundToTotal([1, -1], 100, 0)).toThrow(/非负/)
    expect(() => roundToTotal([1, Number.NaN], 100, 0)).toThrow(/非负/)
    expect(() => roundToTotal([1], Number.POSITIVE_INFINITY, 0)).toThrow(/有限数/)
  })

  it('性质：取整后的合计恰为目标，每项与精确值相差不到一个最小单位', () => {
    forAll(1000, 37, random => ({
      values: Array.from({ length: integer(random, 1, 12) }, () => random() * 1000),
      digits: integer(random, 0, 2),
    }), ({ values, digits }) => {
      const out = roundToTotal(values, 100, digits)
      const scale = 10 ** digits
      expect(Math.round(out.reduce((a, b) => a + b, 0) * scale)).toBe(100 * scale)
      const sum = values.reduce((a, b) => a + b, 0)
      out.forEach((v, i) => expect(Math.abs(v - ((values[i] as number) / sum) * 100)).toBeLessThan(1 / scale + 1e-9))
    })
  })
})

describe('时间格式', () => {
  const utc = createTimeFormat('en-US', 'UTC')
  const at = (iso: string): Date => new Date(iso)

  it('刻度标签按日期落在的最粗一级边界显示', () => {
    expect(utc.tick(at('2026-01-01T00:00:00Z'), 'month')).toBe('2026')
    expect(utc.tick(at('2026-09-01T00:00:00Z'), 'month')).toBe('Sep')
    expect(utc.tick(at('2026-09-26T00:00:00Z'), 'day')).toBe('Sep 26')
    expect(plain(utc.tick(at('2026-09-26T15:00:00Z'), 'hour'))).toBe('3:00 PM')
    expect(utc.tick(at('2026-09-27T00:00:00Z'), 'hour')).toBe('Sep 27')
    expect(utc.tick(at('2026-09-26T15:04:05.250Z'), 'millisecond')).toBe('04:05.250')
  })

  it('刻度粒度比日期对齐的级别更粗时按刻度粒度显示', () => {
    expect(utc.tick(at('2026-09-26T00:00:00Z'), 'year')).toBe('2026')
  })

  it('完整标签带到指定粒度的全部字段', () => {
    expect(utc.full(at('2026-09-26T15:04:00Z'), 'day')).toBe('Sep 26, 2026')
    expect(utc.full(at('2026-09-26T15:04:00Z'), 'month')).toBe('September 2026')
    expect(createTimeFormat('zh-CN', 'UTC').full(at('2026-09-26T00:00:00Z'), 'month')).toBe('2026年9月')
  })

  it('时区决定刻度落在哪一级：UTC 零点在上海是早上 8 点', () => {
    const shanghai = createTimeFormat('en-US', 'Asia/Shanghai')
    expect(plain(shanghai.tick(at('2026-09-26T00:00:00Z'), 'hour'))).toBe('8:00 AM')
    expect(shanghai.tick(at('2026-09-25T16:00:00Z'), 'hour')).toBe('Sep 26')
  })

  it('非法时区、非法日期与未知粒度立即报错', () => {
    expect(() => createTimeFormat('en-US', 'Mars/Olympus')).toThrow(/时间格式/)
    expect(() => utc.tick(new Date(Number.NaN), 'day')).toThrow(/有效日期/)
    expect(() => utc.full(at('2026-09-26T00:00:00Z'), 'fortnight' as 'day')).toThrow(/粒度/)
  })
})

describe('时长格式', () => {
  const en = createDurationFormat('en-US', { day: '{n}d', hour: '{n}h', minute: '{n}m', second: '{n}s', millisecond: '{n}ms' })

  it('从最高的非零单位起取两个单位，零头舍去', () => {
    expect(en(90_061_000)).toBe('1d 1h')
    expect(en(3_723_000)).toBe('1h 2m')
    expect(en(86_400_000 + 5 * 60_000)).toBe('1d')
    expect(en(250)).toBe('250ms')
    expect(en(1500)).toBe('1s 500ms')
  })

  it('零、负数与更多单位', () => {
    expect(en(0)).toBe('0s')
    expect(en(-5000)).toBe('-5s')
    const three = createDurationFormat('en-US', { day: '{n}d', hour: '{n}h', minute: '{n}m', second: '{n}s', millisecond: '{n}ms' }, { maxUnits: 3 })
    expect(three(90_061_000)).toBe('1d 1h 1m')
  })

  it('单位文字与分隔来自调用方，数字按语言格式化', () => {
    const zh = createDurationFormat('zh-CN', { day: '{n}天', hour: '{n}小时', minute: '{n}分', second: '{n}秒', millisecond: '{n}毫秒', separator: '' })
    expect(zh(90_061_000)).toBe('1天1小时')
    expect(en(1234 * 86_400_000)).toBe('1,234d')
  })

  it('模板缺少占位、单位数不合法、时长非有限数都报错', () => {
    expect(() => createDurationFormat('en-US', { day: 'd', hour: '{n}h', minute: '{n}m', second: '{n}s', millisecond: '{n}ms' })).toThrow(/占位/)
    expect(() => createDurationFormat('en-US', { day: '{n}d', hour: '{n}h', minute: '{n}m', second: '{n}s', millisecond: '{n}ms' }, { maxUnits: 0 })).toThrow(/maxUnits/)
    expect(() => en(Number.NaN)).toThrow(/有限数/)
  })
})
