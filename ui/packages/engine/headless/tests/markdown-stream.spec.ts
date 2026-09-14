import type { MarkdownBlock, MarkdownStreamApi, MarkdownStreamProps } from '../src/markdown-stream'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectMarkdownStream, isLiveMarkdownBlock, MARKDOWN_STREAM_LIVE_KEY, markdownBlockHtml } from '../src/markdown-stream'

type Dict = Record<string, unknown>

function api(props: MarkdownStreamProps): MarkdownStreamApi {
  return connectMarkdownStream(props, normalizeProps)
}

function block(over: Partial<MarkdownBlock> = {}): MarkdownBlock {
  return { key: '0:a', kind: 'markdown', html: '<p>x</p>', complete: true, ...over }
}

describe('分发契约', () => {
  it('只有 markdown 块能按 html 渲', () => {
    // 代码块照 html 渲会与交给代码组件的那份重复；公式块的 html 只是把源码包了一层
    expect(markdownBlockHtml(block())).toBe('<p>x</p>')
    expect(markdownBlockHtml(block({ kind: 'code', source: 'const a = 1' }))).toBeUndefined()
    expect(markdownBlockHtml(block({ kind: 'math', source: 'x^2' }))).toBeUndefined()
  })

  it('生长块由固定 key 认出来，流式光标就挂在它身上', () => {
    expect(MARKDOWN_STREAM_LIVE_KEY).toBe('live')
    expect(isLiveMarkdownBlock(block({ key: 'live' }))).toBe(true)
    expect(isLiveMarkdownBlock(block({ key: '0:a' }))).toBe(false)
  })
})

describe('属性投影', () => {
  it('流式标记落在 root 上，块的种类与闭合落在块上', () => {
    const a = api({ blocks: [block({ kind: 'code', complete: false, lang: 'ts' })], streaming: true })
    expect((a.getRootProps() as Dict)['data-state']).toBe('streaming')
    const props = a.getBlockProps({ block: a.blocks[0]! }) as Dict
    expect(props['data-kind']).toBe('code')
    expect(props['data-lang']).toBe('ts')
    expect(props['data-complete']).toBeUndefined()
  })

  it('不流式时 root 落 complete', () => {
    expect((api({ blocks: [] }).getRootProps() as Dict)['data-state']).toBe('complete')
  })

  it('块列表原样透出，组件不切片也不重排', () => {
    const blocks = [block({ key: 'a' }), block({ key: 'b' })]
    expect(api({ blocks }).blocks).toBe(blocks)
  })
})

describe('播报', () => {
  it('默认不播报：会话级活区在消息流那一层，每条回复各开一个会互相打断', () => {
    expect(api({ blocks: [block()] }).announcement).toBeUndefined()
  })

  it('开了播报也只在写完那一刻念，还在写的时候不念', () => {
    expect(api({ blocks: [block()], announce: 'polite', streaming: true }).announcement).toBeUndefined()
    expect(api({ blocks: [block()], announce: 'polite' }).announcement).toBe('Response complete')
  })

  it('播报文案可覆盖', () => {
    const a = api({ blocks: [], announce: 'polite', translations: { completed: '回复完成' } })
    expect(a.announcement).toBe('回复完成')
  })

  it('播报区永远带 role 与档位，念不念由内容决定', () => {
    const props = api({ blocks: [] }).getLiveRegionProps() as Dict
    expect(props.role).toBe('status')
    expect(props['aria-live']).toBe('polite')
    expect(props['aria-atomic']).toBe('true')
  })
})
