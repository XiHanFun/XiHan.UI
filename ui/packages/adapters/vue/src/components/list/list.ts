import type { Size } from '@xihan-ui/core'
import type { PropType } from 'vue'
import { connectList } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideList, useListContext } from './context'

export const XhListRoot = defineComponent({
  name: 'XhListRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    bordered: Boolean,
    hoverable: Boolean,
    split: Boolean,
    size: { type: String as PropType<Size>, default: undefined },
    /** 根渲染成哪个标签，默认 ul；换成 div 即不进读屏的列表语义。 */
    as: { type: String, default: 'ul' },
  },
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('list', props)
    const api = computed(() => connectList({
      bordered: configured.bordered,
      hoverable: configured.hoverable,
      split: configured.split,
      size: configured.size,
    }, vueNormalize))
    provideList({ api })
    return () => h(props.as, api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListItem = defineComponent({
  name: 'XhListItem',
  props: {
    /** 条目渲染成哪个标签，默认 li；根换成 div 时这里一并换掉。 */
    as: { type: String, default: 'li' },
  },
  setup(props, { slots }) {
    const ctx = useListContext()
    return () => h(props.as, ctx.api.value.getItemProps() as Record<string, unknown>, slots.default?.())
  },
})

// 媒体位排在条目最前，内容由作者塞（头像、图标、缩略图都行）
export const XhListItemMedia = defineComponent({
  name: 'XhListItemMedia',
  setup(_, { slots }) {
    const ctx = useListContext()
    return () => h('div', ctx.api.value.getItemMediaProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListItemContent = defineComponent({
  name: 'XhListItemContent',
  setup(_, { slots }) {
    const ctx = useListContext()
    return () => h('div', ctx.api.value.getItemContentProps() as Record<string, unknown>, slots.default?.())
  },
})

// 标题渲染为 div 而不是 hN：它只做视觉主次，不往文档大纲里插一级标题
export const XhListItemTitle = defineComponent({
  name: 'XhListItemTitle',
  setup(_, { slots }) {
    const ctx = useListContext()
    return () => h('div', ctx.api.value.getItemTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListItemDescription = defineComponent({
  name: 'XhListItemDescription',
  setup(_, { slots }) {
    const ctx = useListContext()
    return () => h('div', ctx.api.value.getItemDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

// 操作位排在条目末尾，按钮由作者放进插槽
export const XhListItemAction = defineComponent({
  name: 'XhListItemAction',
  setup(_, { slots }) {
    const ctx = useListContext()
    return () => h('div', ctx.api.value.getItemActionProps() as Record<string, unknown>, slots.default?.())
  },
})
