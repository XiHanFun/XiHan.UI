import type { EmptyStateLive, EmptyStateProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideEmptyState, useEmptyStateContext } from './context'
import { useEmptyState } from './use-empty-state'

/** 根节点渲染为 div，缺省值由 connect 给出，这里一律 default: undefined */
export const XhEmptyStateRoot = defineComponent({
  name: 'XhEmptyStateRoot',
  props: {
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: undefined },
    live: { type: String as PropType<EmptyStateLive>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useEmptyState(props as EmptyStateProps)
    provideEmptyState(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// 装饰性图标容器，内容由作者塞（字形、内联 svg 都行）
export const XhEmptyStateIcon = defineComponent({
  name: 'XhEmptyStateIcon',
  setup(_, { slots }) {
    const ctx = useEmptyStateContext()
    return () => h('span', ctx.api.value.getIconProps() as Record<string, unknown>, slots.default?.())
  },
})

// 标题渲染为 p 而不是 hN：它只做视觉主次，不该往文档大纲里插一级标题
export const XhEmptyStateTitle = defineComponent({
  name: 'XhEmptyStateTitle',
  setup(_, { slots }) {
    const ctx = useEmptyStateContext()
    return () => h('p', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhEmptyStateDescription = defineComponent({
  name: 'XhEmptyStateDescription',
  setup(_, { slots }) {
    const ctx = useEmptyStateContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

// 操作槽只排版，按钮由作者放进插槽
export const XhEmptyStateAction = defineComponent({
  name: 'XhEmptyStateAction',
  setup(_, { slots }) {
    const ctx = useEmptyStateContext()
    return () => h('div', ctx.api.value.getActionProps() as Record<string, unknown>, slots.default?.())
  },
})
