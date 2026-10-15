import { describe, expect, it } from 'vitest'
import { ExprNumber } from '../src'
import { issue, run } from './helpers'

describe('十进制数：精确运算', () => {
  it.each([
    ['0.1 + 0.2', '0.3'],
    ['0.3 - 0.1', '0.2'],
    ['1.1 * 1.1', '1.21'],
    ['10 / 4', '2.5'],
    ['1 / 3', `0.${'3'.repeat(34)}`],
    ['2 / 3', `0.${'6'.repeat(33)}7`],
    ['1.50 + 0', '1.5'],
    ['100 * 1000', '100000'],
    ['0 - 5', '-5'],
    ['-0', '0'],
  ])('%s = %s', (source, expected) => {
    expect(run(source)).toBe(expected)
  })

  it('外部传入的 JS 数字取最短十进制表示再运算', () => {
    expect(run('a + b', { a: 0.1, b: 0.2 })).toBe('0.3')
    expect(run('a * 3', { a: 1.1 })).toBe('3.3')
    expect(run('a == 0.3', { a: 0.3 })).toBe(true)
  })

  it('0.1 + 0.2 与 0.3 相等', () => {
    expect(run('0.1 + 0.2 == 0.3')).toBe(true)
  })

  it.each([
    ['7 % 3', '1'],
    ['-7 % 3', '-1'],
    ['7 % -3', '1'],
    ['5.5 % 2', '1.5'],
    ['0.3 % 0.1', '0'],
  ])('取余 %s = %s，符号随被除数', (source, expected) => {
    expect(run(source)).toBe(expected)
  })

  it('除数为 0 报 XH_EXPR_DIVISION_BY_ZERO，区间是整个除法', () => {
    expect(issue('1 / 0')).toEqual({ code: 'XH_EXPR_DIVISION_BY_ZERO', start: 0, end: 5 })
    expect(issue('1 % 0').code).toBe('XH_EXPR_DIVISION_BY_ZERO')
    expect(issue('0 / 0').code).toBe('XH_EXPR_DIVISION_BY_ZERO')
  })
})

describe('十进制数：有效位与范围', () => {
  it('超过 34 位有效数字时四舍六入五成双', () => {
    expect(run('99999999999999999999999999999999999')).toBe(`1${'0'.repeat(35)}`)
    expect(run('1234567890123456789012345678901234.5')).toBe('1234567890123456789012345678901234')
    expect(run('1234567890123456789012345678901235.5')).toBe('1234567890123456789012345678901236')
    expect(run('1234567890123456789012345678901234.51')).toBe('1234567890123456789012345678901235')
  })

  it('绝对值小于 10^65', () => {
    expect(run('1e64')).toBe(`1${'0'.repeat(64)}`)
    expect(issue('1e64 * 10')).toMatchObject({ code: 'XH_EXPR_NUMBER_OVERFLOW' })
    expect(issue('1e65')).toMatchObject({ code: 'XH_EXPR_NUMBER_OVERFLOW', start: 0, end: 4 })
    expect(issue('-1e64 - 1e64 * 9')).toMatchObject({ code: 'XH_EXPR_NUMBER_OVERFLOW' })
  })

  it('最小量子是 10^-64，更小的部分按五成双舍入', () => {
    expect(run('1e-64')).toBe(`0.${'0'.repeat(63)}1`)
    expect(run('1e-64 / 2')).toBe('0')
    expect(run('3e-64 / 2')).toBe(`0.${'0'.repeat(63)}2`)
    expect(run('1e-65')).toBe('0')
  })

  it('规范文本不用科学计数法、不带多余的 0', () => {
    expect(run('1.2e3')).toBe('1200')
    expect(run('1200e-3')).toBe('1.2')
    expect(run('0.000001')).toBe('0.000001')
    expect(run('5.000')).toBe('5')
  })
})

describe('十进制数：舍入函数', () => {
  it.each([
    ['ROUND(2.5)', '3'],
    ['ROUND(-2.5)', '-3'],
    ['ROUND(2.4999)', '2'],
    ['ROUND(1.005, 2)', '1.01'],
    ['ROUND(1234, -2)', '1200'],
    ['ROUND(1250, -2)', '1300'],
    ['ROUND(9.995, 2)', '10'],
    ['FLOOR(-1.5)', '-2'],
    ['FLOOR(1.239, 2)', '1.23'],
    ['CEIL(-1.5)', '-1'],
    ['CEIL(1.231, 2)', '1.24'],
    ['TRUNC(-1.59)', '-1'],
    ['TRUNC(1.59, 1)', '1.5'],
    ['ROUND(3)', '3'],
  ])('%s = %s', (source, expected) => {
    expect(run(source)).toBe(expected)
  })

  it('位数必须是 -64 到 64 的整数', () => {
    expect(issue('ROUND(1, 0.5)')).toEqual({ code: 'XH_EXPR_INVALID_ARGUMENT', start: 9, end: 12, data: { function: 'ROUND', index: 1 } })
    expect(issue('ROUND(1, 65)').code).toBe('XH_EXPR_INVALID_ARGUMENT')
    expect(issue('ROUND(1, -65)').code).toBe('XH_EXPR_INVALID_ARGUMENT')
  })
})

