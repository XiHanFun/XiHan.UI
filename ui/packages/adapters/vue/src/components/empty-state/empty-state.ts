/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 empty state 相关实现。

import type { Tone } from '@xihan-ui/core'
import type { EmptyStateLive, EmptyStateProps, EmptyStateStatus, EmptyStateStructureOptions } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PropsOf } from '../../runtime/props-of'
import { emptyStateStructure } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { provideEmptyState, useEmptyStateContext } from './context'
import { useEmptyState } from './use-empty-state'

/** 根节点渲染为 div，默认值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined */
export const XhEmptyStateRoot = defineComponent({
  name: 'XhEmptyStateRoot',
  props: {
    size: { type: String as PropType<'sm' | 'md' | 'lg'> },
    live: { type: String as PropType<EmptyStateLive> },
    status: { type: String as PropType<EmptyStateStatus> },
    tone: { type: String as PropType<Tone> },
    /** 标题文字。不写默认插槽时铺标题部件；需要放置其他内容时改用 title 插槽。 */
    title: { type: String },
    /** 说明文字。不写默认插槽时铺说明部件；需要放置其他内容时改用 description 插槽。 */
    description: { type: String },
  },
  slots: Object as SlotsType<{
    default?: () => VNode[]
    /** 插画，与 indicator 二选一。 */
    media?: () => VNode[]
    /** 装饰图标。 */
    indicator?: () => VNode[]
    /** 标题，压过 title。 */
    title?: () => VNode[]
    /** 说明，压过 description。 */
    description?: () => VNode[]
    /** 操作按钮。 */
    action?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useEmptyState(withXhConfig('empty-state', props as EmptyStateProps))
    provideEmptyState(ctx)
    return () => h('div', { ...ctx.api.value.getRootProps(), ref: ctx.rootRef }, slots.default
      ? slots.default()
      : renderDefaultStructure(
          { title: props.title, description: props.description },
          { media: slots.media, indicator: slots.indicator, title: slots.title, description: slots.description, action: slots.action },
        ))
  },
})

// 插画槽，内容由作者塞（img、内联 svg 都行）；与图标槽二选一
export const XhEmptyStateMedia = defineComponent({
  name: 'XhEmptyStateMedia',
  setup(_, { slots }) {
    const ctx = useEmptyStateContext()
    return () => h('div', ctx.api.value.getMediaProps(), slots.default?.())
  },
})

// 装饰性图标容器，内容由作者塞（字形、内联 svg 都行）
export const XhEmptyStateIndicator = defineComponent({
  name: 'XhEmptyStateIndicator',
  setup(_, { slots }) {
    const ctx = useEmptyStateContext()
    return () => h('span', ctx.api.value.getIndicatorProps(), slots.default?.())
  },
})

// 标题渲染为 p 而不是 hN：它只做视觉主次，不该往文档大纲里插一级标题
export const XhEmptyStateTitle = defineComponent({
  name: 'XhEmptyStateTitle',
  setup(_, { slots }) {
    const ctx = useEmptyStateContext()
    return () => h('p', ctx.api.value.getTitleProps(), slots.default?.())
  },
})

export const XhEmptyStateDescription = defineComponent({
  name: 'XhEmptyStateDescription',
  setup(_, { slots }) {
    const ctx = useEmptyStateContext()
    return () => h('p', ctx.api.value.getDescriptionProps(), slots.default?.())
  },
})

// 操作槽只排版，按钮由作者放进插槽
export const XhEmptyStateAction = defineComponent({
  name: 'XhEmptyStateAction',
  setup(_, { slots }) {
    const ctx = useEmptyStateContext()
    return () => h('div', ctx.api.value.getActionProps(), slots.default?.())
  },
})

/** 标准结构里各部件对应的组件。 */
const EMPTY_STATE_PARTS = {
  media: XhEmptyStateMedia,
  indicator: XhEmptyStateIndicator,
  title: XhEmptyStateTitle,
  description: XhEmptyStateDescription,
  action: XhEmptyStateAction,
}

type EmptyStateSectionSlots = Readonly<Partial<Record<'media' | 'indicator' | 'title' | 'description' | 'action', () => VNode[]>>>

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 emptyStateStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 标题与说明取文字或同名插槽，插画、图标与操作区取同名插槽，给了哪段才铺哪段。
 */
function renderDefaultStructure(text: Omit<EmptyStateStructureOptions, 'slotted'>, sections: EmptyStateSectionSlots): VNode[] {
  const nodes = emptyStateStructure({ ...text, slotted: name => sections[name as keyof EmptyStateSectionSlots] != null })
  return renderStructure(nodes, EMPTY_STATE_PARTS, node => (node.slot ? sections[node.slot.name as keyof EmptyStateSectionSlots]?.() : undefined))
}

// 各组件接受的 props，与 React 同名
export type XhEmptyStateActionProps = PropsOf<typeof XhEmptyStateAction>
export type XhEmptyStateDescriptionProps = PropsOf<typeof XhEmptyStateDescription>
export type XhEmptyStateIndicatorProps = PropsOf<typeof XhEmptyStateIndicator>
export type XhEmptyStateMediaProps = PropsOf<typeof XhEmptyStateMedia>
export type XhEmptyStateRootProps = PropsOf<typeof XhEmptyStateRoot>
export type XhEmptyStateTitleProps = PropsOf<typeof XhEmptyStateTitle>
