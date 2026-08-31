import type { CodeToken, HighlighterPort, PropTypes, Size } from '@xihan-ui/kernel'

/** 语言未知时的取值。 */
export const CODE_VIEW_FALLBACK_LANG = 'plaintext'

/** 行号槽宽按位数分档，超过这个位数一律按它算。 */
export const CODE_VIEW_MAX_DIGITS = 7

/** parseLineRanges 一次最多展开这么多行号，防一个写错的区间把整页算死。 */
export const CODE_VIEW_MAX_HIGHLIGHT_LINES = 10_000

/** 切好的一行。 */
export interface CodeLine {
  /**
   * 该行的完整文本，**不含结尾换行**——逐行块级元素时浏览器在块边界本身就补一个换行，
   * 文本里再留一个会让框选复制拿到双倍空行。
   * 无损契约：`lines.map(l => l.text).join('\n') === code`。
   */
  readonly text: string
  /** 该行被切开的记号片段；整段不着色时为空数组，此时按 text 原样渲染。 */
  readonly tokens: readonly CodeToken[]
}

export interface CodeViewClampToggleDetails {
  clamped: boolean
}

/** 逐行取属性时的自报家门，index 是 0 基行下标。 */
export interface CodeViewLineProps {
  index: number
}

export interface CodeViewProps {
  code: string
  /** 围栏语言标注，空白一律落 plaintext。 */
  lang?: string
  /** 文件名，渲染在 header 里；渲染出来之后它就是 pre 的可访问名。 */
  filename?: string
  /**
   * 作者渲染了 filename 部件时置真，由适配器统计而不是看 filename 有没有值。
   * 为假时 pre 用 translations.code 兜底——指向一个没渲出来的 id 会让读屏读空。
   */
  labelled?: boolean
  /** 代码是否已闭合，未闭合时按行数预撑高度且默认不着色。 */
  complete?: boolean
  /** 长行自动换行，默认关（长行横向滚动）。 */
  wrap?: boolean
  /** 渲染行号槽。 */
  lineNumbers?: boolean
  /** 首行的行号，默认 1；摘录与 patch 片段要用。 */
  startLine?: number
  /** 要高亮的行号，写成 `'3,7-9'` 或行号数组；非法片段丢弃不报错。 */
  highlightLines?: string | readonly number[]
  /** 超过这么多行才算可折叠。 */
  clamp?: number
  /** 折叠态，纯受控——没有 defaultClamped，要非受控就套 collapsible。 */
  clamped?: boolean
  /**
   * 着色实现。不给就是纯文本，给了也允许它返回 null（语言不认识之类），同样退回纯文本。
   * 未闭合的块默认不着色，见 {@link highlightWhileStreaming}。
   */
  highlighter?: HighlighterPort
  /**
   * 块还没闭合时也着色，默认 false。
   * 默认关是因为半截代码的词法本来就不稳——引号、括号随时会配上，
   * 每来一个 token 整块变一次色，看着比不着色更糟。
   */
  highlightWhileStreaming?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  translations?: Partial<CodeViewTranslations>
  /** 折叠态翻面的意图回调；clamped 是纯受控的，落不落由宿主决定。 */
  onClampToggle?: (details: CodeViewClampToggleDetails) => void
}

export interface CodeViewApi<T extends PropTypes = PropTypes> {
  lang: string
  lineCount: number
  /** 逐行切好的文本与记号片段。 */
  lines: readonly CodeLine[]
  /** 每行的行号，与 lines 同序。 */
  lineNumberAt: (index: number) => number
  /** 是否渲染行号槽；适配器据此决定要不要建那个节点。 */
  lineNumbers: boolean
  /** 折叠可用：给了正数 clamp 且行数确实超过它。 */
  foldable: boolean
  clamped: boolean
  /** 发一次折叠意图；与当前态相同时不发。 */
  setClamped: (next: boolean) => void
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  getFilenameProps: () => T['element']
  getLangLabelProps: () => T['element']
  getPreProps: () => T['element']
  getCodeProps: () => T['element']
  getLineProps: (props: CodeViewLineProps) => T['element']
  getLineNumberProps: (props: CodeViewLineProps) => T['element']
  getLineContentProps: (props: CodeViewLineProps) => T['element']
  getTokenProps: (token: CodeToken) => T['element']
  getFoldTriggerProps: () => T['button']
}

