import type { FunctionDefinition } from '../src'
import { describe, expect, it } from 'vitest'
import { createFunctionTable, DEFAULT_FUNCTION_TABLE, ExprDate, ExprList, ExprNumber } from '../src'
import { issue, run } from './helpers'

describe('逻辑与空值函数', () => {
  it('取第一个非 null：COALESCE', () => {
    expect(run('COALESCE(a, b, 3)', { b: 2 })).toBe('2')
    expect(run('COALESCE(a, b)')).toBeNull()
  })

  it('判空：ISBLANK 对 null、空串、空列表为真', () => {
    expect(run('[ISBLANK(null), ISBLANK(\'\'), ISBLANK([]), ISBLANK(\' \'), ISBLANK(0), ISBLANK(false)]')).toEqual([true, true, true, false, false, false])
  })
})

describe('聚合函数', () => {
  it('求和：SUM 展开列表、跳过 null', () => {
    expect(run('SUM(1, [2, 3], null, [[4, null]])')).toBe('10')
    expect(run('SUM([])')).toBe('0')
    expect(run('SUM(a)')).toBe('0')
    expect(issue('SUM(\'a\')')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 4, end: 7, data: { function: 'SUM', index: 0, actual: 'string' } })
    expect(issue('SUM(1, [\'x\'])')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', start: 7, end: 12, data: { index: 1 } })
  })

  it('平均：AVG 没有数时为 null', () => {
    expect(run('AVG(1, 2)')).toBe('1.5')
    expect(run('AVG(1, 2, 2)')).toBe(`1.${'6'.repeat(32)}7`)
    expect(run('AVG([], null)')).toBeNull()
  })

  it('计数：COUNT 数非 null 的值，任意类型', () => {
    expect(run('COUNT(1, null, \'a\', [null, 2, [true]], r)', { r: { x: 1 } })).toBe('5')
    expect(run('COUNT([])')).toBe('0')
  })

  it('极值：MIN / MAX 在同类的数字、字符串或日期中取极值', () => {
    expect(run('MIN(3, [1, 2])')).toBe('1')
    expect(run('MAX(3, [1, 2.5e1])')).toBe('25')
    expect(run('MAX(\'a\', \'b\', null)')).toBe('b')
    expect(run('MIN(DATE(2026, 1, 2), DATE(2026, 1, 1))')).toBe('2026-01-01')
    expect(run('MIN([])')).toBeNull()
    expect(issue('MIN(1, \'a\')')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { function: 'MIN', index: 1, actual: 'string' } })
    expect(issue('MAX(true)')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 0, actual: 'boolean' } })
  })
})

