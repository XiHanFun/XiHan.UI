import type { FontSpec, TextMeasurer } from '../src'
import { describe, expect, it } from 'vitest'
import { createEstimatingMeasurer, ellipsize, wrapText } from '../src'
import { forAll, integer } from './helpers/property'

const font: FontSpec = { family: 'sans-serif', size: 10, weight: 400, lineHeight: 16 }
const measurer = createEstimatingMeasurer()
const width = (text: string): number => measurer.measure(text, font).width

/** 每个字符 1 个单位宽的度量器，折行结果可以直接数字符。 */
const mono: TextMeasurer = { version: 1, measure: text => ({ width: Array.from(text).length, ascent: 0.8, descent: 0.2 }) }

describe('确定性估算器', () => {
  it('按字符类累加宽度', () => {
    expect(width('中')).toBe(10)
    expect(width('0')).toBeCloseTo(6, 9)
    expect(width('A')).toBeCloseTo(6.8, 9)
    expect(width('a')).toBeCloseTo(5.5, 9)
    expect(width('i')).toBeCloseTo(2.8, 9)
    expect(width('m')).toBeCloseTo(8.5, 9)
    expect(width(' ')).toBeCloseTo(2.8, 9)
    expect(width('，')).toBe(10)
  })

  it('结果只由输入决定，上下伸按字号', () => {
    expect(measurer.measure('月度销售额 Revenue', font)).toEqual(measurer.measure('月度销售额 Revenue', font))
    expect(measurer.measure('x', font)).toMatchObject({ ascent: 8, descent: 2 })
    expect(measurer.version).toBe(0)
  })

  it('按码点计宽：表情与扩展区汉字各算一个全角', () => {
    expect(width('𠀀')).toBe(10)
    expect(width('😀')).toBe(10)
  })
})

describe('省略', () => {
  it('放得下时原样返回', () => {
    expect(ellipsize('abc', 3, font, mono)).toBe('abc')
  })

  it('截到能放下「前缀 + …」的最长前缀，去掉截断处的空格', () => {
    expect(ellipsize('abcdef', 4, font, mono)).toBe('abc…')
    expect(ellipsize('ab cdef', 4, font, mono)).toBe('ab…')
  })

  it('连「…」都放不下时返回空串；宽度为负报错', () => {
    expect(ellipsize('abc', 0.5, font, mono)).toBe('')
    expect(() => ellipsize('abc', -1, font, mono)).toThrow(/宽度/)
  })
})

describe('折行', () => {
  it('拉丁文按词断', () => {
    expect(wrapText('the quick brown fox', 10, font, mono)).toEqual(['the quick', 'brown fox'])
  })

  it('中日韩文字逐字可断', () => {
    expect(wrapText('月度销售额汇总', 3, font, mono)).toEqual(['月度销', '售额汇', '总'])
  })

  it('中英混排：汉字与单词之间可以断开', () => {
    expect(wrapText('华东区Revenue', 5, font, mono)).toEqual(['华东区', 'Reven', 'ue'])
  })

  it('收尾标点不落到行首：与前一个字一起换到下一行', () => {
    expect(wrapText('一二三，四', 3, font, mono)).toEqual(['一二', '三，四'])
  })

  it('单词本身比一行还宽时逐字断开', () => {
    expect(wrapText('internationalization', 8, font, mono)).toEqual(['internat', 'ionaliza', 'tion'])
  })

  it('显式换行符强制断行', () => {
    expect(wrapText('ab\ncd', 10, font, mono)).toEqual(['ab', 'cd'])
  })

  it('char 模式任意两个字符之间都可断', () => {
    expect(wrapText('ab cd', 3, font, mono, { breakMode: 'char' })).toEqual(['ab', 'cd'])
  })

  it('超过最多行数时，余下的文字并进最后一行再截断', () => {
    expect(wrapText('the quick brown fox jumps', 10, font, mono, { maxLines: 2 })).toEqual(['the quick', 'brown fox…'])
    expect(() => wrapText('a', 10, font, mono, { maxLines: 0 })).toThrow(/maxLines/)
  })

  it('性质：每一行都不超过最大宽度（单个字符本身更宽的除外），拼回去不丢字', () => {
    const alphabet = ['a', 'b', 'c', ' ', '中', '文', '，', 'Q', 'W']
    forAll(500, 113, random => ({
      text: Array.from({ length: integer(random, 1, 60) }, () => alphabet[integer(random, 0, alphabet.length - 1)]).join(''),
      maxWidth: integer(random, 10, 80),
    }), ({ text, maxWidth }) => {
      const lines = wrapText(text, maxWidth, font, measurer)
      for (const line of lines) {
        const chars = Array.from(line)
        if (chars.length > 1 && !line.endsWith('，'))
          expect(width(line)).toBeLessThanOrEqual(maxWidth + 1e-9)
      }
      expect(lines.join('').replace(/ /g, '')).toBe(text.replace(/ /g, ''))
    })
  })
})
