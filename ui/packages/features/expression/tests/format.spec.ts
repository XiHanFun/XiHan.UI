import type { FormatSpec } from '../src'
import { describe, expect, it } from 'vitest'
import { ExprDate, ExprNumber, formatValue } from '../src'

function fails(value: unknown, spec: FormatSpec, options?: Parameters<typeof formatValue>[2]): string {
  try {
    formatValue(value, spec, options)
  }
  catch (error) {
    if (error instanceof TypeError)
      return error.message
    throw error
  }
  throw new Error('预期抛出 TypeError')
}

describe('格式化：数字', () => {
  it.each([
    [1.005, { kind: 'number', decimals: 2 }, '1.01'],
    [2.675, { kind: 'number', decimals: 2 }, '2.68'],
    [1234567.891, { kind: 'number', decimals: 2, grouping: true }, '1,234,567.89'],
    [-1234.5, { kind: 'number', decimals: 1, grouping: true }, '-1,234.5'],
    [-0.004, { kind: 'number', decimals: 2 }, '0.00'],
    [12, { kind: 'number', decimals: 3 }, '12.000'],
    [2.5, { kind: 'number', decimals: 0 }, '3'],
    [2.5, { kind: 'number', decimals: 0, rounding: 'half-even' }, '2'],
    [-1.5, { kind: 'number', decimals: 0, rounding: 'floor' }, '-2'],
    [-1.5, { kind: 'number', decimals: 0, rounding: 'ceil' }, '-1'],
    [1.99, { kind: 'number', decimals: 0, rounding: 'down' }, '1'],
    [1.5, { kind: 'number', minDecimals: 0, maxDecimals: 2 }, '1.5'],
    [1.256, { kind: 'number', maxDecimals: 2 }, '1.26'],
    [2, { kind: 'number', minDecimals: 1, maxDecimals: 3 }, '2.0'],
    [1234.5, { kind: 'number', grouping: true }, '1,234.5'],
    [1e21, { kind: 'number', grouping: true }, '1,000,000,000,000,000,000,000'],
  ] as const)('%s 按 %j → %s', (value, spec, expected) => {
    expect(formatValue(value, spec)).toBe(expected)
  })

  it('接受十进制数、bigint 与十进制文本，null 得空串', () => {
    expect(formatValue(ExprNumber.parse('0.125')!, { kind: 'number', decimals: 2 })).toBe('0.13')
    expect(formatValue(12345678901234567890n, { kind: 'number', grouping: true })).toBe('12,345,678,901,234,567,890')
    expect(formatValue('12.50', { kind: 'number' })).toBe('12.5')
    expect(formatValue(null, { kind: 'number' })).toBe('')
    expect(formatValue(undefined, { kind: 'number' })).toBe('')
  })

  it('区域只换小数点与千分位符号', () => {
    expect(formatValue(1234.5, { kind: 'number', decimals: 2, grouping: true }, { locale: 'de-DE' })).toBe('1.234,50')
    expect(formatValue(1234.5, { kind: 'number', decimals: 2, grouping: true }, { locale: 'zh-CN' })).toBe('1,234.50')
  })

  it('值不是数字时抛 XH_EXPR_FORMAT_INVALID_VALUE', () => {
    expect(fails('abc', { kind: 'number' })).toBe('XH_EXPR_FORMAT_INVALID_VALUE')
    expect(fails(Number.NaN, { kind: 'number' })).toBe('XH_EXPR_FORMAT_INVALID_VALUE')
    expect(fails(true, { kind: 'number' })).toBe('XH_EXPR_FORMAT_INVALID_VALUE')
    expect(fails('1e99', { kind: 'number' })).toBe('XH_EXPR_FORMAT_INVALID_VALUE')
  })

  it.each([
    { kind: 'number', decimals: 1.5 },
    { kind: 'number', decimals: 35 },
    { kind: 'number', decimals: 2, maxDecimals: 3 },
    { kind: 'number', minDecimals: 3, maxDecimals: 2 },
    { kind: 'number', rounding: 'nearest' },
    { kind: 'number', grouping: 'yes' },
    { kind: 'money' },
  ])('格式说明 %j 不合法', (spec) => {
    expect(fails(1, spec as never)).toBe('XH_EXPR_FORMAT_INVALID_SPEC')
  })
})

describe('格式化：百分比', () => {
  it.each([
    [0.1234, 1, '12.3%'],
    [0.005, 0, '1%'],
    [1, 0, '100%'],
    [0.12345, 2, '12.35%'],
  ])('%s 保留 %s 位 → %s', (value, decimals, expected) => {
    expect(formatValue(value, { kind: 'percent', decimals })).toBe(expected)
  })
})

