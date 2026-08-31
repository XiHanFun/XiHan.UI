import type { CodeToken, HighlighterPort } from '@xihan-ui/kernel'
import type { CodeViewApi, CodeViewProps } from '../src/code-view'
import { createCounterIdGenerator, createScope, normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it, vi } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectCodeView, parseLineRanges, splitCodeLines } from '../src/code-view'

type Dict = Record<string, unknown>

function api(props: CodeViewProps): CodeViewApi {
  const scope = createScope(null, createCounterIdGenerator())
  return connectCodeView(props, scope, normalizeProps)
}

/** 把整段代码切成 kind 交替的记号，用来验跨行切分。 */
function tokensOf(pieces: readonly [string, CodeToken['kind']][]): readonly CodeToken[] {
  return pieces.map(([text, kind]) => ({ text, kind }))
}

const ALWAYS: HighlighterPort = { highlight: code => tokensOf([[code, 'keyword']]) }

describe('parseLineRanges', () => {
  it('单个行号与区间都认，结果升序去重', () => {
    expect(parseLineRanges('3,7-9')).toEqual([3, 7, 8, 9])
    expect(parseLineRanges('9,3,9')).toEqual([3, 9])
    expect(parseLineRanges([5, 1, 5])).toEqual([1, 5])
  })

  it('非法片段丢掉但不影响其余：一个参数写错不该让代码渲不出来', () => {
    expect(parseLineRanges('3,abc,7')).toEqual([3, 7])
    expect(parseLineRanges('3,,7')).toEqual([3, 7])
    // 倒着写的区间当没写
    expect(parseLineRanges('9-3,4')).toEqual([4])
    // 行号从 1 起，0 与负数不是行
    expect(parseLineRanges('0,-2,2')).toEqual([2])
    expect(parseLineRanges([1.5, 2])).toEqual([2])
  })

  it('缺省与空串给空表', () => {
    expect(parseLineRanges(undefined)).toEqual([])
    expect(parseLineRanges('')).toEqual([])
  })

  it('超大区间在上限处截断，不把整页算死', () => {
    // 一个写错的 highlightLines 不该变成一次一千万次的循环
    expect(parseLineRanges('1-99999999')).toHaveLength(10_000)
  })
})

describe('splitCodeLines', () => {
  it('不着色时逐行给文本，无损', () => {
    const code = 'a\n\nb'
    const lines = splitCodeLines(code)
    expect(lines.map(l => l.text)).toEqual(['a', '', 'b'])
    expect(lines.every(l => l.tokens.length === 0)).toBe(true)
    expect(lines.map(l => l.text).join('\n')).toBe(code)
  })

  it('行文本不含结尾换行：留着会让框选复制拿到双倍空行', () => {
    expect(splitCodeLines('a\nb')[0]!.text).toBe('a')
  })

  it('横跨多行的记号按行切开，每段各自保持种类', () => {
    // 未闭合的字符串与块注释就是这样一路吃到结尾的，「一个记号一个 span」切不出行
    const code = '/* 头\n中\n尾 */'
    const lines = splitCodeLines(code, tokensOf([[code, 'comment']]))
    expect(lines.map(l => l.text)).toEqual(['/* 头', '中', '尾 */'])
    expect(lines.flatMap(l => l.tokens.map(t => t.kind))).toEqual(['comment', 'comment', 'comment'])
    expect(lines.map(l => l.tokens.map(t => t.text).join('')).join('\n')).toBe(code)
  })

  it('一行里多个记号照原序给，换行本身不进任何片段', () => {
    const lines = splitCodeLines('a=1\nb', tokensOf([['a', 'plain'], ['=', 'punctuation'], ['1\nb', 'number']]))
    expect(lines[0]!.tokens).toEqual([
      { text: 'a', kind: 'plain' },
      { text: '=', kind: 'punctuation' },
      { text: '1', kind: 'number' },
    ])
    expect(lines[1]!.tokens).toEqual([{ text: 'b', kind: 'number' }])
  })

  it('记号流短于代码时用 plain 补齐，无损契约不受着色实现影响', () => {
    const code = 'abcdef'
    const lines = splitCodeLines(code, tokensOf([['abc', 'keyword']]))
    expect(lines[0]!.text).toBe(code)
    expect(lines[0]!.tokens).toEqual([
      { text: 'abc', kind: 'keyword' },
      { text: 'def', kind: 'plain' },
    ])
  })
})

describe('着色取舍', () => {
  it('未闭合默认不着色：半截代码每来一个字符整块变色比不着色更糟', () => {
    expect(api({ code: 'const a', highlighter: ALWAYS }).lines[0]!.tokens).toEqual([])
    expect(api({ code: 'const a', complete: true, highlighter: ALWAYS }).lines[0]!.tokens).toHaveLength(1)
  })

  it('未闭合也着色要显式开', () => {
    const a = api({ code: 'const a', highlighter: ALWAYS, highlightWhileStreaming: true })
    expect(a.lines[0]!.tokens).toHaveLength(1)
  })

  it('着色实现返回 null 是合法结果，退回纯文本', () => {
    const none: HighlighterPort = { highlight: () => null }
    expect(api({ code: 'x', complete: true, highlighter: none }).lines[0]!.tokens).toEqual([])
  })
})

