import type { Direction } from '@xihan-ui/core'
import type { BreadcrumbProps, BreadcrumbTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideBreadcrumb, useBreadcrumbContext } from './context'
import { useBreadcrumb } from './use-breadcrumb'

/**
 * 根节点是 nav 地标：面包屑是"回到上层"的导航，读屏用户靠地标列表直接跳进来。
 * 换成 div 的话 aria-label 无处安放，地标也就没了。
 */
export const XhBreadcrumbRoot = defineComponent({
  name: 'XhBreadcrumbRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在 connect
  props: {
    dir: { type: String as PropType<Direction>, default: undefined },
    translations: { type: Object as PropType<Partial<BreadcrumbTranslations>>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useBreadcrumb(props as BreadcrumbProps)
    provideBreadcrumb(ctx)
    return () => h('nav', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// ol 而不是 div：面包屑是有序的层级路径，读屏会念"列表，共 n 项，第 k 项"。
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

/**
 * href 归作者写（它是路由的事，不是组件的事），这里只补当前页的标记与那道点击守卫。
 * 当前页仍渲染成 `<a>`：作者的模板往往是 v-for 出来的一整排，
 * 没有"这一条换个标签"的写法；语义由 aria-current / aria-disabled 补齐。
 */
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

// 分隔符与省略号都是 ol 的直接子节点，因此同样是 li：ol 里只放得下 li。
// 两者对读屏都隐藏，列表项计数不受影响。
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