export interface CodeViewTranslations {
  /** 没有文件名时 pre 的可访问名。 */
  code: string
  /** 展开按钮的可访问名。 */
  expand: string
  /** 收起按钮的可访问名。 */
  collapse: string
}

/** 按 \n 切分数出代码行数：空串为 1 行，结尾换行多算一行。 */
export function countCodeViewLines(code: string): number {
  return code.split('\n').length
}

/**
 * 把 `'3,7-9'` 这样的写法或行号数组归一成升序去重的行号表。
 * 非法片段一律丢弃不报错——一个高亮参数写错不该让代码渲不出来。
 * 展开总数封顶在 {@link CODE_VIEW_MAX_HIGHLIGHT_LINES}。
 */
export function parseLineRanges(spec: string | readonly number[] | undefined): readonly number[] {
  if (spec === undefined)
    return []

  const out = new Set<number>()
  const take = (n: number): boolean => {
    if (Number.isInteger(n) && n > 0)
      out.add(n)
    return out.size < CODE_VIEW_MAX_HIGHLIGHT_LINES
  }

  if (typeof spec !== 'string') {
    for (const n of spec) {
      if (!take(n))
        break
    }
    return [...out].sort((a, b) => a - b)
  }

  for (const piece of spec.split(',')) {
    const text = piece.trim()
    if (text === '')
      continue
    const range = /^(\d+)-(\d+)$/.exec(text)
    if (range === null) {
      const single = /^\d+$/.test(text) ? Number(text) : Number.NaN
      if (!take(single))
        break
      continue
    }
    const from = Number(range[1])
    const to = Number(range[2])
    // 倒着写的区间当没写
    if (from > to)
      continue
    let full = true
    for (let n = from; n <= to; n++) {
      if (!take(n)) {
        full = false
        break
      }
    }
    if (!full)
      break
  }
  return [...out].sort((a, b) => a - b)
}

/**
 * 把整段代码与它的记号流切成逐行结构。
 *
 * 词法器是单趟不回溯的，一个记号可以横跨多行（未闭合的字符串与块注释就是这样），
 * 所以「一个记号一个 span」的渲染方式切不出行——行号与高亮行必须在这里算。
 * 行文本一律取自 `code` 本身，记号流短了就用 plain 片段补齐，无损契约不受着色实现影响。
 */
export function splitCodeLines(code: string, tokens: readonly CodeToken[] = []): readonly CodeLine[] {
  const texts = code.split('\n')
  if (tokens.length === 0)
    return texts.map(text => ({ text, tokens: [] }))

  let cursor = 0
  let offset = 0

  /** 从记号流上消费 n 个字符；collect 为假时只前进不收片段，用来吃掉行尾换行。 */
  const take = (n: number, collect: boolean): { frags: CodeToken[], taken: number } => {
    const frags: CodeToken[] = []
    let taken = 0
    while (taken < n && cursor < tokens.length) {
      const token = tokens[cursor]!
      const rest = token.text.length - offset
      const want = n - taken
      if (rest <= want) {
        if (collect && rest > 0)
          frags.push({ text: token.text.slice(offset), kind: token.kind })
        taken += rest
        cursor++
        offset = 0
      }
      else {
        if (collect)
          frags.push({ text: token.text.slice(offset, offset + want), kind: token.kind })
        offset += want
        taken = n
      }
    }
    return { frags, taken }
  }

  const lines: CodeLine[] = []
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]!
    const { frags, taken } = take(text.length, true)
    if (taken < text.length)
      frags.push({ text: text.slice(taken), kind: 'plain' })
    lines.push({ text, tokens: frags })
    if (i < texts.length - 1)
      take(1, false)
  }
  return lines
}
