import type { PageHeaderProps } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { connectPageHeader } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { providePageHeader, usePageHeaderContext } from './context'

/** 根节点渲染为 div，缺省值由 connect 给出，这里一律 default: undefined */
export const XhPageHeaderRoot = defineComponent({
  name: 'XhPageHeaderRoot',
  props: {
    size: { type: String as PropType<Size>, default: undefined },
    bordered: Boolean,
  },
  setup(props, { slots }) {
    const api = computed(() => connectPageHeader(props as PageHeaderProps, vueNormalize))
    providePageHeader({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 返回位：组件只给身份与位置，按钮本身归作者。
 * as 决定渲染成哪个标签，默认 button；不自动补 type="button"，落在表单里需自行声明。
 */
export const XhPageHeaderBackTrigger = defineComponent({
  name: 'XhPageHeaderBackTrigger',
  props: {
    as: { type: String, default: 'button' },
  },
  setup(props, { slots }) {
    const ctx = usePageHeaderContext()
    return () => h(
      props.as,
      ctx.api.value.getBackTriggerProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

// 标题渲染为 div 而不是 hN：它只做视觉主次，不往文档大纲里插一级标题
export const XhPageHeaderTitle = defineComponent({
  name: 'XhPageHeaderTitle',
  setup(_, { slots }) {
    const ctx = usePageHeaderContext()
    return () => h('div', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

// 副标题与标题排在同一行，放编号、状态这类补充信息
export const XhPageHeaderSubtitle = defineComponent({
  name: 'XhPageHeaderSubtitle',
  setup(_, { slots }) {
    const ctx = usePageHeaderContext()
    return () => h('div', ctx.api.value.getSubtitleProps() as Record<string, unknown>, slots.default?.())
  },
})

// 操作槽只排版，按钮由作者放进插槽
export const XhPageHeaderExtra = defineComponent({
  name: 'XhPageHeaderExtra',
  setup(_, { slots }) {
    const ctx = usePageHeaderContext()
    return () => h('div', ctx.api.value.getExtraProps() as Record<string, unknown>, slots.default?.())
  },
})

// 页脚整行另起，装描述、标签页或一组摘要
export const XhPageHeaderFooter = defineComponent({
  name: 'XhPageHeaderFooter',
  setup(_, { slots }) {
    const ctx = usePageHeaderContext()
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})
