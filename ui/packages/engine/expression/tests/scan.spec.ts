import type { ExpressionToken } from '../src'
import { describe, expect, it } from 'vitest'
import { parse, scanTokens } from '../src'

/** 词按「种类:原文」列出，便于对照。 */
function words(source: string): string[] {
  return scanTokens(source).map(token => `${token.kind}:${source.slice(token.start, token.end)}`)
}

describe('scanTokens', () => {
  it('名字、数字、字符串、运算符与标点各成一类，跳过空白', () => {
    expect(words('IF(amount >= 1e3, `单价`, \'低\') && !done')).toEqual([
      'identifier:IF',
      'punctuation:(',
      'identifier:amount',
      'operator:>=',
      'number:1e3',
      'punctuation:,',
      'identifier:`单价`',
      'punctuation:,',
      'string:\'低\'',
      'punctuation:)',
      'operator:&&',
      'operator:!',
      'identifier:done',
    ])
    expect(words('a.b[0] ? x : y % 2')).toEqual([
      'identifier:a',
      'punctuation:.',
      'identifier:b',
      'punctuation:[',
      'number:0',
      'punctuation:]',
      'operator:?',
      'identifier:x',
      'operator::',
      'identifier:y',
      'operator:%',
      'number:2',
    ])
  })

  it('转义不结束字符串；未闭合的字符串与反引号名字一直到末尾', () => {
    expect(words('"a\\"b" + \'c')).toEqual(['string:"a\\"b"', 'operator:+', 'string:\'c'])
    expect(words('`x\\`y` + `z')).toEqual(['identifier:`x\\`y`', 'operator:+', 'identifier:`z'])
    expect(words('\'tail\\')).toEqual(['string:\'tail\\'])
  })

  it('不认识的字符（含全角标点）、紧跟名字字符的数字与不完整的指数都是 unknown，扫描照常往下走', () => {
    expect(words('a # b')).toEqual(['identifier:a', 'unknown:#', 'identifier:b'])
    expect(words('12abc + 1e + 3')).toEqual(['unknown:12abc', 'operator:+', 'unknown:1e', 'operator:+', 'number:3'])
    expect(words('SUM(a，b)')).toEqual(['identifier:SUM', 'punctuation:(', 'identifier:a', 'unknown:，', 'identifier:b', 'punctuation:)'])
  })

  it('能解析的源码，词的区间与解析器的切分一致', () => {
    const source = 'ROUND(price * qty, 2) + LEN(`备注`) - -1.5'
    expect(parse(source).ok).toBe(true)
    const tokens: readonly ExpressionToken[] = scanTokens(source)
    expect(tokens.every(token => token.kind !== 'unknown')).toBe(true)
    expect(tokens.map(token => source.slice(token.start, token.end)).join('')).toBe(source.replace(/\s+/g, ''))
  })

  it('空源码没有词；结果与每个词都冻结', () => {
    expect(scanTokens('  ')).toEqual([])
    const tokens = scanTokens('a')
    expect(Object.isFrozen(tokens)).toBe(true)
    expect(Object.isFrozen(tokens[0])).toBe(true)
  })
})
