import type { FormatSpec } from '@xihan-ui/expression'
import type { XlsxFormatSpec } from '../src'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { formatCode } from '../src'

describe('formatCode：数字与百分比', () => {
  it('固定小数位与千分位', () => {
    expect(formatCode({ kind: 'number', decimals: 2 })).toBe('0.00')
    expect(formatCode({ kind: 'number', decimals: 2, grouping: true })).toBe('#,##0.00')
    expect(formatCode({ kind: 'number', decimals: 0, grouping: true })).toBe('#,##0')
    expect(formatCode({ kind: 'percent', decimals: 1 })).toBe('0.0%')
  })

  it('minDecimals ≥ 1 时写成必显位加可省位，否则按 maxDecimals 写成固定位数', () => {
    expect(formatCode({ kind: 'number', minDecimals: 1, maxDecimals: 3 })).toBe('0.0##')
    expect(formatCode({ kind: 'number', minDecimals: 2, maxDecimals: 2 })).toBe('0.00')
    expect(formatCode({ kind: 'number', maxDecimals: 2, grouping: true })).toBe('#,##0.00')
    expect(formatCode({ kind: 'number', minDecimals: 0, maxDecimals: 0 })).toBe('0')
    expect(formatCode({ kind: 'percent', minDecimals: 1, maxDecimals: 2, grouping: true })).toBe('#,##0.0#%')
  })

  it('不舍入时数字为 General，百分比或带千分位时 Excel 表达不了', () => {
    expect(formatCode({ kind: 'number' })).toBe('General')
    expect(formatCode({ kind: 'number', grouping: true })).toBeNull()
    expect(formatCode({ kind: 'percent' })).toBeNull()
  })

  it('rounding 不改变格式代码', () => {
    expect(formatCode({ kind: 'number', decimals: 2, rounding: 'half-even' })).toBe(formatCode({ kind: 'number', decimals: 2 }))
  })

  it('人民币大写与数字字形返回 null', () => {
    expect(formatCode({ kind: 'rmb-upper' })).toBeNull()
    expect(formatCode({ kind: 'numeral', style: 'roman-upper' })).toBeNull()
    expect(formatCode({ kind: 'numeral', style: 'cn-upper' })).toBeNull()
  })
})

describe('formatCode：日期', () => {
  it('占位符换成 Excel 写法，其余文字写成字面文本', () => {
    expect(formatCode({ kind: 'date', pattern: 'yyyy-MM-dd HH:mm:ss' })).toBe('yyyy-mm-dd hh:mm:ss')
    expect(formatCode({ kind: 'date', pattern: 'yy/M/d H:m' })).toBe('yy/m/d h:m')
    expect(formatCode({ kind: 'date', pattern: 'yyyy年M月d日' })).toBe('yyyy"年"m"月"d"日"')
    expect(formatCode({ kind: 'date', pattern: '\'Week\' dd' })).toBe('"Week "dd')
    expect(formatCode({ kind: 'date', pattern: 'HH \'o\'\'clock\'' })).toBe('hh" o\'clock"')
  })

  it('分钟只能紧挨时之后或紧挨 ss 之前，月份不能落在这两个位置', () => {
    expect(formatCode({ kind: 'date', pattern: 'mm:ss' })).toBe('mm:ss')
    expect(formatCode({ kind: 'date', pattern: 'yyyy-mm' })).toBeNull()
    expect(formatCode({ kind: 'date', pattern: 'mm' })).toBeNull()
    expect(formatCode({ kind: 'date', pattern: 'm:s' })).toBeNull()
    expect(formatCode({ kind: 'date', pattern: 'HH:MM' })).toBeNull()
    expect(formatCode({ kind: 'date', pattern: 'MM:ss' })).toBeNull()
  })

  it('毫秒只能紧跟在 ss. 之后', () => {
    expect(formatCode({ kind: 'date', pattern: 'HH:mm:ss.SSS' })).toBe('hh:mm:ss.000')
    expect(formatCode({ kind: 'date', pattern: 'ss SSS' })).toBeNull()
    expect(formatCode({ kind: 'date', pattern: 's.SSS' })).toBeNull()
    expect(formatCode({ kind: 'date', pattern: 'SSS' })).toBeNull()
  })
})

describe('formatCode：与 formatValue 的规格同形', () => {
  it('两份类型可以互相赋值', () => {
    expectTypeOf<FormatSpec>().toExtend<XlsxFormatSpec>()
    expectTypeOf<XlsxFormatSpec>().toExtend<FormatSpec>()
    const spec: FormatSpec = { kind: 'percent', minDecimals: 1, maxDecimals: 2, rounding: 'half-even' }
    expect(formatCode(spec)).toBe('0.0#%')
  })
})
