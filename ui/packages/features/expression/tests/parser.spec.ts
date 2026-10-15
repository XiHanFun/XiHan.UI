import { describe, expect, it } from 'vitest'
import { parse } from '../src'
import { ast, issue, run, shape } from './helpers'

describe('解析：语法树形状', () => {
  it('乘除先于加减，左结合', () => {
    expect(shape(ast('1 + 2 * 3'))).toEqual({
      type: 'Binary',
      operator: '+',
      left: { type: 'Number', value: '1' },
      right: { type: 'Binary', operator: '*', left: { type: 'Number', value: '2' }, right: { type: 'Number', value: '3' } },
    })
    expect(shape(ast('a - b - c'))).toEqual({
      type: 'Binary',
      operator: '-',
      left: { type: 'Binary', operator: '-', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
      right: { type: 'Identifier', name: 'c' },
    })
  })

  it('优先级由低到高：条件、或、与、相等、关系、加减、乘除、一元、后缀', () => {
    expect(shape(ast('a || b && c == d < e + f * -g.h'))).toEqual({
      type: 'Logical',
      operator: '||',
      left: { type: 'Identifier', name: 'a' },
      right: {
        type: 'Logical',
        operator: '&&',
        left: { type: 'Identifier', name: 'b' },
        right: {
          type: 'Binary',
          operator: '==',
          left: { type: 'Identifier', name: 'c' },
          right: {
            type: 'Binary',
            operator: '<',
            left: { type: 'Identifier', name: 'd' },
            right: {
              type: 'Binary',
              operator: '+',
              left: { type: 'Identifier', name: 'e' },
              right: {
                type: 'Binary',
                operator: '*',
                left: { type: 'Identifier', name: 'f' },
                right: { type: 'Unary', operator: '-', argument: { type: 'Member', object: { type: 'Identifier', name: 'g' }, property: 'h' } },
              },
            },
          },
        },
      },
    })
  })

  it('条件运算右结合', () => {
    expect(shape(ast('a ? b : c ? d : e'))).toEqual({
      type: 'Conditional',
      test: { type: 'Identifier', name: 'a' },
      consequent: { type: 'Identifier', name: 'b' },
      alternate: {
        type: 'Conditional',
        test: { type: 'Identifier', name: 'c' },
        consequent: { type: 'Identifier', name: 'd' },
        alternate: { type: 'Identifier', name: 'e' },
      },
    })
  })

  it('成员、下标、调用与数组字面量', () => {
    expect(shape(ast('SUM(items[0].price, [1, 2], x[\'k\'])'))).toEqual({
      type: 'Call',
      callee: 'SUM',
      arguments: [
        { type: 'Member', object: { type: 'Index', object: { type: 'Identifier', name: 'items' }, index: { type: 'Number', value: '0' } }, property: 'price' },
        { type: 'Array', elements: [{ type: 'Number', value: '1' }, { type: 'Number', value: '2' }] },
        { type: 'Index', object: { type: 'Identifier', name: 'x' }, index: { type: 'Literal', value: 'k' } },
      ],
    })
    expect(shape(ast('NOW()'))).toEqual({ type: 'Call', callee: 'NOW', arguments: [] })
    expect(shape(ast('[]'))).toEqual({ type: 'Array', elements: [] })
  })

  it('节点带源码区间', () => {
    const tree = ast('a + foo(b)') as { start: number, end: number, left: { start: number, end: number }, right: { start: number, end: number } }
    expect([tree.start, tree.end]).toEqual([0, 10])
    expect([tree.left.start, tree.left.end]).toEqual([0, 1])
    expect([tree.right.start, tree.right.end]).toEqual([4, 10])
  })

  it('语法树冻结、可 JSON 往返', () => {
    const tree = ast('IF(a > 1, \'x\', [true, null])')
    expect(Object.isFrozen(tree)).toBe(true)
    expect(JSON.parse(JSON.stringify(tree))).toEqual(tree)
  })
})

describe('解析：词法', () => {
  it('字面量', () => {
    expect(shape(ast('true'))).toEqual({ type: 'Literal', value: true })
    expect(shape(ast('null'))).toEqual({ type: 'Literal', value: null })
    expect(shape(ast('TRUE'))).toEqual({ type: 'Identifier', name: 'TRUE' })
    expect(shape(ast('1.50'))).toEqual({ type: 'Number', value: '1.5' })
    expect(shape(ast('1.2E+3'))).toEqual({ type: 'Number', value: '1200' })
    expect(shape(ast('007'))).toEqual({ type: 'Number', value: '7' })
  })

  it('字符串转义', () => {
    expect(run('\'it\\\'s\'')).toBe('it\'s')
    expect(run('"say \\"hi\\""')).toBe('say "hi"')
    expect(run('\'a\\nb\\tc\\rd\\\\e\'')).toBe('a\nb\tc\rd\\e')
    expect(run('\'\\u4E2D\\u6587\'')).toBe('中文')
    expect(run('"单引号\'在双引号里"')).toBe('单引号\'在双引号里')
    expect(run('\'换\n行\'')).toBe('换\n行')
  })

  it('标识符可用中文与补充平面字符，反引号可写任意名字', () => {
    expect(run('订单金额 * 2', { 订单金额: 3 })).toBe('6')
    expect(run('𠮷 + 1', { '𠮷': 1 })).toBe('2')
    expect(run('`order amount` + 1', { 'order amount': 1 })).toBe('2')
    expect(run('`a\\`b`', { 'a`b': 'ok' })).toBe('ok')
    expect(run('`true`', { true: 'field' })).toBe('field')
    expect(run('$row.price', { $row: { price: 5 } })).toBe('5')
    expect(run('a.null', { a: { null: 1 } })).toBe('1')
  })

  it('全角空格、不换行空格与换行都是空白', () => {
    expect(run('a\u3000+\u00A0b\n*\r\n2', { a: 1, b: 2 })).toBe('5')
  })
})

describe('解析：问题码与区间', () => {
  it.each([
    ['', { code: 'XH_EXPR_EMPTY', start: 0, end: 0 }],
    ['   ', { code: 'XH_EXPR_EMPTY', start: 0, end: 3 }],
    ['1 +', { code: 'XH_EXPR_UNEXPECTED_END', start: 3, end: 3 }],
    ['1 2', { code: 'XH_EXPR_UNEXPECTED_TOKEN', start: 2, end: 3, data: { kind: 'number' } }],
    ['a b', { code: 'XH_EXPR_UNEXPECTED_TOKEN', start: 2, end: 3, data: { kind: 'name', token: 'b' } }],
    ['(1', { code: 'XH_EXPR_UNEXPECTED_END', start: 2, end: 2 }],
    ['1)', { code: 'XH_EXPR_UNEXPECTED_TOKEN', start: 1, end: 2, data: { kind: 'punct', token: ')' } }],
    ['a = 1', { code: 'XH_EXPR_UNEXPECTED_CHARACTER', start: 2, end: 3, data: { char: '=' } }],
    ['a & b', { code: 'XH_EXPR_UNEXPECTED_CHARACTER', start: 2, end: 3, data: { char: '&' } }],
    ['a | b', { code: 'XH_EXPR_UNEXPECTED_CHARACTER', start: 2, end: 3, data: { char: '|' } }],
    ['SUM（1）', { code: 'XH_EXPR_UNEXPECTED_CHARACTER', start: 3, end: 4, data: { char: '（' } }],
    ['a，b', { code: 'XH_EXPR_UNEXPECTED_CHARACTER', start: 1, end: 2, data: { char: '，' } }],
    ['#', { code: 'XH_EXPR_UNEXPECTED_CHARACTER', start: 0, end: 1, data: { char: '#' } }],
    ['\'abc', { code: 'XH_EXPR_UNTERMINATED_STRING', start: 0, end: 4 }],
    ['`abc', { code: 'XH_EXPR_UNTERMINATED_STRING', start: 0, end: 4 }],
    ['\'a\\', { code: 'XH_EXPR_UNTERMINATED_STRING', start: 2, end: 3 }],
    ['\'a\\qb\'', { code: 'XH_EXPR_INVALID_ESCAPE', start: 2, end: 4 }],
    ['\'\\u12\'', { code: 'XH_EXPR_INVALID_ESCAPE', start: 1, end: 6 }],
    ['`a\\nb`', { code: 'XH_EXPR_INVALID_ESCAPE', start: 2, end: 4 }],
    ['``', { code: 'XH_EXPR_INVALID_IDENTIFIER', start: 0, end: 2 }],
    ['1e', { code: 'XH_EXPR_INVALID_NUMBER', start: 0, end: 2 }],
    ['1e+', { code: 'XH_EXPR_INVALID_NUMBER', start: 0, end: 3 }],
    ['12abc', { code: 'XH_EXPR_INVALID_NUMBER', start: 0, end: 5 }],
    ['1e65', { code: 'XH_EXPR_NUMBER_OVERFLOW', start: 0, end: 4 }],
    ['.5', { code: 'XH_EXPR_UNEXPECTED_TOKEN', start: 0, end: 1, data: { kind: 'punct', token: '.' } }],
    ['1.', { code: 'XH_EXPR_UNEXPECTED_END', start: 2, end: 2 }],
    ['a < b < c', { code: 'XH_EXPR_CHAINED_COMPARISON', start: 6, end: 7 }],
    ['a == b != c', { code: 'XH_EXPR_CHAINED_COMPARISON', start: 7, end: 9 }],
    ['a.b()', { code: 'XH_EXPR_INVALID_CALLEE', start: 0, end: 4 }],
    ['(f)(1)', { code: 'XH_EXPR_INVALID_CALLEE', start: 1, end: 4 }],
    ['`f`(1)', { code: 'XH_EXPR_INVALID_CALLEE', start: 0, end: 4 }],
    ['f$(1)', { code: 'XH_EXPR_INVALID_CALLEE', start: 0, end: 2 }],
    ['函数(1)', { code: 'XH_EXPR_INVALID_CALLEE', start: 0, end: 2 }],
    ['true(1)', { code: 'XH_EXPR_INVALID_CALLEE', start: 0, end: 5 }],
    ['a ? b', { code: 'XH_EXPR_UNEXPECTED_END', start: 5, end: 5 }],
    ['[1, ]', { code: 'XH_EXPR_UNEXPECTED_TOKEN', start: 4, end: 5, data: { kind: 'punct', token: ']' } }],
    ['f(1,)', { code: 'XH_EXPR_UNEXPECTED_TOKEN', start: 4, end: 5, data: { kind: 'punct', token: ')' } }],
    ['a.1', { code: 'XH_EXPR_UNEXPECTED_TOKEN', start: 2, end: 3, data: { kind: 'number' } }],
  ])('%j', (source, expected) => {
    expect(issue(source)).toEqual(expected)
  })
})

describe('解析：上限', () => {
  it('源码长度超过 maxLength', () => {
    expect(issue('x'.repeat(10_001))).toEqual({ code: 'XH_EXPR_TOO_LONG', start: 0, end: 10_001, data: { max: 10_000 } })
    expect(parse('abcdef', { maxLength: 5 })).toEqual({ ok: false, issue: { code: 'XH_EXPR_TOO_LONG', start: 0, end: 6, data: { max: 5 } } })
  })

  it('括号、一元与左结合链都受深度上限约束，不会耗尽调用栈', () => {
    expect(issue(`${'('.repeat(4000)}1${')'.repeat(4000)}`).code).toBe('XH_EXPR_TOO_DEEP')
    expect(issue(`${'['.repeat(5000)}`).code).toBe('XH_EXPR_TOO_DEEP')
    expect(issue(`${'-'.repeat(5000)}1`).code).toBe('XH_EXPR_TOO_DEEP')
    expect(issue(`a${' + a'.repeat(150)}`).code).toBe('XH_EXPR_TOO_DEEP')
    expect(issue(`${'f('.repeat(5000)}`).code).toBe('XH_EXPR_TOO_DEEP')
    expect(issue('1 + 2 + 3', {}, { maxDepth: 2 }).code).toBe('XH_EXPR_TOO_DEEP')
    expect(parse('1 + 2', { maxDepth: 2 }).ok).toBe(true)
  })

  it('上限选项必须是正整数', () => {
    expect(() => parse('1', { maxDepth: 0 })).toThrow(TypeError)
    expect(() => parse('1', { maxLength: 1.5 })).toThrow(TypeError)
  })
})
