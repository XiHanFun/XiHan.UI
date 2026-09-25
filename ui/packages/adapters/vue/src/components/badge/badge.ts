/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 badge 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { BadgePlacement, BadgeProps } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import { connectBadge } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideBadge, useBadgeContext } from './context'

const badgeProps = {
  tone: String as PropType<Tone>,
  size: String as PropType<Size>,
  /** 挂在哪个角上，默认 top-end。 */
  placement: String as PropType<BadgePlacement>,
  /** 计数：提供后角标自行显示数字，超过 max 时显示为「max+」。 */
  count: { type: Number },
  /** 计数上限，默认 99。 */
  max: { type: Number },
  /** 计数为 0 时是否仍然显示，默认不显示。 */
  showZero: { type: Boolean, default: undefined },
  /** 只显示一个点，不显示数字。 */
  dot: { type: Boolean, default: undefined },
  /** 圆点呼吸：表达正在进行、给不出进度的状态。只在 dot 模式下生效。 */
  pulse: { type: Boolean, default: undefined },
  /** 读屏朗读该角标的方式，例如「3 条未读」。 */
  label: { type: String },
} as const

/**
 * 锚点：被标记的元素（按钮、头像、标签页）写进默认插槽，角标另起一层贴在它的角上。
 *
 * 角标是挂在其他元素角上的标记，不是可以单独放置的药丸：
 * 行内的状态药丸请使用 tag。
 */
export const XhBadgeRoot = defineComponent({
  name: 'XhBadgeRoot',
  props: badgeProps,
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('badge', props)
    const api = computed(() => connectBadge(configured as BadgeProps, vueNormalize))
    provideBadge({ api })
    return () => h('span', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 角标本身，绝对定位在锚点的某个角上。未提供内容时使用计算得出的计数文本。 */
export const XhBadgeIndicator = defineComponent({
  name: 'XhBadgeIndicator',
  slots: Object as SlotsType<{ default?: (props: { text: string }) => VNode[] }>,
  setup(_, { slots }) {
    const ctx = useBadgeContext()
    return () => h(
      'span',
      ctx.api.value.getIndicatorProps() as Record<string, unknown>,
      slots.default?.({ text: ctx.api.value.text }) ?? ctx.api.value.text,
    )
  },
})

/**
 * 一步到位的写法：默认插槽放被标记的元素，角标自动跟随。
 *
 * 需要在角标中放置自定义内容（例如一个小图标）时改用 XhBadgeRoot + XhBadgeIndicator。
 */
export const XhBadge = defineComponent({
  name: 'XhBadge',
  props: badgeProps,
  slots: Object as SlotsType<{ default?: () => VNode[] }>,
  setup(props, { slots }) {
    return () => h(XhBadgeRoot, props, () => [slots.default?.(), h(XhBadgeIndicator)])
  },
})