describe('格式化：日期', () => {
  const pattern = 'yyyy-MM-dd HH:mm'

  it('不带偏移的日期按墙钟时间原样输出，不受时区影响', () => {
    expect(formatValue(ExprDate.fromParts(2026, 10, 16, 8, 5)!, { kind: 'date', pattern })).toBe('2026-10-16 08:05')
    expect(formatValue('2026-10-16 08:00', { kind: 'date', pattern }, { timeZone: 'UTC' })).toBe('2026-10-16 08:00')
    expect(formatValue('2026-10-16', { kind: 'date', pattern: 'yyyy年M月d日' })).toBe('2026年10月16日')
  })

  it('带偏移的文本在给了时区时换算，没给时保留它自己的墙钟时间', () => {
    expect(formatValue('2026-10-16T00:30:00Z', { kind: 'date', pattern }, { timeZone: 'Asia/Shanghai' })).toBe('2026-10-16 08:30')
    expect(formatValue('2026-10-16T00:30:00Z', { kind: 'date', pattern }, { timeZone: '+08:00' })).toBe('2026-10-16 08:30')
    expect(formatValue('2026-10-16T08:30:00+08:00', { kind: 'date', pattern }, { timeZone: 'UTC' })).toBe('2026-10-16 00:30')
    expect(formatValue('2026-10-16T08:30:00+08:00', { kind: 'date', pattern })).toBe('2026-10-16 08:30')
  })

  it('时间戳与 Date 换算到时区，缺省 UTC', () => {
    expect(formatValue(0, { kind: 'date', pattern })).toBe('1970-01-01 00:00')
    expect(formatValue(0, { kind: 'date', pattern }, { timeZone: 'America/New_York' })).toBe('1969-12-31 19:00')
    expect(formatValue(new Date(Date.UTC(2026, 9, 16, 16, 0)), { kind: 'date', pattern }, { timeZone: 'Asia/Tokyo' })).toBe('2026-10-17 01:00')
    expect(formatValue(1500, { kind: 'date', pattern: 'ss.SSS' }, { timeZone: '-05:30' })).toBe('01.500')
  })

  it('不合法的时区、日期与模式', () => {
    expect(fails(0, { kind: 'date', pattern }, { timeZone: 'Mars/Base' })).toBe('XH_EXPR_FORMAT_INVALID_SPEC')
    expect(fails('2026-02-30', { kind: 'date', pattern })).toBe('XH_EXPR_FORMAT_INVALID_VALUE')
    expect(fails(Number.POSITIVE_INFINITY, { kind: 'date', pattern })).toBe('XH_EXPR_FORMAT_INVALID_VALUE')
    expect(fails(0, { kind: 'date', pattern: '' })).toBe('XH_EXPR_FORMAT_INVALID_SPEC')
  })
})

describe('格式化：人民币大写', () => {
  it.each([
    [1001.5, '壹仟零壹元伍角'],
    [100000, '壹拾万元整'],
    [0, '零元整'],
    [0.5, '伍角'],
    [0.05, '伍分'],
    [0.55, '伍角伍分'],
    [1.05, '壹元零伍分'],
    [1.25, '壹元贰角伍分'],
    [10, '壹拾元整'],
    [110, '壹佰壹拾元整'],
    [1010, '壹仟零壹拾元整'],
    [100005, '壹拾万零伍元整'],
    [101000, '壹拾万壹仟元整'],
    [1000000, '壹佰万元整'],
    [20000003, '贰仟万零叁元整'],
    [100010001, '壹亿零壹万零壹元整'],
    [10000000001, '壹佰亿零壹元整'],
    [1000000000000, '壹万亿元整'],
    [-12.3, '负壹拾贰元叁角'],
    [1005.005, '壹仟零伍元零壹分'],
    [-0.001, '零元整'],
  ])('%s → %s', (value, expected) => {
    expect(formatValue(value, { kind: 'rmb-upper' })).toBe(expected)
  })

  it('十进制文本保留全部精度', () => {
    expect(formatValue('9999999999999999.99', { kind: 'rmb-upper' })).toBe('玖仟玖佰玖拾玖万亿玖仟玖佰玖拾玖亿玖仟玖佰玖拾玖万玖仟玖佰玖拾玖元玖角玖分')
  })

  it('舍入方式可选，金额达到一亿亿时报错', () => {
    expect(formatValue(1.999, { kind: 'rmb-upper', rounding: 'down' })).toBe('壹元玖角玖分')
    expect(fails(1e16, { kind: 'rmb-upper' })).toBe('XH_EXPR_FORMAT_OUT_OF_RANGE')
    expect(fails(-1e16, { kind: 'rmb-upper' })).toBe('XH_EXPR_FORMAT_OUT_OF_RANGE')
  })
})
