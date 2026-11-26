/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timeline 相关实现。

import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { TimelineApi, TimelineNode, TimelinePlacement, TimelineProps } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import type { PropsOf } from '../../runtime/props-of'
import { connectTimeline, timelineStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { renderStructure } from '../../runtime/structure'
import { provideTimeline, provideTimelineItem, useTimelineContext, useTimelineItemContext } from './context'

/** 根渲染为 ol：事件本身有先后，列表标记由皮肤去除、列表语义由 role 保留。 */
export const XhTimelineRoot = defineComponent({
  name: 'XhTimelineRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 事件数据：不写默认插槽时按它铺出标准结构。 */
    collection: { type: Array as PropType<readonly TimelineNode[]> },
    orientation: { type: String as PropType<Orientation> },
    placement: { type: String as PropType<TimelinePlacement> },
    size: { type: String as PropType<Size> },
  },
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('timeline', props)
    const api = computed(() => connectTimeline(configured as TimelineProps, vueNormalize))
    provideTimeline({ api })
    return () => h('ol', api.value.getRootProps(), slots.default ? slots.default() : renderDefaultStructure(api.value))
  },
})

/** 一条事件。tone 只在该条内生效，下传给它自己的圆点。 */
export const XhTimelineItem = defineComponent({
  name: 'XhTimelineItem',
  props: {
    tone: { type: String as PropType<Tone> },
  },
  setup(props, { slots }) {
    const ctx = useTimelineContext()
    provideTimelineItem(() => ({ tone: props.tone }))
    return () => h('li', ctx.api.value.getItemProps(), slots.default?.())
  },
})

// 这一条的坐标（日期、版本号），与内容对置的那一列
export const XhTimelineLabel = defineComponent({
  name: 'XhTimelineLabel',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

export const XhTimelineIndicator = defineComponent({
  name: 'XhTimelineIndicator',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    const item = useTimelineItemContext()
    return () => h('span', ctx.api.value.getIndicatorProps(item()), slots.default?.())
  },
})

export const XhTimelineConnector = defineComponent({
  name: 'XhTimelineConnector',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('span', ctx.api.value.getConnectorProps(), slots.default?.())
  },
})

export const XhTimelineContent = defineComponent({
  name: 'XhTimelineContent',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getContentProps(), slots.default?.())
  },
})

export const XhTimelineTitle = defineComponent({
  name: 'XhTimelineTitle',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getTitleProps(), slots.default?.())
  },
})

export const XhTimelineDescription = defineComponent({
  name: 'XhTimelineDescription',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getDescriptionProps(), slots.default?.())
  },
})

/** 渲染为 time：机读时间由作者写 datetime，属性原样透传到该节点上。 */
export const XhTimelineTime = defineComponent({
  name: 'XhTimelineTime',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('time', ctx.api.value.getTimeProps(), slots.default?.())
  },
})

/** 标准结构里各部件对应的组件。 */
const TIMELINE_PARTS = {
  item: XhTimelineItem,
  label: XhTimelineLabel,
  indicator: XhTimelineIndicator,
  connector: XhTimelineConnector,
  content: XhTimelineContent,
  title: XhTimelineTitle,
  description: XhTimelineDescription,
  time: XhTimelineTime,
}

/**
 * 未写默认插槽时照 timelineStructure 铺开的事件流，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 机读时间经 time 的透传属性落到 `<time datetime>` 上。
 */
function renderDefaultStructure(api: TimelineApi): VNode[] {
  return renderStructure(timelineStructure(api), TIMELINE_PARTS)
}

// 各组件接受的 props，与 React 同名
export type XhTimelineConnectorProps = PropsOf<typeof XhTimelineConnector>
export type XhTimelineContentProps = PropsOf<typeof XhTimelineContent>
export type XhTimelineDescriptionProps = PropsOf<typeof XhTimelineDescription>
export type XhTimelineIndicatorProps = PropsOf<typeof XhTimelineIndicator>
export type XhTimelineItemProps = PropsOf<typeof XhTimelineItem>
export type XhTimelineLabelProps = PropsOf<typeof XhTimelineLabel>
export type XhTimelineRootProps = PropsOf<typeof XhTimelineRoot>
export type XhTimelineTimeProps = PropsOf<typeof XhTimelineTime>
export type XhTimelineTitleProps = PropsOf<typeof XhTimelineTitle>
