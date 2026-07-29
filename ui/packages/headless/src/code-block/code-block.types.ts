import type { PropTypes } from '@xihan-ui/core'

export interface CodeBlockProps {
  code: string
  /** 围栏语言标注。未吐完或不认识时按 plaintext 处理。 */
  lang?: string
  /** 代码块是否已闭合。未闭合时用行数预估撑住高度，避免滚动跳变。 */
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

/** 语言未知时的落点。名字与主流高亮器一致，皮肤和将来的高亮层都能直接认。 */
export const CODE_BLOCK_FALLBACK_LANG = 'plaintext'

/**
 * 数代码有几行。
 *
 * 按 \n 切，切出来的段数就是行数：空串是 1 行（一个空块也占一行的位置，不是 0 行），
 * 结尾带换行的算多一行（那一行是真实存在的空行，编辑器也是这么数的）。
 * 这个数只用来预估高度，宁可多撑一行也别少撑——少撑会在下一帧回缩，正是要避免的跳变。
 */
export function countCodeLines(code: string): number {
  return code.split('\n').length
}