describe('文本函数', () => {
  it('长度与截取按码点计', () => {
    expect(run('LEN(\'中文😀\')')).toBe('3')
    expect(run('LEN(\'\')')).toBe('0')
    expect(run('LEN(null)')).toBeNull()
    expect(run('LEFT(\'😀abc\', 2)')).toBe('😀a')
    expect(run('RIGHT(\'abc😀\', 2)')).toBe('c😀')
    expect(run('RIGHT(\'abc\', 0)')).toBe('')
    expect(run('LEFT(\'abc\', 10)')).toBe('abc')
    expect(run('MID(\'abcdef\', 2, 3)')).toBe('bcd')
    expect(run('MID(\'abc\', 5, 2)')).toBe('')
    expect(issue('LEN(1)')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { function: 'LEN', index: 0, actual: 'number' } })
    expect(issue('LEFT(\'abc\', -1)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
    expect(issue('LEFT(\'abc\', 1.5)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
    expect(issue('MID(\'abc\', 0, 1)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
  })

  it('大小写只转换 ASCII 字母', () => {
    expect(run('UPPER(\'aßc中é\')')).toBe('AßC中é')
    expect(run('LOWER(\'ABC Ä\')')).toBe('abc Ä')
  })

  it('去空白：TRIM 去掉首尾的空白（含全角空格）', () => {
    expect(run('TRIM(\'　 a b \n\')')).toBe('a b')
  })

  it('包含：CONTAINS 判断子串或列表成员', () => {
    expect(run('CONTAINS(\'hello\', \'ell\')')).toBe(true)
    expect(run('CONTAINS(tags, \'b\')', { tags: ['a', 'b'] })).toBe(true)
    expect(run('CONTAINS([1, 2], 2.0)')).toBe(true)
    expect(run('CONTAINS([[1]], [1])')).toBe(true)
    expect(run('CONTAINS([null], null)')).toBe(true)
    expect(run('CONTAINS([1], \'1\')')).toBe(false)
    expect(run('CONTAINS(null, \'a\')')).toBeNull()
    expect(run('CONTAINS(\'a\', null)')).toBeNull()
    expect(issue('CONTAINS(1, \'a\')')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 0 } })
    expect(issue('CONTAINS(\'a\', 1)')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 1 } })
  })

  it('前后缀、替换、拆分与拼接', () => {
    expect(run('[STARTS_WITH(\'abc\', \'ab\'), ENDS_WITH(\'abc\', \'bc\'), STARTS_WITH(\'abc\', \'c\')]')).toEqual([true, true, false])
    expect(run('REPLACE(\'a-b-c\', \'-\', \'+\')')).toBe('a+b+c')
    expect(run('REPLACE(\'aaa\', \'aa\', \'b\')')).toBe('ba')
    expect(issue('REPLACE(\'abc\', \'\', \'x\')')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
    expect(run('SPLIT(\'a,b,,c\', \',\')')).toEqual(['a', 'b', '', 'c'])
    expect(issue('SPLIT(\'abc\', \'\')')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
    expect(run('JOIN([\'a\', 1.50, null, true], \'-\')')).toBe('a-1.5--true')
    expect(run('JOIN([1, 2])')).toBe('12')
    expect(issue('JOIN([[1]], \',\')')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { function: 'JOIN', index: 0, actual: 'list' } })
    expect(issue('JOIN(\'a\')')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 0, actual: 'string' } })
  })

  it('转文本：CONCAT 与 TEXT 用规范文本，null 是空串', () => {
    expect(run('CONCAT(\'a\', 1.50, null, true, DATE(2026, 1, 2))')).toBe('a1.5true2026-01-02')
    expect(run('TEXT(1.20)')).toBe('1.2')
    expect(run('TEXT(null)')).toBe('')
    expect(issue('CONCAT(\'a\', [1])')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', start: 12, end: 15, data: { function: 'CONCAT', index: 1, actual: 'list' } })
    expect(issue('TEXT(r)', { r: {} })).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 0, actual: 'record' } })
  })

  it.each([
    ['FORMAT_NUMBER(1234567.891, 2, true)', '1,234,567.89'],
    ['FORMAT_NUMBER(1234567.891, 2)', '1234567.89'],
    ['FORMAT_NUMBER(-0.005, 2)', '-0.01'],
    ['FORMAT_NUMBER(0.004, 2)', '0.00'],
    ['FORMAT_NUMBER(-0.004, 2)', '0.00'],
    ['FORMAT_NUMBER(5, 0)', '5'],
    ['FORMAT_NUMBER(2.5, 0)', '3'],
    ['FORMAT_NUMBER(999.5, 0, true)', '1,000'],
    ['FORMAT_NUMBER(12, 3)', '12.000'],
    ['FORMAT_NUMBER(-1234.5, 1, true)', '-1,234.5'],
    ['FORMAT_NUMBER(1e30, 0, true)', '1,000,000,000,000,000,000,000,000,000,000'],
  ])('%s = %s', (source, expected) => {
    expect(run(source)).toBe(expected)
  })

  it('数字格式化的实参校验', () => {
    expect(issue('FORMAT_NUMBER(1, 35)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
    expect(issue('FORMAT_NUMBER(1, 2, \'yes\')')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 2 } })
    expect(issue('FORMAT_NUMBER(\'1\', 2)')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 0 } })
  })

  it('文本转数字：TO_NUMBER 严格解析十进制文本，不合法得到 null', () => {
    expect(run('TO_NUMBER(\' 12.50 \')')).toBe('12.5')
    expect(run('TO_NUMBER(\'-1e3\')')).toBe('-1000')
    expect(run('TO_NUMBER(\'abc\')')).toBeNull()
    expect(run('TO_NUMBER(\'\')')).toBeNull()
    expect(run('TO_NUMBER(\'1,000\')')).toBeNull()
    expect(run('TO_NUMBER(\'0x10\')')).toBeNull()
    expect(run('TO_NUMBER(\'Infinity\')')).toBeNull()
    expect(run('TO_NUMBER(5)')).toBe('5')
    expect(issue('TO_NUMBER(true)')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 0 } })
    expect(issue('TO_NUMBER(\'1e999\')').code).toBe('XH_EXPR_NUMBER_OVERFLOW')
  })
})

