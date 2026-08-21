import type { IconProps, IconWeight } from '@xihan-ui/headless'
import type { IconNode, IconRecord, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { slotPaints } from '../../runtime/slot-content'
import { useIcon } from './use-icon'

/**
 * 把一个图元节点建成 VNode，递归到底。
 * 标签与属性名逐字透传（连字符与大小写都保留），命名空间由 Vue 从父 `<svg>` 往下带。
 */
function renderNode(node: IconNode): VNode {
  return h(node.tag, node.attrs as Record<string, unknown> | undefined, node.children?.map(renderNode))
}

/**
 * 根 `<svg>` 加一层 `<g>` 空壳，图元铺在空壳里。
 * 默认插槽给出了内容时改由插槽内容填充根，元素不再生成 glyph 与图元；
 * 判据是插槽产出里有真会画出东西的节点：既不是插槽函数存不存在（宿主可能恒传一个插槽），
 * 也不是产出数组非空（`v-if` 为假时产出里还剩一个注释节点）。
 */
export const XhIcon = defineComponent({
  name: 'XhIcon',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    icon: { type: Object as PropType<IconRecord>, default: undefined },
    label: { type: String, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    weight: { type: String as PropType<IconWeight>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useIcon(withXhConfig('icon', props) as IconProps)
    return () => {
      const authored = slots.default?.()
      return h(
        'svg',
        ctx.api.value.getRootProps() as Record<string, unknown>,
        slotPaints(authored)
          ? authored
          : [h(
              'g',
              ctx.api.value.getGlyphProps() as Record<string, unknown>,
              ctx.api.value.nodes.map(renderNode),
            )],
      )
    }
  },
})
