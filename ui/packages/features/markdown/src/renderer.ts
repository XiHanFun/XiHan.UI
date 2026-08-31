import type { LinkDef, LinkDefs } from './refs'
import type { RenderedBlock, RenderOpts, StreamRenderer } from './types'
import { blockKind, fenceBody, fenceLang, isFenceClosed, mathBody } from './blocks'
import { unescapeBackslash } from './escape'
import { cheapHash } from './hash'
import { blockDefinitions, normalizeLabel, splitDefinitions } from './refs'
import { renderBlockHtml } from './render'
import { topLevelRanges } from './scan'
import { LIVE_BLOCK_KEY } from './types'

/** 超过这个长度的标签查不到定义，不必收。 */
const MAX_LABEL = 999

/** 一个已冻结的块：渲染结果连同重渲要用的源码。 */
interface FrozenBlock {
  readonly src: string
  block: RenderedBlock
}

/** 只有 code 与 math 两种块带正文原文，其余块的 html 就是全部产出。 */
function blockSource(kind: 'markdown' | 'code' | 'math', src: string): string | undefined {
  if (kind === 'code')
    return fenceBody(src)
  return kind === 'math' ? mathBody(src) : undefined
}

function renderBlock(src: string, defs: LinkDefs, key: string, complete: boolean): RenderedBlock {
  const kind = blockKind(src)
  const lang = kind === 'code' ? fenceLang(src) : undefined
  return { key, kind, html: renderBlockHtml(src, defs), complete, lang, source: blockSource(kind, src) }
}

/** 取块正文里每一对方括号的内容，即这块可能拿去查定义表的标签。 */
function refLabels(src: string): ReadonlySet<string> {
  const body = splitDefinitions(src).rest
  const labels = new Set<string>()
  const opens: number[] = []
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    if (ch === '\\') {
      i++
      continue
    }
    if (ch === '[') {
      opens.push(i)
      continue
    }
    if (ch !== ']')
      continue
    const open = opens.pop()
    if (open !== undefined && i - open - 1 <= MAX_LABEL)
      labels.add(normalizeLabel(unescapeBackslash(body.slice(open + 1, i))))
  }
  return labels
}

/**
 * 流式 Markdown 渲染器。
 *
 * 增量的做法是「冻结前缀」：文本只会往后长，尾部留一块前瞻余量之后，前面的块内容此生不会再变。
 * 每次只解析没冻结的那一截，冻结块直接从缓存里拿——不这么做的话，每来一个 token 就要把
 * 整篇重解析重渲一遍，长回复到后面会肉眼可见地卡。
 *
 * 例外只有引用定义：定义写在引用它的块后面时，冻结块的链接目标会变。这时只把用到那个标签的
 * 冻结块就地重渲一遍，其余的照旧不动。
 *
 * 全文若不是上一轮全文的延长（宿主换了一整段、或者重放了另一条消息），整个缓存连同定义表一起
 * 作废重来。宁可白扔一次缓存，也不能拿另一条消息的块或者链接目标糊在这条上。
 */
