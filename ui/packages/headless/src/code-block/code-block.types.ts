import type { PropTypes } from '@xihan-ui/core'

export interface CodeBlockProps {
  code: string
  /** 围栏语言标注，为空时按 plaintext 处理。 */
  lang?: string
  /** 代码块是否已闭合，未闭合时按行数预撑高度。 */
  complete?: boolean
}

export interface CodeBlockApi<T extends PropTypes = PropTypes> {
  lang: string
  lineCount: number
  getRootProps: () => T['element']
  getLangLabelProps: () => T['element']
  getPreProps: () => T['element']
  getCodeProps: () => T['element']
}

/** 语言未知时的取值。 */
export const CODE_BLOCK_FALLBACK_LANG = 'plaintext'

/** 按 \n 切分数出代码行数：空串为 1 行，结尾换行多算一行。 */
export function countCodeLines(code: string): number {
  return code.split('\n').length
}
