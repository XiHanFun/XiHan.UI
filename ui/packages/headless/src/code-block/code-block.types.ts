import type { CodeToken, HighlighterPort, PropTypes } from '@xihan-ui/core'

export interface CodeBlockProps {
  code: string
  /** 围栏语言标注，为空时按 plaintext 处理。 */
  lang?: string
  /** 代码块是否已闭合，未闭合时按行数预撑高度。 */
  complete?: boolean
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
}

export interface CodeBlockApi<T extends PropTypes = PropTypes> {
  lang: string
  lineCount: number
  /**
   * 着色结果。空数组表示这一次不着色，作者按 `code` 原样渲染纯文本即可。
   * 非空时逐个记号渲成元素，`getTokenProps` 给出该带的属性。
   */
  tokens: readonly CodeToken[]
  getRootProps: () => T['element']
  getLangLabelProps: () => T['element']
  getPreProps: () => T['element']
  getCodeProps: () => T['element']
  getTokenProps: (token: CodeToken) => T['element']
}

/** 语言未知时的取值。 */
export const CODE_BLOCK_FALLBACK_LANG = 'plaintext'

/** 按 \n 切分数出代码行数：空串为 1 行，结尾换行多算一行。 */
export function countCodeLines(code: string): number {
  return code.split('\n').length
}
