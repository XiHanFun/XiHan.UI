/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { ControlVariant } from '@xihan-ui/core'
import type { CardProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectCard } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideCard, useCardContext } from './context'

export const XhCardRoot = defineComponent({
  name: 'XhCardRoot',
  // 缺省值由 connect 给出。
  props: {
    variant: { type: String as PropType<ControlVariant> },
    /** 整卡可交互：标题里的 trigger 把点击区铺满整张卡片。 */
    interactive: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('card', props)
    const api = computed(() => connectCard(configured as CardProps, vueNormalize))
    provideCard({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCardHeader = defineComponent({
  name: 'XhCardHeader',
  setup(_, { slots }) {
    const ctx = useCardContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCardTitle = defineComponent({
  name: 'XhCardTitle',
  setup(_, { slots }) {
    const ctx = useCardContext()
    return () => h('h3', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 整卡的触发器，放在 title 里：给了 href 渲染链接，不给渲染 `<button type="button">`；
 * 路由链接等作者自己的节点用 asChild。卡片 interactive 时它的点击区铺满整张卡片。
 */
export const XhCardTrigger = defineComponent({
  name: 'XhCardTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 链接地址；给了渲染 `<a>`，不给渲染按钮。 */
    href: { type: String },
    /** 借用作者的子节点作为触发器，不再渲染自己的元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useCardContext()
    return () => {
      const part = mergePartProps(ctx.api.value.getTriggerProps() as Record<string, unknown>, attrs)
      const children = slots.default?.()
      if (props.asChild)
        return mergeIntoChild(children, part, 'card')
      return props.href == null
        ? h('button', { type: 'button', ...part }, children)
        : h('a', { ...part, href: props.href }, children)
    }
  },
})

export const XhCardDescription = defineComponent({
  name: 'XhCardDescription',
  setup(_, { slots }) {
    const ctx = useCardContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCardContent = defineComponent({
  name: 'XhCardContent',
  setup(_, { slots }) {
    const ctx = useCardContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCardFooter = defineComponent({
  name: 'XhCardFooter',
  setup(_, { slots }) {
    const ctx = useCardContext()
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})
