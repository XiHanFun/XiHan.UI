import type { FormatSpec } from '../src'
import { describe, expect, it } from 'vitest'
import { checkFormatSpec, FORMAT_DECIMALS_LIMIT, FORMAT_KINDS, FORMAT_ROUNDINGS, formatValue, NUMERAL_STYLES } from '../src'

function codes(spec: unknown, kinds?: readonly FormatSpec['kind'][]): string[] {
  return checkFormatSpec(spec, kinds === undefined ? {} : { kinds }).map(issue => `${issue.code}@${issue.path.join('.')}`)
}

describe('格式说明的常量', () => {
  it('种类、舍入方式、小数位上限与数字字形样式', () => {
    expect(FORMAT_KINDS).toEqual(['number', 'percent', 'date', 'rmb-upper', 'numeral'])
    expect(FORMAT_ROUNDINGS).toEqual(['half-up', 'half-even', 'floor', 'ceil', 'down'])
    expect(FORMAT_DECIMALS_LIMIT).toBe(34)
    expect(NUMERAL_STYLES).toEqual(['roman-upper', 'roman-lower', 'cn-lower', 'cn-upper'])
    expect(Object.isFrozen(FORMAT_ROUNDINGS)).toBe(true)
  })
})

describe('格式说明的静态校验', () => {
  it('合法的格式说明没有问题', () => {
    expect(codes({ kind: 'number', decimals: 2, grouping: true, rounding: 'half-even' })).toEqual([])
    expect(codes({ kind: 'percent', minDecimals: 0, maxDecimals: 34 })).toEqual([])
    expect(codes({ kind: 'date', pattern: 'yyyy-MM-dd' })).toEqual([])
    expect(codes({ kind: 'rmb-upper' })).toEqual([])
    expect(codes({ kind: 'numeral', style: 'cn-upper' })).toEqual([])
  })

  it('不是普通对象、种类缺失或不认识', () => {
    expect(codes(null)).toEqual(['XH_EXPR_FORMAT_INVALID_SPEC@'])
    expect(codes([])).toEqual(['XH_EXPR_FORMAT_INVALID_SPEC@'])
    expect(codes({})).toEqual(['XH_EXPR_FORMAT_INVALID_KIND@kind'])
    expect(codes({ kind: 'currency', symbol: '¥' })).toEqual(['XH_EXPR_FORMAT_INVALID_KIND@kind'])
  })

  it('限定种类时其它种类报 XH_EXPR_FORMAT_INVALID_KIND', () => {
    expect(codes({ kind: 'date', pattern: 'yyyy' }, ['number', 'percent'])).toEqual(['XH_EXPR_FORMAT_INVALID_KIND@kind'])
    expect(codes({ kind: 'percent' }, ['number', 'percent'])).toEqual([])
  })

  it('取值不合法、必填项缺失与多余的键，问题一次全部报出', () => {
    expect(codes({ kind: 'number', decimals: 35, maxDecimals: -1, grouping: 'yes', rounding: 'up', symbol: '$' })).toEqual([
      'XH_EXPR_FORMAT_UNKNOWN_KEY@symbol',
      'XH_EXPR_FORMAT_INVALID_OPTION@decimals',
      'XH_EXPR_FORMAT_INVALID_OPTION@maxDecimals',
      'XH_EXPR_FORMAT_INVALID_OPTION@grouping',
      'XH_EXPR_FORMAT_INVALID_OPTION@rounding',
      'XH_EXPR_FORMAT_CONFLICT@decimals',
    ])
    expect(codes({ kind: 'date' })).toEqual(['XH_EXPR_FORMAT_INVALID_OPTION@pattern'])
    expect(codes({ kind: 'date', pattern: '' })).toEqual(['XH_EXPR_FORMAT_INVALID_OPTION@pattern'])
    expect(codes({ kind: 'rmb-upper', decimals: 2, rounding: 'x' })).toEqual(['XH_EXPR_FORMAT_UNKNOWN_KEY@decimals', 'XH_EXPR_FORMAT_INVALID_OPTION@rounding'])
    expect(codes({ kind: 'numeral' })).toEqual(['XH_EXPR_FORMAT_INVALID_OPTION@style'])
  })

  it('minDecimals 大于 maxDecimals 时报 XH_EXPR_FORMAT_CONFLICT', () => {
    expect(codes({ kind: 'number', minDecimals: 3, maxDecimals: 2 })).toEqual(['XH_EXPR_FORMAT_CONFLICT@minDecimals'])
  })

  it.each([
    { kind: 'number' },
    { kind: 'number', decimals: 0 },
    { kind: 'number', decimals: 34 },
    { kind: 'number', decimals: 35 },
    { kind: 'number', decimals: 1.5 },
    { kind: 'number', decimals: 2, minDecimals: 1 },
    { kind: 'number', minDecimals: 3, maxDecimals: 2 },
    { kind: 'number', grouping: 1 },
    { kind: 'percent', rounding: 'half-even' },
    { kind: 'percent', rounding: 'nearest' },
    { kind: 'date', pattern: 'yyyy' },
    { kind: 'date', pattern: '' },
    { kind: 'date', pattern: 3 },
    { kind: 'rmb-upper', rounding: 'ceil' },
    { kind: 'rmb-upper', rounding: 1 },
    { kind: 'numeral', style: 'roman-lower' },
    { kind: 'numeral', style: 'arabic' },
    { kind: 'numeral' },
    { kind: 'unknown' },
  ])('与 formatValue 判定一致：%j', (spec) => {
    const value = spec.kind === 'date' ? '2026-10-16' : 1
    let rejected = false
    try {
      formatValue(value, spec as FormatSpec)
    }
    catch (error) {
      rejected = (error as Error).message === 'XH_EXPR_FORMAT_INVALID_SPEC'
    }
    expect(checkFormatSpec(spec).length > 0).toBe(rejected)
  })
})
