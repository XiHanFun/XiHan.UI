import type { ExpressionNode } from '../src'
import { describe, expect, it } from 'vitest'
import { collectReferences, isPlainName, print } from '../src'
import { ast, shape } from './helpers'

describe('打印成规范源码', () => {
  it.each([
    ['1+2*3', '1 + 2 * 3'],
    ['(1+2)*3', '(1 + 2) * 3'],
    ['a-(b-c)', 'a - (b - c)'],
    ['(a-b)-c', 'a - b - c'],
    ['a/(b*c)', 'a / (b * c)'],
    ['(a<b)==c', 'a < b == c'],
    ['(a==b)==c', '(a == b) == c'],
    ['a==(b==c)', 'a == (b == c)'],
    ['(a<b)<c', '(a < b) < c'],
    ['a?b:c?d:e', 'a ? b : c ? d : e'],
    ['(a?b:c)?d:e', '(a ? b : c) ? d : e'],
    ['a?(b?c:d):e', 'a ? b ? c : d : e'],
    ['(a?b:c)+1', '(a ? b : c) + 1'],
    ['-(-a)', '--a'],
    ['-(a+b)', '-(a + b)'],
    ['!(a&&b)', '!(a && b)'],
    ['a||b&&c', 'a || b && c'],
    ['(a||b)&&c', '(a || b) && c'],
    ['(-a).b', '(-a).b'],
    ['(1).x', '(1).x'],
    ['(a+b)[0]', '(a + b)[0]'],
    ['sum(1,2)', 'sum(1, 2)'],
    ['[1,[2,3]]', '[1, [2, 3]]'],
    ['a[0]["b"]', 'a[0][\'b\']'],
    ['"it\'s"', '\'it\\\'s\''],
    ['\'a\\nb\\u0001\'', '\'a\\nb\\u0001\''],
    ['`a b`.c', '`a b`.c'],
    ['a.`x y`', 'a.`x y`'],
    ['`true`', '`true`'],
    ['a.null', 'a.null'],
    ['订单.金额', '订单.金额'],
    ['1.50e1', '15'],
  ])('%s → %s', (source, expected) => {
    expect(print(ast(source))).toBe(expected)
  })

  it.each([
    'a + b * c - d / e % f',
    'a ? b ? c : d : e ? f : g',
    'IF(a > 1 && !b, CONCAT(\'x\', c.d[0]), null)',
    '-a.b[c] * -(d + e)',
    '[1, 2, [3, `x y`]].length',
    '(a || b) && (c || d) == e',
    '\'\\u2028\\u2029\\\\\\\'\'',
    'x[`a\\`b`] != y',
  ])('打印结果再解析得到同一棵树：%s', (source) => {
    const first = ast(source)
    const printed = print(first)
    expect(shape(ast(printed))).toEqual(shape(first))
    expect(print(ast(printed))).toBe(printed)
  })

  it('不合法的语法树抛 TypeError', () => {
    expect(() => print({ type: 'Eval', start: 0, end: 0 } as unknown as ExpressionNode)).toThrow(TypeError)
    expect(() => print({ type: 'Call', callee: 'a.b', arguments: [], start: 0, end: 0 })).toThrow(TypeError)
  })

  it('isPlainName 判断能否不加反引号', () => {
    expect(isPlainName('amount')).toBe(true)
    expect(isPlainName('订单金额')).toBe(true)
    expect(isPlainName('$row')).toBe(true)
    expect(isPlainName('1a')).toBe(false)
    expect(isPlainName('a b')).toBe(false)
    expect(isPlainName('null')).toBe(false)
    expect(isPlainName('')).toBe(false)
  })
})

describe('收集字段引用', () => {
  it('按源码顺序列出最长静态路径', () => {
    const refs = collectReferences(ast('a.b[c].d + SUM(items.amount) + x[\'y\'].z + f(g)[0]'))
    expect(refs.map(ref => ref.path)).toEqual([['a', 'b'], ['c'], ['items', 'amount'], ['x', 'y', 'z'], ['g']])
    expect(refs[0]).toEqual({ path: ['a', 'b'], start: 0, end: 3 })
  })

  it('字面量与函数名不算引用', () => {
    expect(collectReferences(ast('NOW() + 1'))).toEqual([])
  })

  it('同一字段出现多次就列出多次', () => {
    expect(collectReferences(ast('a ? a : -a')).map(ref => ref.start)).toEqual([0, 4, 9])
  })
})
