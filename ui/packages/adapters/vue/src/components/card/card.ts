import type { Size } from '@xihan-ui/core'
import type { CardProps, CardVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectCard } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideCard, useCardContext } from './context'

export const XhCardRoot = defineComponent({
  name: 'XhCardRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    variant: { type: String as PropType<CardVariant>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    hoverable: Boolean,
    split: Boolean,
  },
  setup(props, { slots }) {
    const api = computed(() => connectCard(withXhConfig('card', props) as CardProps, vueNormalize))
    provideCard({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCardMedia = defineComponent({
  name: 'XhCardMedia',
  setup(_, { slots }) {
    const ctx = useCardContext()
    return () => h('div', ctx.api.value.getMediaProps() as Record<string, unknown>, slots.default?.())
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
    return () => h('div', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCardDescription = defineComponent({
  name: 'XhCardDescription',
  setup(_, { slots }) {
    const ctx = useCardContext()
    return () => h('div', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCardBody = defineComponent({
  name: 'XhCardBody',
  setup(_, { slots }) {
    const ctx = useCardContext()
    return () => h('div', ctx.api.value.getBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCardFooter = defineComponent({
  name: 'XhCardFooter',
  setup(_, { slots }) {
    const ctx = useCardContext()
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})
