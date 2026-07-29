import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { CodeBlockApi, CodeBlockProps } from './code-block.types'
import { dataAttr } from '@xihan-ui/core'
import { codeBlockAnatomy } from './code-block.anatomy'
import { CODE_BLOCK_FALLBACK_LANG, countCodeLines } from './code-block.types'

const parts = codeBlockAnatomy.build()

// 无状态机：代码块没有任何自有状态，代码文本、语言、是否闭合全由调用方逐帧递进来，
// 这里只把它们投影成属性。流式吐字期间这个函数会被调很多次，因此不留任何缓存与副作用。
export function connectCodeBlock<T extends PropTypes>(
  props: CodeBlockProps,
  normalize: NormalizeProps<T>,
): CodeBlockApi<T> {
  // 语言标注是模型吐出来的，半截（```ty 还没吐完的 typescript）、空串、纯空白都算常态，
  // 一律落到 plaintext；下游拿到的永远是个非空串，不必再各自兜一遍空值。
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

    // 纯装饰：语言名在代码里、在 data-lang 上都有，读屏再念一遍只是噪音
    getLangLabelProps: () => normalize.element({
      ...parts['lang-label'].attrs,
      'aria-hidden': 'true',
    }),

    getPreProps: () => normalize.element({
      ...parts.pre.attrs,
      // 代码常常横向溢出，滚动条只有指针够得着；给一个 Tab 停靠点后，
      // 方向键的横向滚动就由浏览器接手，组件一个按键都不监听
      'tabindex': 0,
      'data-complete': complete,
      // 用行数把高度先撑住，块还没吐完时下方内容就不会被一行行顶着往下跑。
      // 行高走 calc 引令牌，皮肤仍能改；但**不能**改写成 CSS 自定义属性：
      // WC 那侧的属性铺设走 Object.assign(node.style, ...)，这条路写不进 --* 变量。
      'style': { minBlockSize: `calc(var(--xh-code-block-line-height, 1.5rem) * ${lineCount})` },
    }),

    getCodeProps: () => normalize.element({
      ...parts.code.attrs,
      'data-lang': lang,
    }),
  }
}
