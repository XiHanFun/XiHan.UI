/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 descriptions 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { DescriptionsColumns, DescriptionsPlacement } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import { connectDescriptions } from '@xihan-ui/headless'
import { computed, defineComponent, Fragment, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideDescriptions, useDescriptionsContext } from './context'

export const XhDescriptionsRoot = defineComponent({
  name: 'XhDescriptionsRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
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
  }>,
  // 写了头部时根是片段，接不住自动透传：作者写在 XhDescriptionsRoot 上的 class / aria-* 自己合到列表那个节点上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('descriptions', props)
    const api = computed(() => connectDescriptions({
      columns: configured.columns,
      variant: configured.variant,
      placement: configured.placement,
      size: configured.size,
    }, vueNormalize))
    provideDescriptions({ api })
    return () => {
      const list = h(props.as, mergeProps(api.value.getRootProps() as Record<string, unknown>, attrs), slots.default?.())
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
      ctx.api.value.getItemProps({ span: props.span }) as Record<string, unknown>,
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
    return () => h(props.as, ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
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
    return () => h(props.as, ctx.api.value.getValueProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 列表之前的头部：左侧标题、右侧附加内容。写在 XhDescriptionsRoot 的 header 插槽中。 */
export const XhDescriptionsHeader = defineComponent({
  name: 'XhDescriptionsHeader',
  setup(_, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
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
    return () => h(props.as, ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDescriptionsExtra = defineComponent({
  name: 'XhDescriptionsExtra',
  setup(_, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h('div', ctx.api.value.getExtraProps() as Record<string, unknown>, slots.default?.())
  },
})
