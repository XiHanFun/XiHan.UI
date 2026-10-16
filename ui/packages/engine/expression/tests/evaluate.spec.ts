import type { ExpressionNode } from '../src'
import { describe, expect, it } from 'vitest'
import { evaluate, ExprDate, ExprList, ExprRecord, toExpressionValue, toPlain, typeOf } from '../src'
import { ast, issue, run } from './helpers'

const LOGIC = { t: true, f: false, n: null }

describe('求值：字面量与标识符', () => {
  it('字面量与数组', () => {
    expect(run('null')).toBeNull()
    expect(run('true')).toBe(true)
    expect(run('\'x\'')).toBe('x')
    expect(run('[1, \'a\', [null]]')).toEqual(['1', 'a', [null]])
  })

  it('标识符从作用域读取，缺失得到 null', () => {
    expect(run('a', { a: 'x' })).toBe('x')
    expect(run('missing', { a: 1 })).toBeNull()
    expect(run('a', { a: undefined })).toBeNull()
    expect(run('a')).toBeNull()
  })

  it('作用域可以是记录', () => {
    expect(run('a + 1', ExprRecord.from({ a: 2 }))).toBe('3')
  })
})

describe('求值：算术与 null', () => {
  it('任一运算数为 null 时结果为 null', () => {
    expect(run('a + 1')).toBeNull()
    expect(run('a * b', { a: 2 })).toBeNull()
    expect(run('-a')).toBeNull()
    expect(run('\'x\' + a')).toBeNull()
    expect(run('a / 0')).toBeNull()
  })

  it('加号只在两侧都是字符串时拼接，不做隐式转换', () => {
    expect(run('\'a\' + \'b\'')).toBe('ab')
    expect(issue('\'a\' + 1')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 6, end: 7, data: { operator: '+', actual: 'number' } })
    expect(issue('1 + \'a\'')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 4, end: 7, data: { operator: '+', actual: 'string' } })
    expect(issue('1 + true')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 4, end: 8, data: { operator: '+', actual: 'boolean' } })
    expect(issue('\'a\' - \'b\'')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 0, end: 3, data: { operator: '-', actual: 'string' } })
    expect(issue('[1] * 2')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { actual: 'list' } })
    expect(issue('true + null')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', start: 0, end: 4 })
  })

  it('一元运算', () => {
    expect(run('-(1 - 3)')).toBe('2')
    expect(run('!t', LOGIC)).toBe(false)
    expect(issue('-\'a\'')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 1, end: 4, data: { operator: '-', actual: 'string' } })
    expect(issue('!1')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { operator: '!', actual: 'number' } })
  })
})

describe('求值：比较', () => {
  it('相等比较任意类型，类型不同即不等', () => {
    expect(run('1 == 1.0')).toBe(true)
    expect(run('1 == \'1\'')).toBe(false)
    expect(run('null == null')).toBe(true)
    expect(run('a == null')).toBe(true)
    expect(run('0 == null')).toBe(false)
    expect(run('\'\' == null')).toBe(false)
    expect(run('true != false')).toBe(true)
    expect(run('[1, [2]] == [1, [2]]')).toBe(true)
    expect(run('[1, 2] == [2, 1]')).toBe(false)
    expect(run('r == s', { r: { x: 1, y: [1] }, s: { y: [1], x: 1 } })).toBe(true)
    expect(run('r == s', { r: { x: 1 }, s: { x: 1, y: 2 } })).toBe(false)
    expect(run('r == [1]', { r: { x: 1 } })).toBe(false)
  })

  it('大小比较只在同类的数字、字符串、日期之间进行', () => {
    expect(run('1 < 2')).toBe(true)
    expect(run('2 <= 2')).toBe(true)
    expect(run('\'b\' > \'a\'')).toBe(true)
    expect(run('\'B\' < \'a\'')).toBe(true)
    expect(run('\'中\' > \'z\'')).toBe(true)
    expect(run('1 < a')).toBeNull()
    expect(issue('1 < \'a\'')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 4, end: 7, data: { operator: '<', actual: 'string' } })
    expect(issue('true < false')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 0, end: 4, data: { operator: '<', actual: 'boolean' } })
    expect(issue('null < true')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', start: 7, end: 11 })
  })
})

