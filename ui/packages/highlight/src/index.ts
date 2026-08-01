import type { CodeToken, HighlighterPort } from '@xihan-ui/core'
import { langSpecOf } from './languages'
import { HIGHLIGHT_MAX_LENGTH, tokenizeCode } from './tokenize'

/**
 * HighlighterPort 的自研实现：**粗粒度**词法着色，零第三方依赖。
 *
 * 只分注释、字符串、数字、关键字、标点五类。类型名、函数名、属性名这些要靠语法树
 * 才分得出的东西一概不分——那是 TextMate 语法那一档的活，本实现不追它。
 * 想要那种精度，把 Shiki 之类接到同一个端口上即可，组件侧不用改。
 *
 * 认不出的语言、超长代码一律返回 null，由调用方原样渲染纯文本。
 */
export function createHighlighter(): HighlighterPort {
  return {
    highlight: (code: string, lang: string): readonly CodeToken[] | null => {
      if (code.length === 0 || code.length > HIGHLIGHT_MAX_LENGTH)
        return null
      const spec = langSpecOf(lang)
      return spec === null ? null : tokenizeCode(code, spec)
    },
  }
}

export { langSpecOf } from './languages'
export type { LangSpec } from './languages'
export { HIGHLIGHT_MAX_LENGTH, tokenizeCode } from './tokenize'
