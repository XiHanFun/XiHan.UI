import type { ExpressionNode } from '../src'
import { describe, expect, it } from 'vitest'
import { createFunctionTable, evaluate, ExprRecord } from '../src'
import { ast, issue, run } from './helpers'

function evalNode(node: unknown, scope?: Record<string, unknown>) {
  return evaluate(node as ExpressionNode, scope)
}

describe('恶意输入：原型链', () => {
  it.each([
    ['constructor', 0, 11],
    ['a.constructor', 0, 13],
    ['a.__proto__', 0, 11],
    ['a.prototype', 0, 11],
    ['a[\'__proto__\']', 0, 14],
    ['a[\'__pro\' + \'to__\']', 0, 19],
    ['a[CONCAT(\'constr\', \'uctor\')]', 0, 28],
    ['items.constructor', 0, 17],
  ])('%s 报 XH_EXPR_FORBIDDEN_MEMBER', (source, start, end) => {
    expect(issue(source, { a: {}, items: [{}] })).toMatchObject({ code: 'XH_EXPR_FORBIDDEN_MEMBER', start, end })
  })

  it('只读自有的数据属性：继承来的成员读不到', () => {
    expect(run('a.toString', { a: {} })).toBeNull()
    expect(run('a.hasOwnProperty', { a: {} })).toBeNull()
    expect(run('a.valueOf', { a: { x: 1 } })).toBeNull()
    expect(run('items.length', { items: [{ length: 3 }] })).toEqual(['3'])
    expect(run('toString')).toBeNull()
  })

  it('原型不是 Object.prototype 或 null 的对象不可表示', () => {
    const inherited = Object.create({ secret: 1 }) as object
    expect(issue('a', { a: inherited })).toMatchObject({ code: 'XH_EXPR_UNSUPPORTED_VALUE', start: 0, end: 1 })
    expect(issue('a.secret', { a: inherited }).code).toBe('XH_EXPR_UNSUPPORTED_VALUE')
    expect(() => evaluate(ast('secret'), inherited as never)).toThrow(TypeError)
    expect(run('a.x', { a: Object.assign(Object.create(null) as object, { x: 1 }) })).toBe('1')
  })

  it('函数、类实例、Map、Date、Symbol 都不可表示', () => {
    expect(issue('f', { f: () => 1 }).code).toBe('XH_EXPR_UNSUPPORTED_VALUE')
    expect(issue('m', { m: new Map() }).code).toBe('XH_EXPR_UNSUPPORTED_VALUE')
    expect(issue('d', { d: new Date() }).code).toBe('XH_EXPR_UNSUPPORTED_VALUE')
    expect(issue('s', { s: Symbol('x') }).code).toBe('XH_EXPR_UNSUPPORTED_VALUE')
    expect(issue('n', { n: Number.NaN }).code).toBe('XH_EXPR_UNSUPPORTED_VALUE')
    expect(issue('n', { n: Number.POSITIVE_INFINITY }).code).toBe('XH_EXPR_UNSUPPORTED_VALUE')
    expect(issue('n', { n: 1e300 }).code).toBe('XH_EXPR_NUMBER_OVERFLOW')
    expect(issue('SUM(list)', { list: [1, () => 2] })).toMatchObject({ code: 'XH_EXPR_UNSUPPORTED_VALUE', data: { function: 'SUM' } })
  })

  it('不触发 getter', () => {
    let called = 0
    const data = {
      get x() {
        called += 1
        return 1
      },
    }
    const list: unknown[] = []
    Object.defineProperty(list, 0, { enumerable: true, get: () => (called += 1) })
    expect(run('a.x', { a: data })).toBeNull()
    expect(run('l[0]', { l: list })).toBeNull()
    expect(run('COUNT(l)', { l: list })).toBe('0')
    expect(evaluate(ast('x'), data).ok).toBe(true)
    expect(called).toBe(0)
  })

  it('求值不改动任何对象，也不污染原型', () => {
    const scope = { a: { b: [1, 2] } }
    const before = JSON.stringify(scope)
    run('a.b[0] + SUM(a.b) + COUNT(a)', scope)
    run('CONCAT(\'__proto__\', \'x\')', scope)
    expect(JSON.stringify(scope)).toBe(before)
    expect(Object.keys(Object.prototype)).toEqual([])
    expect(({} as Record<string, unknown>).x).toBeUndefined()
  })

  it('不提供赋值、方法调用或任意代码执行的语法', () => {
    expect(issue('a.b = 1').code).toBe('XH_EXPR_UNEXPECTED_CHARACTER')
    expect(issue('a.constructor(\'return 1\')()').code).toBe('XH_EXPR_INVALID_CALLEE')
    expect(issue('(() => 1)()').code).toBe('XH_EXPR_UNEXPECTED_CHARACTER')
    expect(issue('(function () {})()').code).toBe('XH_EXPR_UNEXPECTED_CHARACTER')
    expect(run(['`', '$', '{1}', '`'].join(''))).toBeNull()
    expect(issue('eval(\'1\')').code).toBe('XH_EXPR_UNKNOWN_FUNCTION')
    expect(issue('Function(\'return 1\')').code).toBe('XH_EXPR_UNKNOWN_FUNCTION')
    expect(issue('a; b').code).toBe('XH_EXPR_UNEXPECTED_CHARACTER')
    expect(issue('new Date()').code).toBe('XH_EXPR_UNEXPECTED_TOKEN')
  })
})

