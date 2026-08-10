import type { CodeBlockProps } from '@xihan-ui/headless'
import type { HighlighterPort } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { createHighlighter } from '@xihan-ui/code-highlight'
import { connectCodeBlock } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

/** 默认着色实现全组件共用一份：它无状态，没必要每个块建一个。 */
const defaultHighlighter = createHighlighter()

export const XhCodeBlock = defineComponent({
  name: 'XhCodeBlock',
  props: {
    code: { type: String, default: '' },
    lang: { type: String, default: undefined },
    // 三态，undefined 与 false 同样不落 data-complete
    complete: { type: Boolean, default: undefined },
    /** 换一个着色实现（典型是接 Shiki）；显式给 null 则关掉着色。 */
    highlighter: { type: Object as PropType<HighlighterPort | null>, default: undefined },
    highlightWhileStreaming: { type: Boolean, default: undefined },
  },
  setup(props) {
    // connect 无状态，props 变了直接重算
    const api = computed(() => connectCodeBlock({
      code: props.code,
      lang: props.lang,
      complete: props.complete,
      highlighter: props.highlighter === null ? undefined : props.highlighter ?? defaultHighlighter,
      highlightWhileStreaming: props.highlightWhileStreaming,
    } satisfies CodeBlockProps, vueNormalize))

    return () => h('div', api.value.getRootProps() as Record<string, unknown>, [
      h('span', api.value.getLangLabelProps() as Record<string, unknown>, api.value.lang),
      // 用 pre 与 code 保留代码里的空白与换行
      h('pre', api.value.getPreProps() as Record<string, unknown>, [
        h('code', api.value.getCodeProps() as Record<string, unknown>,
          // 没有着色结果就一个文本节点，别平白多包一层 span
          api.value.tokens.length === 0
            ? props.code
            : api.value.tokens.map((token, index) => h(
                'span',
                { ...api.value.getTokenProps(token) as Record<string, unknown>, key: index },
                token.text,
              ))),
      ]),
    ])
  },
})
