import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { HighlightApi, HighlightProps } from './highlight.types'
import { dataAttr } from '@xihan-ui/core'
import { highlightAnatomy } from './highlight.anatomy'
import { normalizeHighlightKeywords, splitHighlight } from './highlight.split'

const parts = highlightAnatomy.build()

/**
 * Highlight 无状态机：片段全部由 props 算出。
 *
 * 切段在这里做一遍，适配器直接照着 `segments` 铺节点，两端不各切一次。
 * 根上不写 role：整段文本是标题、段落还是列表项，由它被摆在哪里决定；
 * 命中的片段渲染成 `<mark>`，语义由这个标签本身给出，不另写 aria。
 *
 * @example
 * // 「组件」命中一次，切成三段：未命中 / 命中 / 未命中
 * connectHighlight({ text: '曦寒 UI 组件库', keyword: '组件' }, normalize)
 */
export function connectHighlight<T extends PropTypes>(
  props: HighlightProps,
  normalize: NormalizeProps<T>,
): HighlightApi<T> {
  const text = props.text ?? ''
  const caseSensitive = props.caseSensitive === true
  const segments = splitHighlight(text, normalizeHighlightKeywords(props.keyword), caseSensitive)

  return {
    text,
    segments,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-case-sensitive': dataAttr(caseSensitive),
    }),

    getMarkProps: () => normalize.element({ ...parts.mark.attrs }),
  }
}
