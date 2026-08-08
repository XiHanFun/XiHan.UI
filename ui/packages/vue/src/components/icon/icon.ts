import type { IconNode, IconRecord } from '@xihan-ui/core'
import type { IconProps, IconSize, IconWeight } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { defineComponent, h } from 'vue'
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
 * 判据是插槽的产出非空，不是插槽函数存不存在——宿主可能恒传一个产出为空的插槽。
 */
export const XhIcon = defineComponent({
  name: 'XhIcon',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    icon: { type: Object as PropType<IconRecord>, default: undefined },
    label: { type: String, default: undefined },
    size: { type: String as PropType<IconSize>, default: undefined },
    weight: { type: String as PropType<IconWeight>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useIcon(props as IconProps)
    return () => {
      const authored = slots.default?.()
      return h(
        'svg',
        ctx.api.value.getRootProps() as Record<string, unknown>,
        authored?.length
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