describe('函数表', () => {
  it('缺省函数表含全部内置函数，名字按字母序', () => {
    expect(DEFAULT_FUNCTION_TABLE.names).toEqual([...DEFAULT_FUNCTION_TABLE.names].sort())
    expect(DEFAULT_FUNCTION_TABLE.names).toContain('SUM')
    expect(DEFAULT_FUNCTION_TABLE.names).toHaveLength(46)
    expect(DEFAULT_FUNCTION_TABLE.lookup('round')).toEqual({ name: 'ROUND', minArgs: 1, maxArgs: 2, params: ['number', 'places'] })
    expect(DEFAULT_FUNCTION_TABLE.lookup('nope')).toBeUndefined()
  })

  it('每个内置函数都有参数名：英文键、互不重复，个数等于 maxArgs，不限时等于 max(minArgs, 1)', () => {
    for (const name of DEFAULT_FUNCTION_TABLE.names) {
      const { minArgs, maxArgs, params } = DEFAULT_FUNCTION_TABLE.lookup(name)!
      expect(params, name).toHaveLength(maxArgs ?? Math.max(minArgs, 1))
      expect(new Set(params).size, name).toBe(params.length)
      expect(params.every(param => /^[a-z][A-Za-z0-9]*$/.test(param)), name).toBe(true)
    }
    expect(DEFAULT_FUNCTION_TABLE.lookup('IF')!.params).toEqual(['condition', 'whenTrue', 'whenFalse'])
    expect(DEFAULT_FUNCTION_TABLE.lookup('SUM')!.params).toEqual(['value'])
    expect(DEFAULT_FUNCTION_TABLE.lookup('NOW')!.params).toEqual([])
  })

  it('可以只启用部分内置函数或完全不启用', () => {
    expect(createFunctionTable({ builtins: ['sum', 'IF'] }).names).toEqual(['IF', 'SUM'])
    expect(createFunctionTable({ builtins: 'none' }).names).toEqual([])
    expect(issue('SUM(1)', {}, { functions: createFunctionTable({ builtins: 'none' }) })).toEqual({ code: 'XH_EXPR_UNKNOWN_FUNCTION', start: 0, end: 3, data: { name: 'SUM' } })
    expect(() => createFunctionTable({ builtins: ['NOPE'] })).toThrow(TypeError)
  })

  it('实参个数在求值时同样校验', () => {
    expect(issue('ROUND(1, 2, 3)')).toEqual({ code: 'XH_EXPR_ARGUMENT_COUNT', start: 0, end: 14, data: { name: 'ROUND', min: 1, max: 2, actual: 3 } })
  })
})

