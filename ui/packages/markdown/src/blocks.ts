import type MarkdownIt from 'markdown-it'

/** 一个顶层块在源文本里占的行区间，左闭右开。 */
export interface BlockRange {
  readonly startLine: number
  readonly endLine: number
}

/**
 * 按顶层块切分源文本。
 *
 * 直接吃 markdown-it 的 token 流：level 为 0 且带行号映射的开标记就是一个顶层块的起点。
 * 列表这类容器整棵算一块（`bullet_list_open` 的 map 覆盖整个列表），
 * 因为部分重渲一个列表的意义不大，反而要处理项与项之间的 key 稳定性。
 */
export function topLevelRanges(md: MarkdownIt, src: string): readonly BlockRange[] {
  const out: BlockRange[] = []
  for (const token of md.parse(src, {})) {
    if (token.level !== 0 || token.map === null)
      continue
    const [startLine, endLine] = token.map
    out.push({ startLine, endLine })
  }
  return out
}

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})\s*(\S*)/
const MATH_FENCE = /^ {0,3}\$\$/

/**
 * 围栏块是否已经闭合。
 *
 * 这不是吹毛求疵：闭合与否决定消费方要不要现在就上高亮这类一次性的昂贵渲染。
 * 一律当没闭合的话，长回复里一段早就写完的代码要等整个流结束才亮起来。
 */
export function isFenceClosed(blockSrc: string): boolean {
  const lines = blockSrc.split('\n')
  const open = lines[0]?.match(FENCE_OPEN)
  if (!open)
    return true
  const marker = open[1]![0]!
  const minLength = open[1]!.length
  const closing = new RegExp(`^ {0,3}\\${marker}{${minLength},}\\s*$`)
  return lines.slice(1).some(line => closing.test(line))
}

/** 语言标注只认这一小撮字符。围栏后面那截是模型吐出来的，不可信。 */
const SAFE_LANG = /^[\w+#.-]{1,24}$/

/**
 * 取围栏语言标注。
 *
 * 过白名单而不是原样透传：这个值会被消费方拿去拼 class 或 data 属性，
 * 而模型完全可能吐出 ```` ```ts" onload="… ```` 这种东西。
 * 不匹配就返回 undefined，让消费方走自己的降级路径，而不是在这里替它编一个语言。
 */
export function fenceLang(blockSrc: string): string | undefined {
  const open = blockSrc.split('\n')[0]?.match(FENCE_OPEN)
  const raw = open?.[2]
  if (!raw)
    return undefined
  return SAFE_LANG.test(raw) ? raw.toLowerCase() : undefined
}

/** 判断块的种类。html 永远不会从这里产出——模型吐的内联 HTML 一律转义成文本。 */
export function blockKind(blockSrc: string): 'markdown' | 'code' | 'math' {
  if (FENCE_OPEN.test(blockSrc))
    return 'code'
  // 没装数学排版器，$$ 段落对 markdown-it 就是普通文本。
  // 这里只是把它标出来，好让装了排版器的消费方认领；不认领就当文本渲，不会错
  if (MATH_FENCE.test(blockSrc))
    return 'math'
  return 'markdown'
}
