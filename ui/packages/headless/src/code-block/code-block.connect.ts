import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { CodeBlockApi, CodeBlockProps } from './code-block.types'
import { dataAttr } from '@xihan-ui/core'
import { codeBlockAnatomy } from './code-block.anatomy'
import { CODE_BLOCK_FALLBACK_LANG, countCodeLines } from './code-block.types'

const parts = codeBlockAnatomy.build()

// 无状态机：把调用方传入的代码文本、语言与闭合标记投影成各 part 的属性。
export function connectCodeBlock<T extends PropTypes>(
  props: CodeBlockProps,
  normalize: NormalizeProps<T>,
): CodeBlockApi<T> {
  // 空串与纯空白的语言标注一律落到 plaintext，保证 lang 非空
  const lang = props.lang?.trim() || CODE_BLOCK_FALLBACK_LANG
  const lineCount = countCodeLines(props.code)
  const complete = dataAttr(props.complete)

  return {
    lang,
    lineCount,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-lang': lang,
      'data-complete': complete,
    }),

    // 纯装饰角标，对读屏隐藏
    getLangLabelProps: () => normalize.element({
      ...parts['lang-label'].attrs,
      'aria-hidden': 'true',
    }),

    getPreProps: () => normalize.element({
      ...parts.pre.attrs,
      // 提供 Tab 停靠点，横向滚动交给浏览器
      'tabindex': 0,
      'data-complete': complete,
      // 按行数预撑高度；写成 style 而非 CSS 自定义属性，WC 侧的属性铺设写不进 --* 变量
      'style': { minBlockSize: `calc(var(--xh-code-block-line-height, 1.5rem) * ${lineCount})` },
    }),

    getCodeProps: () => normalize.element({
      ...parts.code.attrs,
      'data-lang': lang,
    }),
  }
}
