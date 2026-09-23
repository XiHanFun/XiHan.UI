/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timeline 相关实现。

import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { TimelinePlacement, TimelineProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectTimeline } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideTimeline, provideTimelineItem, useTimelineContext, useTimelineItem } from './context'

/** 根渲染为 ol：事件本身有先后，列表标记由皮肤去除、列表语义由 role 保留。 */
export const XhTimelineRoot = defineComponent({
  name: 'XhTimelineRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    orientation: { type: String as PropType<Orientation> },
    placement: { type: String as PropType<TimelinePlacement> },
    size: { type: String as PropType<Size> },
  },
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('timeline', props)
    const api = computed(() => connectTimeline(configured as TimelineProps, vueNormalize))
    provideTimeline({ api })
    return () => h('ol', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
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
    return () => h('li', ctx.api.value.getItemProps() as Record<string, unknown>, slots.default?.())
  },
})

// 这一条的坐标（日期、版本号），与内容对置的那一列
export const XhTimelineLabel = defineComponent({
  name: 'XhTimelineLabel',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineIndicator = defineComponent({
  name: 'XhTimelineIndicator',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    const item = useTimelineItem()
    return () => h('span', ctx.api.value.getIndicatorProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineConnector = defineComponent({
  name: 'XhTimelineConnector',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('span', ctx.api.value.getConnectorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineContent = defineComponent({
  name: 'XhTimelineContent',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineTitle = defineComponent({
  name: 'XhTimelineTitle',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineDescription = defineComponent({
  name: 'XhTimelineDescription',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 渲染为 time：机读时间由作者写 datetime，属性原样透传到该节点上。 */
export const XhTimelineTime = defineComponent({
  name: 'XhTimelineTime',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('time', ctx.api.value.getTimeProps() as Record<string, unknown>, slots.default?.())
  },
})
