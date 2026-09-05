import type { FlexProps } from '@xihan-ui/headless'
import type { PropType, Slot, SlotsType, VNode } from 'vue'
import { connectFlex } from '@xihan-ui/headless'
import { Comment, computed, defineComponent, Fragment, h, Text } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideFlex, useFlexContext } from './context'

/**
 * 分隔符部件。写 `split` 插槽时组件在每道缝里自动铺一个，
 * 手写它也铺得出同一种结构——两条路产出的 DOM 完全一致。
 */
export const XhFlexSplit = defineComponent({
  name: 'XhFlexSplit',
  setup(_, { slots }) {
    const ctx = useFlexContext()
    return () => h('span', ctx.api.value.getSplitProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 把默认插槽摊成一个个子项。
 *
 * `v-for` 产出的是一个片段而不是若干节点，不摊平就整段算一个子项，分隔符只会插在整段的两头；
 * `v-if` 为假留下的注释节点与模板缩进留下的空白文本一个像素都不画，留着会插出两条挨在一起的分隔符。
 */
function flexItems(nodes: readonly VNode[]): VNode[] {
  const items: VNode[] = []
  for (const node of nodes) {
    if (node.type === Comment)
      continue
    if (node.type === Text) {
      if (String(node.children ?? '').trim() !== '')
        items.push(node)
      continue
    }
    if (node.type === Fragment && Array.isArray(node.children)) {
      items.push(...flexItems(node.children as VNode[]))
      continue
    }
    items.push(node)
  }
  return items
}

/**
 * 在每两个子项之间铺一个分隔符部件。
 * 插槽逐缝重新求值：同一份 vnode 挂在两处会被后一处顶掉。
 */
function interleave(items: readonly VNode[], split: Slot): VNode[] {
  const out: VNode[] = []
  items.forEach((item, index) => {
    if (index > 0)
      out.push(h(XhFlexSplit, { key: `xh-flex-split-${index}` }, () => split()))
    out.push(item)
  })
  return out
}

export const XhFlex = defineComponent({
  name: 'XhFlex',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    orientation: { type: String as PropType<FlexProps['orientation']>, default: undefined },
    align: { type: String as PropType<FlexProps['align']>, default: undefined },
    justify: { type: String as PropType<FlexProps['justify']>, default: undefined },
    gap: { type: String as PropType<FlexProps['gap']>, default: undefined },
    wrap: Boolean,
    inline: Boolean,
  },
  slots: Object as SlotsType<{
    /** 子项，按写进来的顺序排开。 */
    default?: () => VNode[]
    /** 分隔符的内容：写了它，组件在每两个子项之间各铺一个分隔符部件，逐缝重新求值一次。 */
    split?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const api = computed(() => connectFlex(props as FlexProps, vueNormalize))
    provideFlex({ api })
    return () => {
      const children = slots.default?.() ?? []
      // 没写分隔符插槽时原样交出去，不摊平：摊平会打散 v-for 的片段，白白丢掉它的复用信息
      const content = slots.split ? interleave(flexItems(children), slots.split) : children
      return h('div', api.value.getRootProps() as Record<string, unknown>, content)
    }
  },
})
