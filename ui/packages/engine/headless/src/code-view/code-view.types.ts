/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 code view 类型契约。

import type { CodeToken, HighlighterPort, MachineSchema, PropTypes, Size } from '@xihan-ui/core'

/** 语言未知时的取值。 */
export const CODE_VIEW_FALLBACK_LANG = 'plaintext'

/** 行号槽宽度按位数分档，超过该位数一律按它计算。 */
export const CODE_VIEW_MAX_DIGITS = 7

/** parseLineRanges 一次最多展开的行号数，防止一个写错的区间导致整页计算过载。 */
export const CODE_VIEW_MAX_HIGHLIGHT_LINES = 10_000

/** 切分后的一行。 */
export interface CodeLine {
  /**
   * 该行的完整文本，不含结尾换行：逐行块级元素时浏览器在块边界本身补一个换行，
   * 文本中再保留一个会使框选复制得到双倍空行。
   * 无损契约：`lines.map(l => l.text).join('\n') === code`。
   */
  readonly text: string
  /** 该行被切开的记号片段；整段不着色时为空数组，此时按 text 原样渲染。 */
  readonly tokens: readonly CodeToken[]
}

export interface CodeViewClampToggleDetails {
  clamped: boolean
}

/** 逐行取属性时的声明，index 是 0 基行下标。 */
export interface CodeViewLineProps {
  index: number
}

export interface CodeViewSchema extends MachineSchema {
  props: {
    code: string
    /** 围栏语言标注，空白一律落为 plaintext。 */
    lang?: string
    /** 文件名，渲染在 header 中；渲染之后它即为 pre 的可访问名。 */
    filename?: string
    /**
     * 作者渲染了 filename 部件时置真，由适配器统计而不是判断 filename 是否有值。
     * 为假时 pre 用 translations.code 兜底：指向未渲染的 id 会使读屏读空。
     */
    labelled?: boolean
    /** 代码是否已闭合，未闭合时按行数预撑高度且默认不着色。 */
    complete?: boolean
    /** 长行自动换行，默认关闭（长行横向滚动）。 */
    wrap?: boolean
    /** 渲染行号槽。 */
    lineNumbers?: boolean
    /** 首行的行号，默认 1；摘录与 patch 片段需要使用。 */
    startLine?: number
    /** 要高亮的行号，写为 `'3,7-9'` 或行号数组；非法片段丢弃不报错。 */
    highlightLines?: string | readonly number[]
    /** 超过该行数才视为可折叠。 */
    clamp?: number
    /** 折叠态，纯受控：没有 defaultClamped，需要非受控时套用 collapsible。 */
    clamped?: boolean
    /**
     * 着色实现。未提供时为纯文本，提供后也允许返回 null（语言未识别等），同样回退为纯文本。
     * 未闭合的块默认不着色，见 {@link highlightWhileStreaming}。
     */
    highlighter?: HighlighterPort
    /**
     * 块尚未闭合时也着色，默认 false。
     * 默认关闭是因为未闭合代码的词法本身不稳定：引号、括号随时会配对，
     * 每到一个 token 整块变一次色，比不着色更差。
     */
    highlightWhileStreaming?: boolean
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<CodeViewTranslations>
    /** 折叠态切换的意图回调；clamped 是纯受控的，是否落定由宿主决定。 */
    onClampToggle?: (details: CodeViewClampToggleDetails) => void
  }
  context: {
    /**
     * 按压通道：折叠条被 Space / Enter 或触屏手指按住期间为 true，fold-trigger 投影 data-pressed。
     * 抬起、失焦、指针取消，或按住途中折叠条因不再可折叠而收起时撤下；与折叠态互相独立。
     */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：折叠态纯受控、着色与切行都是纯函数，机器只承载按压通道。 */
  state: 'idle'
  event:
    /** 按压通道（shared/press）：折叠条被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START' }
    /** 折叠条抬起、失焦或指针取消。 */
    | { type: 'PRESS.END' }
  tag: never
  guard: 'canPress'
  action: 'startPress' | 'endPress' | 'releaseWhenUnfoldable'
  effect: never
}

export type CodeViewProps = CodeViewSchema['props']

export interface CodeViewApi<T extends PropTypes = PropTypes> {
  lang: string
  lineCount: number
  /** 逐行切分后的文本与记号片段。 */
  lines: readonly CodeLine[]
  /** 每行的行号，与 lines 同序。 */
  lineNumberAt: (index: number) => number
  /** 是否渲染行号槽；适配器据此决定是否创建该节点。 */
  lineNumbers: boolean
  /** 折叠可用：提供了正数 clamp 且行数确实超过它。 */
  foldable: boolean
  clamped: boolean
  /** 发出一次折叠意图；与当前态相同时不发。 */
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

/** 按 \n 切分统计代码行数：空串为 1 行，结尾换行多计一行。 */
export function countCodeViewLines(code: string): number {
  return code.split('\n').length
}

/**
 * 折叠是否可用：提供了正数 clamp 且行数确实超过它。
 * connect 与机器的按压守卫共用同一份判据，折叠条是否在场只有一处答案。
 */
export function isCodeViewFoldable(code: string, clamp: number | undefined): boolean {
  if (!Number.isFinite(clamp) || clamp! <= 0)
    return false
  return countCodeViewLines(code) > Math.floor(clamp!)
}

/**
 * 把 `'3,7-9'` 这类写法或行号数组归一为升序去重的行号表。
 * 非法片段一律丢弃不报错：一个高亮参数写错不应导致代码无法渲染。
 * 展开总数上限为 {@link CODE_VIEW_MAX_HIGHLIGHT_LINES}。
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
 * 把整段代码与它的记号流切分为逐行结构。
 *
 * 词法器是单趟不回溯的，一个记号可以横跨多行（未闭合的字符串与块注释即是如此），
 * 因此一个记号一个 span 的渲染方式无法切分出行：行号与高亮行必须在这里计算。
 * 行文本一律取自 `code` 本身，记号流不足时用 plain 片段补齐，无损契约不受着色实现影响。
 */
export function splitCodeLines(code: string, tokens: readonly CodeToken[] = []): readonly CodeLine[] {
  const texts = code.split('\n')
  if (tokens.length === 0)
    return texts.map(text => ({ text, tokens: [] }))

  let cursor = 0
  let offset = 0

  /** 从记号流上消费 n 个字符；collect 为假时只前进不收集片段，用于消费行尾换行。 */
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
