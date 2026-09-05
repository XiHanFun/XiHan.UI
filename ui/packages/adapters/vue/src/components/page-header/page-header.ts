import type { Size } from '@xihan-ui/core'
import type { PageHeaderProps, PageHeaderVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectPageHeader } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { providePageHeader, usePageHeaderContext } from './context'

/** 根节点渲染为 div，缺省值由 connect 给出，这里一律 default: undefined */
export const XhPageHeaderRoot = defineComponent({
  name: 'XhPageHeaderRoot',
  props: {
    size: { type: String as PropType<Size>, default: undefined },
    bordered: Boolean,
    /** 形态：plain / surface / raised。不写即不画面，与写 plain 同一个样子。 */
    variant: { type: String as PropType<PageHeaderVariant>, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectPageHeader(withXhConfig('page-header', props) as PageHeaderProps, vueNormalize))
    providePageHeader({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// 面包屑位：整行排在标题之上，装什么归作者（通常是一条 XhBreadcrumbRoot）
export const XhPageHeaderBreadcrumb = defineComponent({
  name: 'XhPageHeaderBreadcrumb',
  setup(_, { slots }) {
    const ctx = usePageHeaderContext()
    return () => h('div', ctx.api.value.getBreadcrumbProps() as Record<string, unknown>, slots.default?.())
  },
})

// 头像 / 图标位：排在返回位与标题之间，图形本身归作者
export const XhPageHeaderMedia = defineComponent({
  name: 'XhPageHeaderMedia',
  setup(_, { slots }) {
    const ctx = usePageHeaderContext()
    return () => h('div', ctx.api.value.getMediaProps() as Record<string, unknown>, slots.default?.())
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

/**
 * 标题默认渲染为 div：它只做视觉主次，组件自己不往文档大纲里插一级标题。
 * as 决定渲染成哪个标签——这一块在页面大纲里确实是一级标题时写 as="h1"（或 hN）。
 */
export const XhPageHeaderTitle = defineComponent({
  name: 'XhPageHeaderTitle',
  props: {
    as: { type: String, default: 'div' },
  },
  setup(props, { slots }) {
    const ctx = usePageHeaderContext()
    return () => h(props.as, ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

// 副标题与标题排在同一行，放编号、状态这类补充信息
export const XhPageHeaderDescription = defineComponent({
  name: 'XhPageHeaderDescription',
  setup(_, { slots }) {
    const ctx = usePageHeaderContext()
    return () => h('div', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
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
