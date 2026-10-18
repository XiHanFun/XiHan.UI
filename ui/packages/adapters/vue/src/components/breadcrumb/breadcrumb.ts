/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 breadcrumb 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { BreadcrumbApi, BreadcrumbNode, BreadcrumbNodeMeta, BreadcrumbProps, BreadcrumbTranslations, StructureNode } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { breadcrumbStructure } from '@xihan-ui/headless'
import { defineComponent, h, useId } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { renderStructure } from '../../runtime/structure'
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
        : renderDefaultStructure(ctx.api.value, slots.separator, slots.ellipsis),
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

/**
 * href 由作者写，这里只补当前页标记与点击守卫；当前页同样渲染为 `<a>`。
 * value 是链接身份，按压通道按它记住正被按住的那一条；未声明时派生一个实例内稳定的键。
 */
export const XhBreadcrumbLink = defineComponent({
  name: 'XhBreadcrumbLink',
  // 直通属性自己合：作者的处理器排在部件前面，asChild 时连同部件属性一起落到作者的链接上
  inheritAttrs: false,
  props: {
    value: { type: String },
    current: Boolean,
    /** 借用作者的子节点（如路由链接）作为链接，不再渲染自己的 `<a>`；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useBreadcrumbContext()
    const fallbackValue = useId()
    return () => {
      const part = mergePartProps(
        ctx.api.value.getLinkProps({ value: props.value ?? fallbackValue, current: props.current }) as Record<string, unknown>,
        attrs,
      )
      const children = slots.default?.()
      if (props.asChild)
        return mergeIntoChild(children, part, 'breadcrumb', { applyAnatomy: true })
      return h('a', part, children)
    }
  },
})

/** 链接中的图标位，与文字并排；纯装饰 */
export const XhBreadcrumbLinkIcon = defineComponent({
  name: 'XhBreadcrumbLinkIcon',
  setup(_, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h('span', ctx.api.value.getLinkIconProps() as Record<string, unknown>, slots.default?.())
  },
})

// 分隔符是 ol 的直接子节点，渲染为 li 并对读屏隐藏
export const XhBreadcrumbSeparator = defineComponent({
  name: 'XhBreadcrumbSeparator',
  setup(_, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h('li', ctx.api.value.getSeparatorProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 折叠位：路径里的一个列表项，装着展开完整路径的触发器；展开后收起。 */
export const XhBreadcrumbEllipsis = defineComponent({
  name: 'XhBreadcrumbEllipsis',
  setup(_, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h('li', ctx.api.value.getEllipsisProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 折叠位里的触发器：按下展开完整路径，焦点落到第一条展开出来的链接上；不写内容时由皮肤画一枚省略号字形。 */
export const XhBreadcrumbEllipsisTrigger = defineComponent({
  name: 'XhBreadcrumbEllipsisTrigger',
  setup(_, { slots }) {
    const ctx = useBreadcrumbContext()
    return () => h('button', ctx.api.value.getEllipsisTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 标准结构里各部件对应的组件。 */
const BREADCRUMB_PARTS = {
  'list': XhBreadcrumbList,
  'item': XhBreadcrumbItem,
  'link': XhBreadcrumbLink,
  'link-icon': XhBreadcrumbLinkIcon,
  'separator': XhBreadcrumbSeparator,
  'ellipsis': XhBreadcrumbEllipsis,
  'ellipsis-trigger': XhBreadcrumbEllipsisTrigger,
}

/**
 * 未写默认插槽时照 breadcrumbStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 分隔符的内容给了 separator 插槽就由它提供，否则交给皮肤；折叠位按钮的内容给了 ellipsis 插槽就由它提供。
 */
function renderDefaultStructure(
  api: BreadcrumbApi,
  separator: (() => VNode[]) | undefined,
  ellipsis: ((nodes: readonly BreadcrumbNodeMeta[]) => VNode[]) | undefined,
): VNode[] {
  const nodes = breadcrumbStructure(api, { slotted: name => (name === 'separator' ? separator : name === 'ellipsis' ? ellipsis : undefined) != null })
  return renderStructure(nodes, BREADCRUMB_PARTS, (node: StructureNode) => {
    if (node.slot?.name === 'separator')
      return separator?.()
    if (node.slot?.name === 'ellipsis')
      return ellipsis?.(node.data as readonly BreadcrumbNodeMeta[])
    return undefined
  })
}
