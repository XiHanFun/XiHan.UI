import type { ExpressionNode } from '../src'
import { describe, expect, it } from 'vitest'
import { check, compile, createFunctionTable } from '../src'
import { ast } from './helpers'

describe('静态检查', () => {
  it('不提供名单时不检查标识符', () => {
    expect(check(ast('a + b.c'))).toEqual([])
  })

  it('报出不在名单里的顶层标识符，成员名不查', () => {
    expect(check(ast('a + b + a.zzz'), { identifiers: ['a'] })).toEqual([
      { code: 'XH_EXPR_UNKNOWN_IDENTIFIER', start: 4, end: 5, data: { name: 'b' } },
    ])
    expect(check(ast('a + b'), { identifiers: new Set(['a', 'b']) })).toEqual([])
    expect(check(ast('$row.x + y'), { identifiers: name => name.startsWith('$') })).toEqual([
      { code: 'XH_EXPR_UNKNOWN_IDENTIFIER', start: 9, end: 10, data: { name: 'y' } },
    ])
  })

  it('未知函数与实参个数', () => {
    expect(check(ast('FOO(1)'))).toEqual([{ code: 'XH_EXPR_UNKNOWN_FUNCTION', start: 0, end: 3, data: { name: 'FOO' } }])
    expect(check(ast('sum(1) + Round(2)'))).toEqual([])
    expect(check(ast('ROUND()'))).toEqual([{ code: 'XH_EXPR_ARGUMENT_COUNT', start: 0, end: 7, data: { name: 'ROUND', min: 1, max: 2, actual: 0 } }])
    expect(check(ast('SUM()'))).toEqual([{ code: 'XH_EXPR_ARGUMENT_COUNT', start: 0, end: 5, data: { name: 'SUM', min: 1, actual: 0 } }])
    expect(check(ast('NOW(1)'))).toEqual([{ code: 'XH_EXPR_ARGUMENT_COUNT', start: 0, end: 6, data: { name: 'NOW', min: 0, max: 0, actual: 1 } }])
  })

  it('禁止的成员名：标识符、点号成员、字符串下标', () => {
    expect(check(ast('constructor'))).toEqual([{ code: 'XH_EXPR_FORBIDDEN_MEMBER', start: 0, end: 11, data: { name: 'constructor' } }])
    expect(check(ast('a.__proto__'))).toEqual([{ code: 'XH_EXPR_FORBIDDEN_MEMBER', start: 0, end: 11, data: { name: '__proto__' } }])
    expect(check(ast('a[\'prototype\']'))).toEqual([{ code: 'XH_EXPR_FORBIDDEN_MEMBER', start: 0, end: 14, data: { name: 'prototype' } }])
  })

  it('一次报出全部问题，按遍历顺序', () => {
    const issues = check(ast('FOO(x) + ROUND() + y.constructor'), { identifiers: ['y'] })
    expect(issues.map(item => item.code)).toEqual([
      'XH_EXPR_UNKNOWN_FUNCTION',
      'XH_EXPR_UNKNOWN_IDENTIFIER',
      'XH_EXPR_ARGUMENT_COUNT',
      'XH_EXPR_FORBIDDEN_MEMBER',
    ])
    expect(Object.isFrozen(issues)).toBe(true)
  })

  it('按函数表检查', () => {
    const table = createFunctionTable({ builtins: ['SUM'] })
    expect(check(ast('SUM(1)'), { functions: table })).toEqual([])
    expect(check(ast('ROUND(1)'), { functions: table })[0]?.code).toBe('XH_EXPR_UNKNOWN_FUNCTION')
    expect(() => check(ast('1'), { functions: {} as never })).toThrow(TypeError)
  })

  it('结构不合法的语法树报 XH_EXPR_INVALID_AST', () => {
    const bad = (node: unknown): string[] => check(node as ExpressionNode).map(item => item.code)
    expect(bad({ type: 'Eval', start: 0, end: 1 })).toEqual(['XH_EXPR_INVALID_AST'])
    expect(bad({ type: 'Binary', operator: '**', left: { type: 'Number', value: '1', start: 0, end: 1 }, right: { type: 'Number', value: '1', start: 5, end: 6 }, start: 0, end: 6 })).toEqual(['XH_EXPR_INVALID_AST'])
    expect(bad({ type: 'Number', value: 'NaN', start: 0, end: 3 })).toEqual(['XH_EXPR_INVALID_AST'])
    expect(bad({ type: 'Number', value: '1e99', start: 0, end: 4 })).toEqual(['XH_EXPR_NUMBER_OVERFLOW'])
    expect(bad({ type: 'Literal', value: { x: 1 }, start: 0, end: 1 })).toEqual(['XH_EXPR_INVALID_AST'])
    expect(bad({ type: 'Identifier', name: 'a' })).toEqual(['XH_EXPR_INVALID_AST'])
    expect(bad(null)).toEqual(['XH_EXPR_INVALID_AST'])
    expect(bad({ type: 'Call', callee: 'SUM', arguments: 'x', start: 0, end: 1 })).toEqual(['XH_EXPR_INVALID_AST'])
  })

  it('语法树深度超过上限', () => {
    let node: unknown = { type: 'Number', value: '1', start: 0, end: 1 }
    for (let index = 0; index < 500; index += 1)
      node = { type: 'Unary', operator: '-', argument: node, start: 0, end: 1 }
    expect(check(node as ExpressionNode).map(item => item.code)).toEqual(['XH_EXPR_TOO_DEEP'])
    expect(check(ast('1 + 2 + 3'), { maxDepth: 2 }).map(item => item.code)).toEqual(['XH_EXPR_TOO_DEEP'])
  })
})

describe('compile', () => {
  it('解析失败时带解析问题', () => {
    expect(compile('a +')).toEqual({ ok: false, issues: [{ code: 'XH_EXPR_UNEXPECTED_END', start: 3, end: 3 }] })
  })

  it('检查失败时带全部检查问题', () => {
    const result = compile('a + b + c', { identifiers: ['a'] })
    expect(result.ok).toBe(false)
    expect(!result.ok && result.issues.map(item => item.data?.name)).toEqual(['b', 'c'])
  })

  it('成功时带语法树', () => {
    const result = compile('a + 1', { identifiers: ['a'] })
    expect(result.ok && result.ast.type).toBe('Binary')
  })
})
