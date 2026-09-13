/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { CardProps, CardVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectCard } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideCard, useCardContext } from './context'

export const XhCardRoot = defineComponent({
  name: 'XhCardRoot',
  // 缺省值由 connect 给出。
  props: {
    variant: { type: String as PropType<CardVariant> },
  },
  setup(props, { slots }) {
    const api = computed(() => connectCard(withXhConfig('card', props) as CardProps, vueNormalize))
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
