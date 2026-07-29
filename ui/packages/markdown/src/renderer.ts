import type { RenderedBlock, RenderOpts, StreamRenderer } from './types'
import MarkdownIt from 'markdown-it'
import { blockKind, fenceLang, isFenceClosed, topLevelRanges } from './blocks'
import { cheapHash } from './hash'
import { LIVE_BLOCK_KEY } from './types'

/**
 * 消毒就在这一行：`html` 关掉之后，模型吐的内联 HTML 一律被转义成文本。
 *
 * 这是硬红线，不留"可信来源"的口子——流式内容按定义就来自模型，没有可信的那一半。
 * 链接协议由 markdown-it 自带的校验挡着：javascript: / vbscript: / data: 一律不成链接，
 * 原样留成字面量。
 */
function createParser(): MarkdownIt {
  return new MarkdownIt({ html: false, linkify: false, breaks: false })
}

function renderBlock(md: MarkdownIt, src: string, key: string, complete: boolean): RenderedBlock {
  const kind = blockKind(src)
  const lang = kind === 'code' ? fenceLang(src) : undefined
  return { key, kind, html: md.render(src), complete, lang }
}

/**
 * 流式 Markdown 渲染器。
 *
 * 增量的做法是「冻结前缀」：文本只会往后长，所以除了最后一块，前面的块内容此生不会再变。
 * 每次只解析没冻结的那一截，冻结块直接从缓存里拿——不这么做的话，每来一个 token 就要把
 * 整篇重解析重渲一遍，长回复到后面会肉眼可见地卡。
 *
 * 全文若不是以缓存前缀开头（宿主换了一整段、或者重放了另一条消息），整个缓存作废重来。
 * 宁可白扔一次缓存，也不能拿另一条消息的块糊在这条上。
 */
export function createStreamRenderer(): StreamRenderer {
  const md = createParser()
  let frozen: RenderedBlock[] = []
  let frozenPrefix = ''
  let frozenLineCount = 0
  let disposed = false

  const reset = (): void => {
    frozen = []
    frozenPrefix = ''
    frozenLineCount = 0
  }

  return {
    render(fullText: string, opts: RenderOpts = {}): readonly RenderedBlock[] {
      if (disposed)
        return []
      if (frozenPrefix !== '' && !fullText.startsWith(frozenPrefix))
        reset()

      const lines = fullText.split('\n')
      const tail = lines.slice(frozenLineCount).join('\n')
      if (tail.trim() === '')
        return frozen

      const ranges = topLevelRanges(md, tail)
      if (ranges.length === 0)
        return frozen

      // ranges 的行号相对这一轮 tail 的起点，循环里绝不能动这个基准——
      // 边冻边改 frozenLineCount 会让后面几块的切片全部漂位
      const base = frozenLineCount

      // 最后一块之外的都定型了：它们后面已经有别的块起头，内容不可能再动
      for (let i = 0; i < ranges.length - 1; i++) {
        const range = ranges[i]!
        const src = lines.slice(base + range.startLine, base + range.endLine).join('\n')
        frozen.push(renderBlock(md, src, `${frozen.length}:${cheapHash(src)}`, true))
      }

      const live = ranges[ranges.length - 1]!
      if (ranges.length > 1) {
        // 推进到最后一块的起点而不是上一块的终点：中间那些空行得跟着一起冻，
        // 否则下一轮解析会从半空的位置开始，块边界就对不上了
        frozenLineCount = base + live.startLine
        frozenPrefix = lines.slice(0, frozenLineCount).join('\n')
      }

      const liveSrc = lines.slice(base + live.startLine, base + live.endLine).join('\n')
      // 围栏一闭合这块就不会再变了，消费方可以立刻上高亮，不必等整个流结束
      const complete = opts.ended === true || (blockKind(liveSrc) === 'code' && isFenceClosed(liveSrc))
      const key = opts.ended === true ? `${frozen.length}:${cheapHash(liveSrc)}` : LIVE_BLOCK_KEY
      return [...frozen, renderBlock(md, liveSrc, key, complete)]
    },

    dispose() {
      disposed = true
      reset()
    },
  }
}