describe('求值：逻辑运算是短路的三值逻辑', () => {
  it.each([
    ['t && t', true],
    ['t && f', false],
    ['t && n', null],
    ['f && t', false],
    ['f && n', false],
    ['n && t', null],
    ['n && f', false],
    ['n && n', null],
    ['t || n', true],
    ['f || f', false],
    ['f || n', null],
    ['n || t', true],
    ['n || f', null],
    ['n || n', null],
    ['!n', null],
  ])('%s = %s', (source, expected) => {
    expect(run(source, LOGIC)).toBe(expected)
  })

  it('短路时不求右侧', () => {
    expect(run('f && 1 / 0 > 1', LOGIC)).toBe(false)
    expect(run('t || 1 / 0 > 1', LOGIC)).toBe(true)
    expect(issue('n && 1 / 0 > 1', LOGIC).code).toBe('XH_EXPR_DIVISION_BY_ZERO')
  })

  it('运算数必须是布尔或 null', () => {
    expect(issue('1 && t', LOGIC)).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 0, end: 1, data: { operator: '&&', actual: 'number' } })
    expect(issue('t && \'x\'', LOGIC)).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { operator: '&&', actual: 'string' } })
  })

  it('条件运算：null 走否定分支，只求所选分支', () => {
    expect(run('n ? 1 : 2', LOGIC)).toBe('2')
    expect(run('t ? 1 : 1 / 0', LOGIC)).toBe('1')
    expect(issue('1 ? 2 : 3')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { operator: '?:', actual: 'number' } })
  })

  it('函数 IF 同样只求所选分支，缺省的否定分支是 null', () => {
    expect(run('IF(t, 1, 1 / 0)', LOGIC)).toBe('1')
    expect(run('if(f, 1)', LOGIC)).toBeNull()
    expect(run('IF(n, 1, 2)', LOGIC)).toBe('2')
    expect(issue('IF(\'x\', 1, 2)')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 3, end: 6, data: { function: 'IF', index: 0, actual: 'string' } })
  })
})

describe('求值：成员、投影与下标', () => {
  const scope = {
    items: [{ amount: 1, tag: 'a' }, { amount: 2.5 }, {}],
    orders: [{ lines: [{ qty: 1 }, { qty: 2 }] }, { lines: [{ qty: 3 }] }, null],
    nums: [1, 2],
    r: { x: 1, nested: { y: 'deep' } },
  }

  it('点号读字段，缺失字段与 null 对象得到 null', () => {
    expect(run('r.x', scope)).toBe('1')
    expect(run('r.nested.y', scope)).toBe('deep')
    expect(run('r.missing.y', scope)).toBeNull()
    expect(run('n.x', LOGIC)).toBeNull()
  })

  it('对列表取成员是逐元素投影，嵌套列表逐层投影', () => {
    expect(run('items.amount', scope)).toEqual(['1', '2.5', null])
    expect(run('SUM(items.amount)', scope)).toBe('3.5')
    expect(run('orders.lines.qty', scope)).toEqual([['1', '2'], ['3'], null])
    expect(run('SUM(orders.lines.qty)', scope)).toBe('6')
    expect(issue('nums.x', scope)).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 0, end: 6, data: { operator: '.', actual: 'number' } })
    expect(issue('\'abc\'.length')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { operator: '.', actual: 'string' } })
  })

  it('下标：列表取整数下标，记录取字符串键，越界得到 null', () => {
    expect(run('items[1].amount', scope)).toBe('2.5')
    expect(run('items[5]', scope)).toBeNull()
    expect(run('items[-1]', scope)).toBeNull()
    expect(run('items[1e30]', scope)).toBeNull()
    expect(run('r[\'x\']', scope)).toBe('1')
    expect(run('r[k]', { ...scope, k: 'x' })).toBe('1')
    expect(run('items[n]', { ...scope, n: null })).toBeNull()
    expect(issue('items[0.5]', scope)).toEqual({ code: 'XH_EXPR_INVALID_INDEX', start: 6, end: 9 })
    expect(issue('items[\'a\']', scope)).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 6, end: 9, data: { operator: '[]', actual: 'string' } })
    expect(issue('r[1]', scope)).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { operator: '[]', actual: 'number' } })
    expect(issue('\'abc\'[0]')).toEqual({ code: 'XH_EXPR_TYPE_MISMATCH', start: 0, end: 8, data: { operator: '[]', actual: 'string' } })
  })
})