describe('属性投影', () => {
  it('空白语言落 plaintext，行号位数落成枚举给皮肤定槽宽', () => {
    const root = api({ code: 'a\nb\nc', lang: '  ' }).getRootProps() as Dict
    expect(root['data-lang']).toBe('plaintext')
    expect(root['data-digits']).toBe('1')
  })

  it('位数按最后一行的行号算，startLine 一起算进去', () => {
    const root = api({ code: 'a\nb', startLine: 99 }).getRootProps() as Dict
    expect(root['data-digits']).toBe('3')
  })

  it('pre 占一个 Tab 位并按行数撑高', () => {
    const pre = api({ code: 'a\nb\nc' }).getPreProps() as Dict
    expect(pre.tabindex).toBe(0)
    expect((pre.style as Dict).minBlockSize).toBe('calc(var(--xh-code-view-line-height, var(--xh-text-code-leading)) * 3)')
    expect((pre.style as Dict).maxBlockSize).toBeUndefined()
  })

  it('行号从 startLine 起，高亮行按行号而不是下标点亮', () => {
    const a = api({ code: 'a\nb\nc', startLine: 10, highlightLines: '11' })
    expect(a.lineNumberAt(0)).toBe(10)
    expect((a.getLineProps({ index: 0 }) as Dict)['data-highlighted']).toBeUndefined()
    expect((a.getLineProps({ index: 1 }) as Dict)['data-highlighted']).toBe('')
    expect((a.getLineNumberProps({ index: 1 }) as Dict)['data-line-number']).toBe('11')
  })

  it('行号槽对读屏隐藏：复制不带行号，也不逐行念数字', () => {
    expect((api({ code: 'a' }).getLineNumberProps({ index: 0 }) as Dict)['aria-hidden']).toBe(true)
  })
})

describe('可访问名', () => {
  it('作者渲了文件名就指过去', () => {
    const a = api({ code: 'a', filename: 'main.ts', labelled: true })
    const pre = a.getPreProps() as Dict
    const filename = a.getFilenameProps() as Dict
    expect(pre['aria-labelledby']).toBe(filename.id)
    expect(pre['aria-label']).toBeUndefined()
  })

  it('没渲文件名节点就用文案兜底：指向渲不出来的 id 会让读屏读空', () => {
    // filename 有值但作者没写那个节点，这时不能发 aria-labelledby
    const pre = api({ code: 'a', filename: 'main.ts' }).getPreProps() as Dict
    expect(pre['aria-labelledby']).toBeUndefined()
    expect(pre['aria-label']).toBe('Code')
  })
})

describe('折叠', () => {
  it('行数没超过阈值就不可折叠，按钮收起', () => {
    const a = api({ code: 'a\nb', clamp: 5 })
    expect(a.foldable).toBe(false)
    expect((a.getFoldTriggerProps() as Dict).hidden).toBe(true)
  })

  it('折叠时 min 与 max 一起降到阈值行：只叠 max 的话高度纹丝不动', () => {
    // CSS 用值是 max(min, min(max, …))，min-block-size 恒压过 max-block-size
    const pre = api({ code: 'a\nb\nc\nd', clamp: 2, clamped: true }).getPreProps() as Dict
    const height = 'calc(var(--xh-code-view-line-height, var(--xh-text-code-leading)) * 2)'
    expect((pre.style as Dict).minBlockSize).toBe(height)
    expect((pre.style as Dict).maxBlockSize).toBe(height)
  })

  it('不可折叠时 clamped 立不起来', () => {
    expect(api({ code: 'a\nb', clamp: 5, clamped: true }).clamped).toBe(false)
  })

  it('按钮的 aria-expanded 与文案随折叠态翻面，指向 pre', () => {
    const open = api({ code: 'a\nb\nc', clamp: 2 })
    const shut = api({ code: 'a\nb\nc', clamp: 2, clamped: true })
    const openProps = open.getFoldTriggerProps() as Dict
    const shutProps = shut.getFoldTriggerProps() as Dict
    expect(openProps['aria-expanded']).toBe('true')
    expect(openProps['aria-label']).toBe('Collapse code')
    expect(shutProps['aria-expanded']).toBe('false')
    expect(shutProps['aria-label']).toBe('Expand code')
    expect(openProps['aria-controls']).toBe((open.getPreProps() as Dict).id)
  })

  it('纯受控：点按钮只发意图，自己不落态', () => {
    const onClampToggle = vi.fn()
    const a = api({ code: 'a\nb\nc', clamp: 2, onClampToggle })
    ;(a.getFoldTriggerProps() as { onClick: () => void }).onClick()
    expect(onClampToggle).toHaveBeenCalledWith({ clamped: true })
    expect(a.clamped).toBe(false)
  })

  it('setClamped 与当前态相同时不发', () => {
    const onClampToggle = vi.fn()
    api({ code: 'a\nb\nc', clamp: 2, onClampToggle }).setClamped(false)
    expect(onClampToggle).not.toHaveBeenCalled()
  })
})
