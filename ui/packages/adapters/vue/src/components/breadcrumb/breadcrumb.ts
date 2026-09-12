import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { BreadcrumbItem, BreadcrumbNode, BreadcrumbNodeMeta, BreadcrumbProps, BreadcrumbTranslations } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideBreadcrumb, useBreadcrumbContext } from './context'
import { useBreadcrumb } from './use-breadcrumb'

/** 根节点渲染为 nav 地标 */
export const XhBreadcrumbRoot = defineComponent({
  name: 'XhBreadcrumbRoot',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<readonly BreadcrumbNode[]> },
    maxItems: { type: Number },
    dir: { type: String as PropType<Direction> },
    translations: { type: Object as PropType<Partial<BreadcrumbTranslations>> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
  },
  setup(props, { slots }) {
    const ctx = useBreadcrumb(withXhConfig('breadcrumb', props) as BreadcrumbProps)
    provideBreadcrumb(ctx)
    return () => h(
      'nav',
      ctx.api.value.getRootProps() as Record<string, unknown>,
      slots.default
        ? slots.default()
        : props.collection
          ? renderDefaultTree(ctx.api.value.items, slots.separator, slots.ellipsis)
          : [],
    )
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

/** 链接里的图标位，与文字并排；纯装饰 */
export const XhBreadcrumbLinkIcon = defineComponent({
  name: 'XhBreadcrumbLinkIcon',
  setup(_, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h('span', ctx.api.value.getLinkIconProps() as Record<string, unknown>, slots.default?.())
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

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 分隔符与省略位的内容默认是文字，写同名插槽即由作者接管。
 */
function renderDefaultTree(
  items: readonly BreadcrumbItem[],
  separatorSlot?: () => VNode[],
  ellipsisSlot?: (nodes: readonly BreadcrumbNodeMeta[]) => VNode[],
): VNode[] {
  return [h(XhBreadcrumbList, null, () => renderItems(items, separatorSlot, ellipsisSlot))]
}

/** ol 里那一串：层与层之间铺分隔符，被折掉的那一段铺成一个省略位。 */
function renderItems(
  items: readonly BreadcrumbItem[],
  separatorSlot?: () => VNode[],
  ellipsisSlot?: (nodes: readonly BreadcrumbNodeMeta[]) => VNode[],
): VNode[] {
  const out: VNode[] = []
  items.forEach((item, index) => {
    if (index > 0)
      out.push(h(XhBreadcrumbSeparator, { key: `sep-${index}` }, () => separatorSlot?.() ?? '/'))
    if (item.type === 'ellipsis') {
      out.push(h(XhBreadcrumbEllipsis, { key: 'ellipsis' }, () => ellipsisSlot?.(item.nodes) ?? '…'))
      return
    }
    const node = item.node
    out.push(h(XhBreadcrumbItem, { key: node.value }, () => [
      h(
        XhBreadcrumbLink,
        { current: node.current, href: node.href },
        () => [
          node.icon ? h(XhBreadcrumbLinkIcon, null, () => node.icon) : null,
          node.label,
        ],
      ),
    ]))
  })
  return out
}