describe('求值：上限', () => {
  it('步数上限', () => {
    const items = Array.from({ length: 1000 }).fill(1)
    expect(issue('SUM(items)', { items }, { maxSteps: 100 })).toMatchObject({ code: 'XH_EXPR_STEP_LIMIT', data: { max: 100, function: 'SUM' } })
    expect(run('SUM(items)', { items })).toBe('1000')
    expect(issue('1 + 2 + 3', {}, { maxSteps: 3 })).toMatchObject({ code: 'XH_EXPR_STEP_LIMIT', data: { max: 3 } })
  })

  it('嵌套深度上限：语法树与嵌套数据都计深', () => {
    expect(evaluate(ast('a + b + c + d'), {}, { maxDepth: 3 })).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_DEPTH_LIMIT', data: { max: 3 } } })
    let nested: unknown = [1]
    for (let index = 0; index < 200; index += 1)
      nested = [nested]
    expect(issue('SUM(x)', { x: nested }).code).toBe('XH_EXPR_DEPTH_LIMIT')
    expect(issue('COUNT(x)', { x: nested }).code).toBe('XH_EXPR_DEPTH_LIMIT')
    expect(issue('x == x', { x: nested }).code).toBe('XH_EXPR_DEPTH_LIMIT')
  })

  it('字符串长度上限', () => {
    expect(issue('\'ab\' + \'cd\'', {}, { maxStringLength: 3 })).toMatchObject({ code: 'XH_EXPR_STRING_TOO_LONG', data: { max: 3 } })
    expect(run('\'ab\' + \'c\'', {}, { maxStringLength: 3 })).toBe('abc')
  })

  it('选项不合法时抛 TypeError', () => {
    const tree = ast('1')
    expect(() => evaluate(tree, {}, { maxSteps: -1 })).toThrow(TypeError)
    expect(() => evaluate(tree, {}, { functions: {} as never })).toThrow(TypeError)
    expect(() => evaluate(tree, {}, { now: new Date() as never })).toThrow(TypeError)
    expect(() => evaluate(tree, new Map() as never)).toThrow(TypeError)
  })
})

describe('求值：确定性与可序列化', () => {
  it('同一棵树、同样的输入，多次求值结果相同且互不影响', () => {
    const tree = ast('ROUND(SUM(items.amount) / COUNT(items), 2) + 0.1')
    const scope = { items: [{ amount: 1 }, { amount: 2 }, { amount: 2 }] }
    const results = Array.from({ length: 5 }, () => {
      const result = evaluate(tree, scope)
      return result.ok ? toPlain(result.value) : result.issue.code
    })
    expect(new Set(results)).toEqual(new Set([1.77]))
  })

  it('从 JSON 还原的语法树求值结果相同', () => {
    const tree = ast('IF(a > 1, CONCAT(\'x\', b[0]), null)')
    const restored = JSON.parse(JSON.stringify(tree)) as ExpressionNode
    expect(evaluate(restored, { a: 2, b: ['y'] })).toEqual(evaluate(tree, { a: 2, b: ['y'] }))
  })
})

describe('值的转换', () => {
  it('toPlain 转成 JSON 能表示的值', () => {
    const date = ExprDate.fromParts(2026, 10, 16)!
    expect(toPlain(toExpressionValue({ a: 1.5, b: [date, null, true], c: { d: 'x' } }))).toEqual({ a: 1.5, b: ['2026-10-16', null, true], c: { d: 'x' } })
  })

  it('toExpressionValue 拒绝不可表示的值', () => {
    expect(() => toExpressionValue(Number.NaN)).toThrow(TypeError)
    expect(() => toExpressionValue(new Date())).toThrow(TypeError)
    expect(() => toExpressionValue(() => 1)).toThrow(TypeError)
    expect(() => toExpressionValue(Symbol('x'))).toThrow(TypeError)
    expect(typeOf(toExpressionValue(10n))).toBe('number')
  })

  it('toPlain 遇到环或过深的嵌套抛 RangeError', () => {
    const cyclic: Record<string, unknown> = {}
    cyclic.self = cyclic
    expect(() => toPlain(toExpressionValue(cyclic))).toThrow(RangeError)
  })

  it('列表与记录只读', () => {
    const list = ExprList.of(['a', null])
    expect(list.length).toBe(2)
    expect(list.at(0)).toBe('a')
    expect(list.at(9)).toBeNull()
    expect([...list]).toEqual(['a', null])
    expect(Object.isFrozen(list)).toBe(true)
    expect(() => ExprList.of([1 as never])).toThrow(TypeError)
    const record = ExprRecord.from({ a: 1, b: 'x' })
    expect(record.keys()).toEqual(['a', 'b'])
    expect(record.has('a')).toBe(true)
    expect(record.get('zzz')).toBeNull()
    expect(Object.isFrozen(record)).toBe(true)
    expect(() => ExprRecord.from(new Map() as never)).toThrow(TypeError)
  })
})