describe('十进制数：平方根与整数次幂', () => {
  it('平方根按 34 位有效数字舍入', () => {
    expect(run('SQRT(2)')).toBe('1.414213562373095048801688724209698')
    expect(run('SQRT(16)')).toBe('4')
    expect(run('SQRT(0.25)')).toBe('0.5')
    expect(run('SQRT(0)')).toBe('0')
    expect(run('SQRT(1e-64)')).toBe(`0.${'0'.repeat(31)}1`)
  })

  it('负数开方报不合法实参', () => {
    expect(issue('SQRT(-1)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { function: 'SQRT', index: 0 } })
  })

  it.each([
    ['POWER(2, 10)', '1024'],
    ['POWER(2, -2)', '0.25'],
    ['POWER(1.1, 2)', '1.21'],
    ['POWER(-2, 3)', '-8'],
    ['POWER(0, 0)', '1'],
    ['POWER(10, 64)', `1${'0'.repeat(64)}`],
    ['POWER(0.1, 65)', '0'],
    ['POWER(3, -1)', `0.${'3'.repeat(34)}`],
  ])('%s = %s', (source, expected) => {
    expect(run(source)).toBe(expected)
  })

  it('幂的边界：溢出、零的负次幂、指数不合法', () => {
    expect(issue('POWER(10, 65)').code).toBe('XH_EXPR_NUMBER_OVERFLOW')
    expect(issue('POWER(0.1, -65)').code).toBe('XH_EXPR_NUMBER_OVERFLOW')
    expect(issue('POWER(0, -1)').code).toBe('XH_EXPR_DIVISION_BY_ZERO')
    expect(issue('POWER(2, 1000)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
    expect(issue('POWER(2, 0.5)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
  })
})

describe('exprNumber 公开接口', () => {
  it('parse 接受十进制文本，不合法或越界得到 null', () => {
    expect(ExprNumber.parse('-12.50')?.toString()).toBe('-12.5')
    expect(ExprNumber.parse('1e5')?.toString()).toBe('100000')
    expect(ExprNumber.parse('.5')?.toString()).toBe('0.5')
    expect(ExprNumber.parse('-0.000')?.toString()).toBe('0')
    expect(ExprNumber.parse(' 1')).toBeNull()
    expect(ExprNumber.parse('abc')).toBeNull()
    expect(ExprNumber.parse('')).toBeNull()
    expect(ExprNumber.parse('1e65')).toBeNull()
  })

  it('fromJs 取最短往返表示，非有限数或越界得到 null', () => {
    expect(ExprNumber.fromJs(0.1)?.toString()).toBe('0.1')
    expect(ExprNumber.fromJs(1e21)?.toString()).toBe(`1${'0'.repeat(21)}`)
    expect(ExprNumber.fromJs(5e-7)?.toString()).toBe('0.0000005')
    expect(ExprNumber.fromJs(-0)?.toString()).toBe('0')
    expect(ExprNumber.fromJs(Number.NaN)).toBeNull()
    expect(ExprNumber.fromJs(Number.POSITIVE_INFINITY)).toBeNull()
    expect(ExprNumber.fromJs(1e300)).toBeNull()
  })

  it('规范形式下相等即字段相等，实例冻结', () => {
    const a = ExprNumber.parse('1.50')!
    const b = ExprNumber.parse('1.5')!
    expect(a.coefficient).toBe(15n)
    expect(a.exponent).toBe(-1)
    expect(a.equals(b)).toBe(true)
    expect(a.compare(ExprNumber.parse('2')!)).toBe(-1)
    expect(a.sign).toBe(1)
    expect(a.isInteger).toBe(false)
    expect(a.toJs()).toBe(1.5)
    expect(JSON.stringify({ a })).toBe('{"a":"1.5"}')
    expect(Object.isFrozen(a)).toBe(true)
  })
})
