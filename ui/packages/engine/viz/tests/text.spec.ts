import type { FontSpec, TextMeasurer, WrappedRunLine } from '../src'
import { describe, expect, it } from 'vitest'
import { createCanvasMeasurer, createEstimatingMeasurer, ellipsize, wrapRuns, wrapText } from '../src'
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

describe('字间距', () => {
  it('每个字符之后加上字间距，一行放得下的字数随之减少', () => {
    expect(wrapText('月度销售额汇总', 6, font, mono)).toEqual(['月度销售额汇', '总'])
    expect(wrapText('月度销售额汇总', 6, font, mono, { letterSpacing: 1 })).toEqual(['月度销', '售额汇', '总'])
  })

  it('负字间距让一行放下更多字', () => {
    expect(wrapText('abcdef', 4, font, mono, { letterSpacing: -0.5 })).toEqual(['abcdef'])
  })

  it('截断最后一行时同样计入字间距', () => {
    expect(wrapText('abcdefgh', 4, font, mono, { maxLines: 1, letterSpacing: 1 })).toEqual(['a…'])
  })

  it('字间距不是有限数时报错', () => {
    expect(() => wrapText('abc', 4, font, mono, { letterSpacing: Number.NaN })).toThrow(/letterSpacing/)
  })
})

describe('多样式折行', () => {
  /** 每个字符宽「字号 / 10」，上伸取字号的 0.8、下伸取 0.2。 */
  const sized: TextMeasurer = { version: 1, measure: (text, spec) => ({ width: Array.from(text).length * spec.size / 10, ascent: spec.size * 0.8, descent: spec.size * 0.2 }) }
  const small: FontSpec = { family: 'serif', size: 10, weight: 400, lineHeight: 14 }
  const large: FontSpec = { family: 'serif', size: 20, weight: 700, lineHeight: 28 }
  const texts = (lines: readonly WrappedRunLine[]): string[] => lines.map(line => line.segments.map(segment => segment.text).join(''))

  it('性质：只有一段时与 wrapText 折出同样的行', () => {
    const alphabet = ['a', 'b', ' ', '中', '文', '，', 'Q', '\n']
    forAll(300, 271, random => ({
      text: Array.from({ length: integer(random, 0, 50) }, () => alphabet[integer(random, 0, alphabet.length - 1)]).join(''),
      maxWidth: integer(random, 4, 40),
    }), ({ text, maxWidth }) => {
      expect(texts(wrapRuns([{ text, font }], maxWidth, measurer))).toEqual(wrapText(text, maxWidth, font, measurer))
    })
  })

  it('各截给出所在段、段内起止、横向位置与宽度，行宽与上下伸按各截汇总', () => {
    const [line] = wrapRuns([{ text: '小字', font: small }, { text: '大字', font: large }], 100, sized)
    expect(line).toEqual({
      segments: [
        { run: 0, start: 0, end: 2, text: '小字', x: 0, width: 2 },
        { run: 1, start: 0, end: 2, text: '大字', x: 2, width: 4 },
      ],
      width: 6,
      ascent: 16,
      descent: 4,
    })
  })

  it('单词跨两段样式时不拆开，整个换到下一行', () => {
    const lines = wrapRuns([{ text: 'go inter', font: small }, { text: 'national', font: large }], 22, sized)
    expect(texts(lines)).toEqual(['go', 'international'])
    expect(lines[1]!.segments).toEqual([
      { run: 0, start: 3, end: 8, text: 'inter', x: 0, width: 5 },
      { run: 1, start: 0, end: 8, text: 'national', x: 5, width: 16 },
    ])
  })

  it('显式换行跨段也断行，\\r\\n 当一个换行；空行是一截长度为 0 的文字', () => {
    const lines = wrapRuns([{ text: '甲\r\n', font: small }, { text: '\n乙', font: large }], 100, sized)
    expect(texts(lines)).toEqual(['甲', '', '乙'])
    expect(lines[1]).toEqual({ segments: [{ run: 1, start: 0, end: 0, text: '', x: 0, width: 0 }], width: 0, ascent: 16, descent: 4 })
  })

  it('行首行尾的空白去掉，起止下标跟着收', () => {
    const [line] = wrapRuns([{ text: '  ab ', font: small }, { text: ' cd  ', font: small }], 100, sized)
    expect(line!.segments).toEqual([
      { run: 0, start: 2, end: 5, text: 'ab ', x: 0, width: 3 },
      { run: 1, start: 0, end: 3, text: ' cd', x: 3, width: 3 },
    ])
  })

  it('每段各自的字间距计入宽度', () => {
    expect(texts(wrapRuns([{ text: 'abc', font: small, letterSpacing: 1 }, { text: 'def', font: small }], 6, sized))).toEqual(['abc', 'def'])
    expect(texts(wrapRuns([{ text: 'abc', font: small }, { text: 'def', font: small }], 6, sized))).toEqual(['abcdef'])
  })

  it('没有段时返回空数组；字间距不是有限数或宽度为负时报错', () => {
    expect(wrapRuns([], 10, sized)).toEqual([])
    expect(() => wrapRuns([{ text: 'a', font: small, letterSpacing: Number.POSITIVE_INFINITY }], 10, sized)).toThrow(/letterSpacing/)
    expect(() => wrapRuns([{ text: 'a', font: small }], -1, sized)).toThrow()
  })
})

describe('canvas 度量器', () => {
  function fakeDocument(context: unknown): Document {
    return { createElement: () => ({ getContext: () => context }) } as unknown as Document
  }

  function fakeContext(): { font: string, fonts: string[], measureText: (text: string) => TextMetrics } {
    const context = {
      font: '',
      fonts: [] as string[],
      measureText(text: string): TextMetrics {
        context.fonts.push(context.font)
        return { width: text.length * 7, actualBoundingBoxAscent: 9, actualBoundingBoxDescent: 3 } as TextMetrics
      },
    }
    return context
  }

  it('按斜体、字重、字号与字体族拼出 font 串，量出真实宽度与上下伸', () => {
    const context = fakeContext()
    const canvas = createCanvasMeasurer(fakeDocument(context))!
    expect(canvas.measure('abc', { ...font, style: 'italic', weight: 700 })).toEqual({ width: 21, ascent: 9, descent: 3 })
    canvas.measure('abc', font)
    expect(context.fonts).toEqual(['italic 700 10px sans-serif', '400 10px sans-serif'])
  })

  it('同一字体与文字只量一次，refresh 清缓存并递增 version', () => {
    const context = fakeContext()
    const canvas = createCanvasMeasurer(fakeDocument(context))!
    expect(canvas.version).toBe(1)
    canvas.measure('abc', font)
    canvas.measure('abc', font)
    expect(context.fonts).toHaveLength(1)
    canvas.refresh()
    expect(canvas.version).toBe(2)
    canvas.measure('abc', font)
    expect(context.fonts).toHaveLength(2)
  })

  it('拿不到 2D 上下文或创建时抛错时返回 null', () => {
    expect(createCanvasMeasurer(fakeDocument(null))).toBeNull()
    const blocked = (): never => {
      throw new Error('blocked')
    }
    const throwing = { createElement: () => ({ getContext: blocked }) } as unknown as Document
    expect(createCanvasMeasurer(throwing)).toBeNull()
  })
})
