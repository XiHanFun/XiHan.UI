import type { BreadcrumbProps, BreadcrumbTranslations } from '@xihan-ui/headless'
import type { Direction, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideBreadcrumb, useBreadcrumbContext } from './context'
import { useBreadcrumb } from './use-breadcrumb'

/** 根节点渲染为 nav 地标 */
export const XhBreadcrumbRoot = defineComponent({
  name: 'XhBreadcrumbRoot',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    dir: { type: String as PropType<Direction>, default: undefined },
    translations: { type: Object as PropType<Partial<BreadcrumbTranslations>>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useBreadcrumb(withXhConfig('breadcrumb', props) as BreadcrumbProps)
    provideBreadcrumb(ctx)
    return () => h('nav', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// 渲染为 ol，把层级路径表达成有序列表
export const XhBreadcrumbList = defineComponent({
  name: 'XhBreadcrumbList',
  setup(_, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h('ol', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhBreadcrumbItem = defineComponent({
  name: 'XhBreadcrumbItem',
  setup(_, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h('li', ctx.api.value.getItemProps() as Record<string, unknown>, slots.default?.())
  },
})

/** href 由作者写，这里只补当前页标记与点击守卫；当前页同样渲染为 `<a>`。 */
export const XhBreadcrumbLink = defineComponent({
  name: 'XhBreadcrumbLink',
  props: {
    current: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h(
      'a',
      ctx.api.value.getLinkProps({ current: props.current }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

// 分隔符与省略号同为 ol 的直接子节点，渲染为 li 并对读屏隐藏
export const XhBreadcrumbSeparator = defineComponent({
  name: 'XhBreadcrumbSeparator',
  setup(_, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h('li', ctx.api.value.getSeparatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhBreadcrumbEllipsis = defineComponent({
  name: 'XhBreadcrumbEllipsis',
  setup(_, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h('li', ctx.api.value.getEllipsisProps() as Record<string, unknown>, slots.default?.())
  },
})