describe('恶意输入：伪造的语法树', () => {
  it('结构不合法时报 XH_EXPR_INVALID_AST，不抛异常', () => {
    expect(evalNode(null)).toEqual({ ok: false, issue: { code: 'XH_EXPR_INVALID_AST', start: 0, end: 0 } })
    expect(evalNode({ type: 'Eval', code: '1', start: 0, end: 1 })).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_INVALID_AST' } })
    expect(evalNode({ type: 'Literal', value: { evil: 1 }, start: 0, end: 1 })).toMatchObject({ issue: { code: 'XH_EXPR_INVALID_AST' } })
    expect(evalNode({ type: 'Number', value: 'NaN', start: 0, end: 1 })).toMatchObject({ issue: { code: 'XH_EXPR_INVALID_AST' } })
    expect(evalNode({ type: 'Number', value: 1, start: 0, end: 1 })).toMatchObject({ issue: { code: 'XH_EXPR_INVALID_AST' } })
    expect(evalNode({ type: 'Binary', operator: '**', left: null, right: null, start: 0, end: 1 })).toMatchObject({ issue: { code: 'XH_EXPR_INVALID_AST' } })
    expect(evalNode({ type: 'Unary', operator: '~', argument: null, start: 0, end: 1 })).toMatchObject({ issue: { code: 'XH_EXPR_INVALID_AST' } })
    expect(evalNode({ type: 'Call', callee: 'SUM', arguments: { length: 1 }, start: 0, end: 1 })).toMatchObject({ issue: { code: 'XH_EXPR_INVALID_AST' } })
    expect(evalNode({ type: 'Array', elements: 'abc', start: 0, end: 1 })).toMatchObject({ issue: { code: 'XH_EXPR_INVALID_AST' } })
    expect(evalNode({ type: 'Conditional', test: { type: 'Literal', value: true, start: 0, end: 1 }, start: 0, end: 1 })).toMatchObject({ issue: { code: 'XH_EXPR_INVALID_AST' } })
  })

  it('伪造的节点同样过成员名与函数名检查', () => {
    expect(evalNode({ type: 'Identifier', name: '__proto__', start: 0, end: 9 }, {})).toMatchObject({ issue: { code: 'XH_EXPR_FORBIDDEN_MEMBER' } })
    expect(evalNode({ type: 'Member', object: { type: 'Literal', value: 'x', start: 0, end: 3 }, property: 'constructor', start: 0, end: 15 })).toMatchObject({ issue: { code: 'XH_EXPR_FORBIDDEN_MEMBER' } })
    expect(evalNode({ type: 'Call', callee: 'constructor', arguments: [], start: 0, end: 13 })).toMatchObject({ issue: { code: 'XH_EXPR_UNKNOWN_FUNCTION' } })
    expect(evalNode({ type: 'Call', callee: 'toString', arguments: [], start: 0, end: 10 })).toMatchObject({ issue: { code: 'XH_EXPR_UNKNOWN_FUNCTION' } })
    expect(evalNode({ type: 'Call', callee: '__proto__', arguments: [], start: 0, end: 11 })).toMatchObject({ issue: { code: 'XH_EXPR_UNKNOWN_FUNCTION' } })
  })

  it('带环的语法树按深度上限停下', () => {
    const node: Record<string, unknown> = { type: 'Unary', operator: '-', start: 0, end: 1 }
    node.argument = node
    expect(evalNode(node)).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_DEPTH_LIMIT' } })
  })

  it('区间不合法时问题区间退回 0', () => {
    expect(evalNode({ type: 'Eval', start: -1, end: 'x' })).toEqual({ ok: false, issue: { code: 'XH_EXPR_INVALID_AST', start: 0, end: 0 } })
  })
})

