/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 descriptions 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { DescriptionsApi, DescriptionsColumns, DescriptionsNode, DescriptionsNodeMeta, DescriptionsPlacement, StructureNode } from '@xihan-ui/headless'
import type { FunctionalComponent, PropType, SlotsType, VNode } from 'vue'
import type { PropsOf } from '../../runtime/props-of'
import { connectDescriptions, descriptionsStructure } from '@xihan-ui/headless'
import { computed, defineComponent, Fragment, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { renderStructure } from '../../runtime/structure'
import { provideDescriptions, useDescriptionsContext } from './context'

export const XhDescriptionsRoot = defineComponent({
  name: 'XhDescriptionsRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 各组的数据：不写默认插槽时按它铺出标准结构。 */
    collection: { type: Array as PropType<readonly DescriptionsNode[]> },
    columns: { type: Number as PropType<DescriptionsColumns> },
    variant: { type: String as PropType<ControlVariant> },
    placement: { type: String as PropType<DescriptionsPlacement> },
    size: { type: String as PropType<Size> },
    /** 根渲染为哪个标签，默认 dl。 */
    as: { type: String, default: 'dl' },
  },
  slots: Object as SlotsType<{
    default?: () => VNode[]
    /**
     * 列表之前的头部：放 XhDescriptionsHeader（内含 Title 与 Extra）。
     * 它渲染为根的兄弟排在列表前：根常写成 dl，dl 的子节点只能是成对的 dt / dd。
     */
    header?: () => VNode[]
    /** 标准结构里一格的取值，载荷是这一组的元信息；不写时取值铺 collection 里的 value。 */
    value?: (item: DescriptionsNodeMeta) => VNode[]
  }>,
  // 写了头部时根是片段，接不住自动透传：作者写在 XhDescriptionsRoot 上的 class / aria-* 自己合到列表那个节点上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('descriptions', props)
    const api = computed(() => connectDescriptions({
      collection: configured.collection,
      columns: configured.columns,
      variant: configured.variant,
      placement: configured.placement,
      size: configured.size,
    }, vueNormalize))
    provideDescriptions({ api })
    return () => {
      const list = h(props.as, mergeProps(api.value.getRootProps(), attrs), slots.default ? slots.default() : renderDefaultStructure(api.value, slots.value))
      const header = slots.header?.()
      return header ? h(Fragment, [...header, list]) : list
    }
  },
})

// 一组「标签 + 取值」包一层，让它成为网格里的一格；dl 允许 div 包裹成对的 dt/dd
export const XhDescriptionsItem = defineComponent({
  name: 'XhDescriptionsItem',
  props: {
    /** 每一格渲染为哪个标签，默认 div。 */
    as: { type: String, default: 'div' },
    /** 该格横跨几列，未写即占一列；上限是根上的 columns。 */
    span: { type: Number },
  },
  setup(props, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h(
      props.as,
      ctx.api.value.getItemProps({ span: props.span }),
      slots.default?.(),
    )
  },
})

export const XhDescriptionsLabel = defineComponent({
  name: 'XhDescriptionsLabel',
  props: {
    /** 标签渲染为哪个标签，默认 dt。 */
    as: { type: String, default: 'dt' },
  },
  setup(props, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h(props.as, ctx.api.value.getLabelProps(), slots.default?.())
  },
})

export const XhDescriptionsValue = defineComponent({
  name: 'XhDescriptionsValue',
  props: {
    /** 取值渲染为哪个标签，默认 dd。 */
    as: { type: String, default: 'dd' },
  },
  setup(props, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h(props.as, ctx.api.value.getValueProps(), slots.default?.())
  },
})

/** 列表之前的头部：左侧标题、右侧附加内容。写在 XhDescriptionsRoot 的 header 插槽中。 */
export const XhDescriptionsHeader = defineComponent({
  name: 'XhDescriptionsHeader',
  setup(_, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h('div', ctx.api.value.getHeaderProps(), slots.default?.())
  },
})

export const XhDescriptionsTitle = defineComponent({
  name: 'XhDescriptionsTitle',
  props: {
    /** 标题渲染为哪个标签，默认 div：组件不往文档大纲里插标题，作者按页面层级改写成 h2 / h3。 */
    as: { type: String, default: 'div' },
  },
  setup(props, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h(props.as, ctx.api.value.getTitleProps(), slots.default?.())
  },
})

export const XhDescriptionsExtra = defineComponent({
  name: 'XhDescriptionsExtra',
  setup(_, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h('div', ctx.api.value.getExtraProps(), slots.default?.())
  },
})

/** 按数据铺的一格：结构节点上的跨列数是作者会写在节点上的字符串，交给格子时换成数。 */
const DescriptionsStructureItem: FunctionalComponent<{ span?: string }> = (props, { slots }) =>
  h(XhDescriptionsItem, { span: props.span == null ? undefined : Number(props.span) }, slots)
DescriptionsStructureItem.props = { span: { type: String } }

/** 标准结构里各部件对应的组件。 */
const DESCRIPTIONS_PARTS = {
  item: DescriptionsStructureItem,
  label: XhDescriptionsLabel,
  value: XhDescriptionsValue,
}

/**
 * 未写默认插槽时照 descriptionsStructure 铺开的各组，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 取值给了 value 插槽就由它提供，否则铺 collection 里的 value。头部照旧经 header 插槽。
 */
function renderDefaultStructure(api: DescriptionsApi, valueSlot: ((item: DescriptionsNodeMeta) => VNode[]) | undefined): VNode[] {
  const nodes = descriptionsStructure(api, { slotted: name => name === 'value' && valueSlot != null })
  return renderStructure(nodes, DESCRIPTIONS_PARTS, (node: StructureNode) =>
    node.slot?.name === 'value' ? valueSlot?.(node.data as DescriptionsNodeMeta) : undefined)
}

// 各组件接受的 props，与 React 同名
export type XhDescriptionsExtraProps = PropsOf<typeof XhDescriptionsExtra>
export type XhDescriptionsHeaderProps = PropsOf<typeof XhDescriptionsHeader>
export type XhDescriptionsItemProps = PropsOf<typeof XhDescriptionsItem>
export type XhDescriptionsLabelProps = PropsOf<typeof XhDescriptionsLabel>
export type XhDescriptionsRootProps = PropsOf<typeof XhDescriptionsRoot>
export type XhDescriptionsTitleProps = PropsOf<typeof XhDescriptionsTitle>
export type XhDescriptionsValueProps = PropsOf<typeof XhDescriptionsValue>
