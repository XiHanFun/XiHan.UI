import type { CodeToken, HighlighterPort } from '@xihan-ui/core'
import type { CodeViewApi, CodeViewProps } from '../src/code-view'
import { createCounterIdGenerator, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { codeViewMachine, connectCodeView, findCodeViewFoldRegions, isCodeViewFoldable, parseLineRanges, splitCodeLines } from '../src/code-view'

type Dict = Record<string, unknown>

/** 起一台机器：代码块的机器只承载按压通道，属性仍由 props 决定。 */
function makeCodeView(initial: CodeViewProps) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<CodeViewProps>(initial)
  const scope = createScope(null, createCounterIdGenerator())
  const service = createService(codeViewMachine, { props: () => props.get(), runtime, scope })
  runtime.start()
  return {
    api: (): CodeViewApi => connectCodeView(service, normalizeProps),
    setProps: (next: Partial<CodeViewProps>) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

function api(props: CodeViewProps): CodeViewApi {
  return makeCodeView(props).api()
}

/** 按压事件桩：只有 key 与 repeat / isComposing 参与判定。 */
const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)

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

  it('压根没有着色实现时逐行原文照旧，行结构与行号一并保留', () => {
    const a = api({ code: 'const a = 1\nconst b = 2', complete: true, lineNumbers: true })
    expect(a.lines.map(line => line.text)).toEqual(['const a = 1', 'const b = 2'])
    expect(a.lines.every(line => line.tokens.length === 0)).toBe(true)
    expect(a.lineCount).toBe(2)
    expect(a.lineNumberAt(1)).toBe(2)
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

  it('折叠条接 Action Control 的 disclosure-trigger 档：ghost 形态、按下只换面，档位随 size 走', () => {
    const trigger = api({ code: 'a\nb\nc', clamp: 2 }).getFoldTriggerProps() as Dict
    expect(trigger['data-xh-action-control']).toBe('')
    expect(trigger['data-xh-action-profile']).toBe('disclosure-trigger')
    expect(trigger['data-xh-action-variant']).toBe('ghost')
    expect(trigger['data-xh-action-display']).toBe('always')
    expect(trigger['data-xh-action-size']).toBe('md')
    const small = api({ code: 'a\nb\nc', clamp: 2, size: 'sm' }).getFoldTriggerProps() as Dict
    expect(small['data-xh-action-size']).toBe('sm')
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

describe('isCodeViewFoldable', () => {
  it('正数 clamp 且行数超过它才可折叠；非正数、非有限值与刚好等于都不算', () => {
    expect(isCodeViewFoldable('a\nb\nc', 2)).toBe(true)
    expect(isCodeViewFoldable('a\nb', 2)).toBe(false)
    expect(isCodeViewFoldable('a\nb\nc', 0)).toBe(false)
    expect(isCodeViewFoldable('a\nb\nc', -1)).toBe(false)
    expect(isCodeViewFoldable('a\nb\nc', Number.NaN)).toBe(false)
    expect(isCodeViewFoldable('a\nb\nc', undefined)).toBe(false)
    // 小数向下取整，与 connect 的 clamp 归一同口径
    expect(isCodeViewFoldable('a\nb\nc', 2.7)).toBe(true)
  })
})

describe('按压通道：Space / Enter 与触屏按住投影 data-pressed', () => {
  it('keydown 在场、keyup 撤下；触屏按下在场、抬起 / 取消撤下；失焦撤下；鼠标按下不走这一路；折叠意图不动', () => {
    const onClampToggle = vi.fn()
    const h = makeCodeView({ code: 'a\nb\nc', clamp: 2, onClampToggle })
    const trigger = (): Dict => h.api().getFoldTriggerProps() as Dict
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onKeyDown', key(' '))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onKeyUp', key(' '))
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onKeyDown', key('Enter'))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onBlur', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onPointerCancel', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onPointerUp', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'mouse' })
    expect(trigger()['data-pressed']).toBeUndefined()
    expect(onClampToggle).not.toHaveBeenCalled()
    h.stop()
  })

  it('按住途中宿主写回折叠态：按钮翻面，按压面不随之丢，keyup 才撤下', () => {
    const h = makeCodeView({ code: 'a\nb\nc', clamp: 2 })
    const trigger = (): Dict => h.api().getFoldTriggerProps() as Dict
    fire(trigger(), 'onKeyDown', key('Enter'))
    expect(trigger()['data-pressed']).toBe('')
    h.setProps({ clamped: true })
    expect(trigger()['aria-expanded']).toBe('false')
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onKeyUp', key('Enter'))
    expect(trigger()['data-pressed']).toBeUndefined()
    h.stop()
  })

  it('不可折叠时折叠条带 hidden，按住不进；按住途中代码缩短到阈值以内、折叠条收起时自收；再度可折叠后照常', () => {
    const off = makeCodeView({ code: 'a\nb', clamp: 5 })
    const offTrigger = (): Dict => off.api().getFoldTriggerProps() as Dict
    expect(offTrigger().hidden).toBe(true)
    fire(offTrigger(), 'onKeyDown', key(' '))
    expect(offTrigger()['data-pressed']).toBeUndefined()
    fire(offTrigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(offTrigger()['data-pressed']).toBeUndefined()
    off.stop()

    const h = makeCodeView({ code: 'a\nb\nc', clamp: 2 })
    const trigger = (): Dict => h.api().getFoldTriggerProps() as Dict
    fire(trigger(), 'onKeyDown', key(' '))
    expect(trigger()['data-pressed']).toBe('')
    h.setProps({ code: 'a\nb' })
    expect(trigger().hidden).toBe(true)
    expect(trigger()['data-pressed']).toBeUndefined()
    h.setProps({ code: 'a\nb\nc\nd' })
    fire(trigger(), 'onKeyDown', key(' '))
    expect(trigger()['data-pressed']).toBe('')
    // 阈值抬高到行数之上同样收起
    h.setProps({ clamp: 10 })
    expect(trigger()['data-pressed']).toBeUndefined()
    h.stop()
  })
})

const BLOCKS = [
  'function outer() {', // 0
  '  if (ok) {', // 1
  '    run()', // 2
  '', // 3
  '    done()', // 4
  '  }', // 5
  '}', // 6
  '', // 7
  'const tail = 1', // 8
].join('\n')

describe('findCodeViewFoldRegions', () => {
  it('一行之下缩进更深的连续行是它的块；收尾括号与块头同缩进，留在块外', () => {
    const regions = findCodeViewFoldRegions(BLOCKS.split('\n'))
    expect(regions).toEqual([{ start: 0, end: 5 }, { start: 1, end: 4 }])
  })

  it('夹在块中间的空行算进去，块尾的空行不算', () => {
    expect(findCodeViewFoldRegions(['a:', '  b', '', '  c', '', 'd'])).toEqual([{ start: 0, end: 3 }])
  })

  it('制表符按四列算；没有更深缩进的行不成块', () => {
    expect(findCodeViewFoldRegions(['a', '\tb', '    c', 'd'])).toEqual([{ start: 0, end: 2 }])
    expect(findCodeViewFoldRegions(['a', 'b', 'c'])).toEqual([])
    expect(findCodeViewFoldRegions([])).toEqual([])
  })

  it('块能延伸到最后一行', () => {
    expect(findCodeViewFoldRegions(['def f():', '    return 1'])).toEqual([{ start: 0, end: 1 }])
  })
})

describe('按块折叠', () => {
  const click = (props: Dict): void => fire(props, 'onClick', {})

  it('默认关闭：没有块、行首不建折叠钮', () => {
    const a = api({ code: BLOCKS })
    expect(a.foldRegions).toEqual([])
    expect(a.isFoldStart(0)).toBe(false)
    expect((a.getRootProps() as Dict)['data-block-folding']).toBeUndefined()
  })

  it('开了之后块头有钮，名字写收起的首末行号、开合交给 aria-expanded', () => {
    const a = api({ code: BLOCKS, blockFolding: true })
    expect((a.getRootProps() as Dict)['data-block-folding']).toBe('')
    expect(a.isFoldStart(0)).toBe(true)
    expect(a.isFoldStart(2)).toBe(false)
    const trigger = a.getLineFoldTriggerProps({ index: 1 }) as Dict
    expect(trigger['aria-label']).toBe('Lines 3–5')
    expect(trigger['aria-expanded']).toBe('true')
    expect(trigger['data-state']).toBe('open')
    expect(trigger['data-value']).toBe('2')
    expect(trigger['data-xh-action-profile']).toBe('icon')
  })

  it('点钮折叠：块里的行带 hidden，块头带 data-folded，pre 预撑的行数扣掉收起的行', () => {
    const h = makeCodeView({ code: BLOCKS, blockFolding: true })
    click(h.api().getLineFoldTriggerProps({ index: 1 }) as Dict)
    const a = h.api()
    expect(a.folded).toEqual([2])
    expect((a.getLineProps({ index: 1 }) as Dict)['data-folded']).toBe('')
    expect((a.getLineProps({ index: 1 }) as Dict).hidden).toBeUndefined()
    expect([2, 3, 4].map(index => (a.getLineProps({ index }) as Dict).hidden)).toEqual([true, true, true])
    expect((a.getLineProps({ index: 5 }) as Dict).hidden).toBeUndefined()
    expect((a.getLineFoldTriggerProps({ index: 1 }) as Dict)['aria-expanded']).toBe('false')
    const style = (a.getPreProps() as Dict).style as Dict
    expect(style.minBlockSize).toContain('* 6)')
    // 再点一次展开
    click(a.getLineFoldTriggerProps({ index: 1 }) as Dict)
    expect(h.api().folded).toEqual([])
    h.stop()
  })

  it('外层收起时里层的行跟着藏，里层钮也不再是 Tab 停靠点', () => {
    const h = makeCodeView({ code: BLOCKS, blockFolding: true, defaultFolded: [1] })
    const a = h.api()
    expect([1, 2, 5].map(index => (a.getLineProps({ index }) as Dict).hidden)).toEqual([true, true, true])
    expect((a.getLineFoldTriggerProps({ index: 0 }) as Dict).tabindex).toBe(0)
    expect((a.getLineFoldTriggerProps({ index: 1 }) as Dict).tabindex).toBe(-1)
    h.stop()
  })

  it('受控：点钮只报意图，集合由宿主写回；不是块头的行号忽略，行号随 startLine 走', () => {
    const onFoldedChange = vi.fn()
    const h = makeCodeView({ code: BLOCKS, blockFolding: true, folded: [], onFoldedChange })
    click(h.api().getLineFoldTriggerProps({ index: 0 }) as Dict)
    expect(onFoldedChange).toHaveBeenLastCalledWith({ folded: [1] })
    expect(h.api().folded).toEqual([])
    h.setProps({ folded: [1, 3] })
    // 第 3 行不是块头，忽略
    expect(h.api().folded).toEqual([1])
    h.setProps({ startLine: 10, folded: [11] })
    expect(h.api().folded).toEqual([11])
    expect((h.api().getLineProps({ index: 2 }) as Dict).hidden).toBe(true)
    h.stop()
  })

  it('一组钮只占一个 Tab 位：点过的那颗成为停靠点，被收起后落回第一颗看得见的', () => {
    const h = makeCodeView({ code: BLOCKS, blockFolding: true })
    const tab = (index: number): unknown => (h.api().getLineFoldTriggerProps({ index }) as Dict).tabindex
    expect([tab(0), tab(1)]).toEqual([0, -1])
    click(h.api().getLineFoldTriggerProps({ index: 1 }) as Dict)
    expect([tab(0), tab(1)]).toEqual([-1, 0])
    click(h.api().getLineFoldTriggerProps({ index: 0 }) as Dict)
    expect(tab(0)).toBe(0)
    h.stop()
  })

  it('只收起一行的块，名字写单个行号', () => {
    const a = api({ code: 'if (x) {\n  y()\n}', blockFolding: true })
    expect((a.getLineFoldTriggerProps({ index: 0 }) as Dict)['aria-label']).toBe('Line 2')
  })

  it('toggleFold 只认块头的行号', () => {
    const onFoldedChange = vi.fn()
    const h = makeCodeView({ code: BLOCKS, blockFolding: true, onFoldedChange })
    h.api().toggleFold(3)
    expect(onFoldedChange).not.toHaveBeenCalled()
    h.api().toggleFold(1)
    expect(onFoldedChange).toHaveBeenLastCalledWith({ folded: [1] })
    h.stop()
  })
})