describe('恶意输入：资源耗尽', () => {
  it('超长源码立即拒绝', () => {
    expect(issue('1+'.repeat(500_000)).code).toBe('XH_EXPR_TOO_LONG')
  })

  it('巨大的数字字面量不会产生巨大的整数', () => {
    expect(issue(`1${'0'.repeat(9000)}`).code).toBe('XH_EXPR_NUMBER_OVERFLOW')
    expect(run(`0.${'0'.repeat(9000)}1`)).toBe('0')
    expect(issue('TO_NUMBER(s)', { s: '1'.repeat(90_000) }).code).toBe('XH_EXPR_NUMBER_OVERFLOW')
    expect(issue('TO_NUMBER(\'1e99999999999999999999\')').code).toBe('XH_EXPR_NUMBER_OVERFLOW')
    expect(run('TO_NUMBER(\'1e-99999999999999999999\')')).toBe('0')
  })

  it('大次幂在有限时间内得到结果', () => {
    const started = Date.now()
    expect(issue('POWER(9.999999999999999999999999999999999, 999)').code).toBe('XH_EXPR_NUMBER_OVERFLOW')
    expect(run('POWER(0.9999999999999999999999999999999999, 999)')).toMatch(/^0\.99999999999999999999999999999/)
    expect(run('POWER(0.9999999999999999999999999999999999, -999)')).toMatch(/^1\.00000000000000000000000000000/)
    expect(Date.now() - started).toBeLessThan(2000)
  })

  it('字符串放大在分配之前拦下', () => {
    let source = '\'aaaaaaaaaa\''
    for (let index = 0; index < 12; index += 1)
      source = `REPLACE(${source}, 'a', 'aaaaaaaaaa')`
    expect(issue(source)).toMatchObject({ code: 'XH_EXPR_STRING_TOO_LONG', data: { function: 'REPLACE' } })
    expect(issue('CONCAT(s, s, s)', { s: 'x'.repeat(40_000) }).code).toBe('XH_EXPR_STRING_TOO_LONG')
    expect(issue('JOIN([s, s, s])', { s: 'x'.repeat(40_000) }).code).toBe('XH_EXPR_STRING_TOO_LONG')
    expect(issue('FORMAT_DATE(DATE(2026, 1, 1), p)', { p: 'yyyy'.repeat(30_000) }).code).toBe('XH_EXPR_STRING_TOO_LONG')
  })

  it('大列表的遍历受步数上限约束', () => {
    const big = Array.from({ length: 200_000 }, (_, index) => index)
    expect(issue('SUM(big)', { big }).code).toBe('XH_EXPR_STEP_LIMIT')
    expect(issue('CONTAINS(big, -1)', { big }).code).toBe('XH_EXPR_STEP_LIMIT')
    expect(issue('big == big', { big }).code).toBe('XH_EXPR_STEP_LIMIT')
    expect(issue('SPLIT(s, \',\')', { s: ','.repeat(150_000) }, { maxStringLength: 200_000 }).code).toBe('XH_EXPR_STEP_LIMIT')
  })

  it('带环的宿主数据按深度上限停下', () => {
    const cyclic: unknown[] = [1]
    cyclic.push(cyclic)
    expect(issue('COUNT(x)', { x: cyclic }).code).toBe('XH_EXPR_DEPTH_LIMIT')
    const record: Record<string, unknown> = { v: 1 }
    record.self = record
    const other: Record<string, unknown> = { v: 1 }
    other.self = other
    expect(issue('a == b', { a: record, b: other }).code).toBe('XH_EXPR_DEPTH_LIMIT')
    expect(run('a.self.self.self.v', { a: record })).toBe('1')
  })

  it('不可信的正则式样输入不会造成回溯', () => {
    const started = Date.now()
    expect(run('TO_DATE(s)', { s: `${'2'.repeat(50_000)}x` })).toBeNull()
    expect(run('TO_NUMBER(s)', { s: `${'1'.repeat(50_000)}.${'1'.repeat(40_000)}x` })).toBeNull()
    expect(Date.now() - started).toBeLessThan(2000)
  })
})

describe('确定性', () => {
  it('没有宿主提供的当前时间就不读时钟', () => {
    expect(issue('NOW()').code).toBe('XH_EXPR_NOW_UNAVAILABLE')
  })

  it('宿主函数只拿到只读值', () => {
    const seen: unknown[] = []
    const functions = createFunctionTable({
      functions: [{
        name: 'PEEK',
        minArgs: 1,
        maxArgs: 1,
        call: ([value]) => {
          seen.push(value)
          return null
        },
      }],
    })
    run('PEEK(a)', { a: { x: 1 } }, { functions })
    const record = seen[0] as ExprRecord
    expect(record).toBeInstanceOf(ExprRecord)
    expect(Object.isFrozen(record)).toBe(true)
    expect(Object.keys(record)).toEqual([])
  })
})
