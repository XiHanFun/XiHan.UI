import type { HighlightProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectHighlight } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

/**
 * 把 text 按 keyword 切段铺进一个 `<span>`：命中的片段渲染成 `<mark>`，其余是纯文本节点。
 *
 * 整段内容由 text 与 keyword 算出，组件不收默认插槽——命中位置是按 text 这个串
 * 逐字符算的，内容另有来源就对不上了。
 */
export const XhHighlight = defineComponent({
  name: 'XhHighlight',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    text: { type: String, default: undefined },
    keyword: { type: [String, Array] as PropType<string | readonly string[]>, default: undefined },
    caseSensitive: Boolean,
  },
  setup(props) {
    const api = computed(() => connectHighlight({
      text: props.text,
      keyword: props.keyword,
      caseSensitive: props.caseSensitive,
    } satisfies HighlightProps, vueNormalize))

    return () => {
      const current = api.value
      const markProps = current.getMarkProps() as Record<string, unknown>
      // 片段每次整份重算，按位置替换即可，不给 key：一半是元素、一半是纯文本，
      // 给了 key 反而要求两种节点在同一条列表里对上号
      return h('span', current.getRootProps() as Record<string, unknown>, current.segments.map(segment =>
        segment.matched ? h('mark', markProps, segment.text) : segment.text))
    }
  },
})