export function createStreamRenderer(): StreamRenderer {
  let frozen: FrozenBlock[] = []
  let frozenLineCount = 0
  /** 标签到引用了它的冻结块下标。 */
  let frozenByLabel = new Map<string, number[]>()
  let defs = new Map<string, LinkDef>()
  /** 上一轮的全文与它带的结束标记。 */
  let lastText = ''
  let lastEnded = false
  let disposed = false

  const reset = (): void => {
    frozen = []
    frozenLineCount = 0
    frozenByLabel = new Map()
    defs = new Map()
  }

  /**
   * 收下这一轮尾段里的引用定义，返回每个标签在收之前的取值。
   * 同一标签在本轮出现多次时按出现顺序覆盖，记下的是最早那一份。
   */
  const absorbDefs = (sources: readonly string[]): ReadonlyMap<string, LinkDef | undefined> => {
    const before = new Map<string, LinkDef | undefined>()
    for (const src of sources) {
      for (const [label, def] of blockDefinitions(src)) {
        if (!before.has(label))
          before.set(label, defs.get(label))
        defs.set(label, def)
      }
    }
    return before
  }

  /** 把取值变了的标签所涉及的冻结块就地重渲，key 保持不变。 */
  const refreshFrozen = (before: ReadonlyMap<string, LinkDef | undefined>): void => {
    for (const [label, prev] of before) {
      const targets = frozenByLabel.get(label)
      if (targets === undefined)
        continue
      const now = defs.get(label)!
      if (prev !== undefined && prev.dest === now.dest && prev.title === now.title)
        continue
      for (const index of targets) {
        const entry = frozen[index]!
        entry.block = renderBlock(entry.src, defs, entry.block.key, true)
      }
    }
  }

  /** 冻结一个块，并记下它引用到的标签。 */
  const freeze = (src: string): void => {
    const index = frozen.length
    for (const label of refLabels(src)) {
      const targets = frozenByLabel.get(label)
      if (targets === undefined)
        frozenByLabel.set(label, [index])
      else
        targets.push(index)
    }
    frozen.push({ src, block: renderBlock(src, defs, `${index}:${cheapHash(src)}`, true) })
  }

  const run = (lines: readonly string[], ended: boolean): readonly RenderedBlock[] => {
    const tail = lines.slice(frozenLineCount).join('\n')
    if (tail.trim() === '')
      return frozen.map(entry => entry.block)

    const ranges = topLevelRanges(tail)
    if (ranges.length === 0)
      return frozen.map(entry => entry.block)

    // ranges 的行号相对这一轮 tail 的起点，循环里绝不能动这个基准——
    // 边冻边改 frozenLineCount 会让后面几块的切片全部漂位
    const base = frozenLineCount
    const srcAt = (index: number): string => {
      const range = ranges[index]!
      return lines.slice(base + range.startLine, base + range.endLine).join('\n')
    }

    // 先收齐定义再渲染，本轮靠前的块才查得到靠后的定义；还在生长的最后一块不收
    const settledCount = ended ? ranges.length : ranges.length - 1
    const settled: string[] = []
    for (let i = 0; i < settledCount; i++) settled.push(srcAt(i))
    refreshFrozen(absorbDefs(settled))

    // 尾部保留不冻的块数：流中留两块，流结束留一块
    const keep = ended ? 1 : 2
    const freezeCount = Math.max(ranges.length - keep, 0)

    // 后面至少还有两块才冻：定这块边界所依据的那一行必定已经收完。
    // 要冻的块必定在 settled 里，切片不用再拼一遍
    for (let i = 0; i < freezeCount; i++) freeze(settled[i]!)

    // 推进到下一块的起点而不是上一块的终点：中间那些空行得跟着一起冻，
    // 否则下一轮解析会从半空的位置开始，块边界就对不上了
    if (freezeCount > 0)
      frozenLineCount = base + ranges[freezeCount]!.startLine

    // 冻结线之后的块每轮重渲，边界还可能被后续行改写
    const out: RenderedBlock[] = frozen.map(entry => entry.block)
    for (let i = freezeCount; i < ranges.length; i++) {
      const src = srcAt(i)
      const live = i === ranges.length - 1 && !ended
      // 围栏一闭合这块就不会再变了，消费方可以立刻上高亮，不必等整个流结束
      const complete = !live || (blockKind(src) === 'code' && isFenceClosed(src))
      out.push(renderBlock(src, defs, live ? LIVE_BLOCK_KEY : `${out.length}:${cheapHash(src)}`, complete))
    }
    return out
  }

  return {
    render(fullText: string, opts: RenderOpts = {}): readonly RenderedBlock[] {
      if (disposed)
        return []
      const text = fullText.replace(/\r\n?/g, '\n')
      const ended = opts.ended === true
      // 这一轮不是上一轮的延长，或者上一轮已经收尾而文本又变了，都当成换了一条消息。
      // 没冻结块也没定义时无缓存可作废，跳过这趟前缀比对
      const cached = frozen.length > 0 || defs.size > 0
      if (cached && (!text.startsWith(lastText) || (lastEnded && text !== lastText)))
        reset()
      lastText = text
      lastEnded = ended
      return run(text.split('\n'), ended)
    },

    dispose() {
      disposed = true
      lastText = ''
      lastEnded = false
      reset()
    },
  }
}