describe('宿主函数', () => {
  const DOUBLE: FunctionDefinition = {
    name: 'DOUBLE',
    minArgs: 1,
    maxArgs: 1,
    call: ([input], context) => {
      if (input === null)
        return null
      return input instanceof ExprNumber ? input.toJs() * 2 : context.typeMismatch(0)
    },
  }

  it('登记后可调用，名字不区分大小写，返回的 JS 值自动转换', () => {
    const functions = createFunctionTable({ functions: [DOUBLE] })
    expect(run('double(21) + 0.1', {}, { functions })).toBe('42.1')
    expect(issue('DOUBLE(\'a\')', {}, { functions })).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 7, end: 10, data: { function: 'DOUBLE', index: 0, actual: 'string' } })
    expect(functions.names).toContain('SUM')
  })

  it('可以返回列表、记录与表达式值', () => {
    const functions = createFunctionTable({
      functions: [
        { name: 'PAIR', minArgs: 0, maxArgs: 0, call: () => [1, { x: 'y' }] },
        { name: 'TODAY_PLUS', minArgs: 1, maxArgs: 1, call: ([days], context) => context.now === null ? null : ExprList.of([context.now, days ?? null]) },
      ],
    })
    expect(run('PAIR()[1].x', {}, { functions })).toBe('y')
    expect(run('TODAY_PLUS(1)', {}, { functions, now: ExprDate.fromParts(2026, 10, 16)! })).toEqual(['2026-10-16', '1'])
  })

  it('不可表示的返回值、抛出的异常与参数错误', () => {
    const functions = createFunctionTable({
      functions: [
        { name: 'BAD', minArgs: 0, maxArgs: 0, call: () => new Date() },
        { name: 'BOOM', minArgs: 0, maxArgs: 0, call: () => { throw new Error('x') } },
        { name: 'PICKY', minArgs: 1, maxArgs: null, call: (_args, context) => context.invalidArgument(0) },
      ],
    })
    expect(issue('BAD()', {}, { functions })).toEqual({ code: 'XH_EXPR_UNSUPPORTED_VALUE', start: 0, end: 5, data: { function: 'BAD' } })
    expect(issue('BOOM()', {}, { functions })).toEqual({ code: 'XH_EXPR_FUNCTION_FAILED', start: 0, end: 6, data: { function: 'BOOM' } })
    expect(issue('PICKY(1 + 1, 2)', {}, { functions })).toEqual({ code: 'XH_EXPR_INVALID_ARGUMENT', start: 6, end: 11, data: { function: 'PICKY', index: 0 } })
  })

  it('参数名可省略，省略时为空数组；给出时随签名一起查到', () => {
    const call = (): null => null
    const functions = createFunctionTable({
      builtins: 'none',
      functions: [{ name: 'CLAMP', minArgs: 3, maxArgs: 3, params: ['value', 'low', 'high'], call }, { name: 'PICK', minArgs: 2, maxArgs: null, params: ['index', 'option'], call }, { name: 'BARE', minArgs: 1, maxArgs: 1, call }],
    })
    expect(functions.lookup('clamp')).toEqual({ name: 'CLAMP', minArgs: 3, maxArgs: 3, params: ['value', 'low', 'high'] })
    expect(functions.lookup('PICK')!.params).toEqual(['index', 'option'])
    expect(functions.lookup('BARE')!.params).toEqual([])
  })

  it('登记时校验名字与签名', () => {
    const call = (): null => null
    expect(() => createFunctionTable({ functions: [{ name: 'lower', minArgs: 0, maxArgs: 0, call }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: '1A', minArgs: 0, maxArgs: 0, call }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: 'SUM', minArgs: 0, maxArgs: 0, call }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: 'A', minArgs: 2, maxArgs: 1, call }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: 'A', minArgs: -1, maxArgs: null, call }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: 'A', minArgs: 0, maxArgs: 0, call: 'x' as never }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: 'A', minArgs: 0, maxArgs: 0, call }, { name: 'A', minArgs: 0, maxArgs: 0, call }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: 'A', minArgs: 1, maxArgs: 1, params: ['Value'], call }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: 'A', minArgs: 2, maxArgs: 2, params: ['x', 'x'], call }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: 'A', minArgs: 1, maxArgs: 2, params: ['x'], call }] })).toThrow(TypeError)
    expect(() => createFunctionTable({ functions: [{ name: 'A', minArgs: 0, maxArgs: null, params: [], call }] })).toThrow(TypeError)
    expect(createFunctionTable({ builtins: 'none', functions: [{ name: 'SUM', minArgs: 0, maxArgs: 0, call }] }).names).toEqual(['SUM'])
  })
})
