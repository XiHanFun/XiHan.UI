import type { HighlightApi, HighlightProps, HighlightSegment } from '../src/highlight'
import { normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectHighlight, normalizeHighlightKeywords, splitHighlight } from '../src/highlight'

type Dict = Record<string, unknown>

/** 用给定 props 调一次连接层，返回其 API。 */
function api(props: HighlightProps = {}): HighlightApi {
  return connectHighlight(props, normalizeProps)
}

/** 把片段压成好读的形状：命中的加方括号。 */
function shape(segments: readonly HighlightSegment[]): string {
  return segments.map(s => (s.matched ? `[${s.text}]` : s.text)).join('')
}

/** 只取命中的那几段。 */
function hits(segments: readonly HighlightSegment[]): string[] {
  return segments.filter(s => s.matched).map(s => s.text)
}

describe('normalizeHighlightKeywords', () => {
  it('单个串与数组收成同一种形状', () => {
    expect(normalizeHighlightKeywords('a')).toEqual(['a'])
    expect(normalizeHighlightKeywords(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('空串丢掉：它在任何位置都命中，会把整段切成一串零长片段', () => {
    expect(normalizeHighlightKeywords('')).toEqual([])
    expect(normalizeHighlightKeywords(['', 'a', ''])).toEqual(['a'])
  })

  it('没给关键词就是一个都没有', () => {
    expect(normalizeHighlightKeywords(undefined)).toEqual([])
    expect(normalizeHighlightKeywords(null)).toEqual([])
  })
})

describe('splitHighlight', () => {
  it('没有关键词时整段是一段未命中', () => {
    expect(shape(splitHighlight('曦寒 UI', []))).toBe('曦寒 UI')
    expect(splitHighlight('曦寒 UI', [])).toHaveLength(1)
  })

  it('空文本切不出任何片段', () => {
    expect(splitHighlight('', ['a'])).toEqual([])
  })

  it('命中处切开，两侧的未命中字符各并成一段', () => {
    expect(shape(splitHighlight('曦寒 UI 组件库', ['组件']))).toBe('曦寒 UI [组件]库')
  })

  it('一组关键词按出现的先后各切一段', () => {
    expect(hits(splitHighlight('曦寒 UI 组件库', ['组件', '曦寒']))).toEqual(['曦寒', '组件'])
  })

  it('同一处多个关键词都命中时取最长的那个', () => {
    expect(shape(splitHighlight('abcd', ['ab', 'bcd', 'abc']))).toBe('[abc]d')
  })

  it('命中后从这一段的末尾接着扫，重叠的命中只切出一段', () => {
    expect(hits(splitHighlight('aaaa', ['aa']))).toEqual(['aa', 'aa'])
  })

  it('关键词比文本长时一处都不命中，不越过文本末尾去比', () => {
    expect(splitHighlight('UI', ['UI 组件库'])).toEqual([{ text: 'UI', matched: false }])
  })

  it('缺省不区分大小写，开了就按写法比', () => {
    expect(hits(splitHighlight('XiHan UI', ['ui']))).toEqual(['UI'])
    expect(hits(splitHighlight('XiHan UI', ['ui'], true))).toEqual([])
    expect(hits(splitHighlight('XiHan UI', ['UI'], true))).toEqual(['UI'])
  })

  it('关键词里的正则元字符当普通字符比', () => {
    expect(hits(splitHighlight('版本 1.0 与 120', ['1.0']))).toEqual(['1.0'])
    expect(hits(splitHighlight('取值 a*b', ['a*b']))).toEqual(['a*b'])
    expect(hits(splitHighlight('半括号 (', ['(']))).toEqual(['('])
    expect(hits(splitHighlight('反斜杠 \\d', ['\\d']))).toEqual(['\\d'])
  })

  it('所有片段依次拼回去恒等于原文', () => {
    const text = 'Aa bb AA cc aA'
    for (const keywords of [[], ['aa'], ['a'], ['aa', 'bb'], ['没有这一段']])
      expect(splitHighlight(text, keywords).map(s => s.text).join('')).toBe(text)
  })
})

describe('connectHighlight', () => {
  it('没给文本时文本是空串，切不出片段', () => {
    const it0 = api()
    expect(it0.text).toBe('')
    expect(it0.segments).toEqual([])
  })

  it('开关落成 data-case-sensitive，关掉时不留空属性', () => {
    expect((api({ text: 'a' }).getRootProps() as Dict)['data-case-sensitive']).toBeUndefined()
    expect((api({ text: 'a', caseSensitive: true }).getRootProps() as Dict)['data-case-sensitive']).toBe('')
  })

  it('每个命中片段拿到同一份属性', () => {
    const markProps = api({ text: '曦寒 UI', keyword: 'UI' }).getMarkProps() as Dict
    expect(markProps['data-scope']).toBe('highlight')
    expect(markProps['data-part']).toBe('mark')
  })
})
