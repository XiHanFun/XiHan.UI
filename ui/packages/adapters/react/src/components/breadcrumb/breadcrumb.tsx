/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 breadcrumb 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { BreadcrumbApi, BreadcrumbNode, BreadcrumbNodeMeta, BreadcrumbProps, BreadcrumbTranslations, StructureNode } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import { breadcrumbStructure } from '@xihan-ui/headless'
import { useId } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { renderStructure } from '../../runtime/structure'
import { BreadcrumbProvider, useBreadcrumbContext } from './context'
import { useBreadcrumb } from './use-breadcrumb'

export interface XhBreadcrumbRootProps extends Omit<ComponentPropsWithRef<'nav'>, 'dir'> {
  collection?: readonly BreadcrumbNode[]
  /** 最多展开几层，超出的中间层折叠为一个省略位。 */
  maxItems?: number
  dir?: Direction
  translations?: Partial<BreadcrumbTranslations>
  tone?: Tone
  size?: Size
  /** 分隔符的内容；未提供时由皮肤绘制默认箭头。 */
  renderSeparator?: () => ReactNode
  /** 省略位的内容，可得到被折叠的层；未提供时为一个省略号。 */
  renderEllipsis?: (nodes: readonly BreadcrumbNodeMeta[]) => ReactNode
}

/** 根节点渲染为 nav 地标。 */
export function XhBreadcrumbRoot({
  collection,
  maxItems,
  dir,
  translations,
  tone,
  size,
  renderSeparator,
  renderEllipsis,
  children,
  ...rest
}: XhBreadcrumbRootProps): ReactNode {
  const ctx = useBreadcrumb(
    withXhConfig('breadcrumb', { collection, maxItems, dir, translations, tone, size }) as BreadcrumbProps,
  )
  const body = children ?? renderDefaultStructure(ctx.api, renderSeparator, renderEllipsis)
  return (
    <BreadcrumbProvider value={ctx}>
      <nav {...mergeReactProps(ctx.api.getRootProps(), rest)}>
        {body}
      </nav>
    </BreadcrumbProvider>
  )
}

export interface XhBreadcrumbListProps extends ComponentPropsWithRef<'ol'> {}
/** 渲染为 ol，把层级路径表达为有序列表。 */
export function XhBreadcrumbList({ children, ...rest }: XhBreadcrumbListProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <ol {...mergeReactProps(ctx.api.getListProps(), rest)}>{children}</ol>
}

export interface XhBreadcrumbItemProps extends ComponentPropsWithRef<'li'> {}
export function XhBreadcrumbItem({ children, ...rest }: XhBreadcrumbItemProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <li {...mergeReactProps(ctx.api.getItemProps(), rest)}>{children}</li>
}

export interface XhBreadcrumbLinkProps extends ComponentPropsWithRef<'a'>, AsChildProps {
  /** 链接身份，按压通道按它记住正被按住的那一条；未声明时派生一个实例内稳定的键。 */
  value?: string
  /** 当前页的条目。 */
  current?: boolean
}
/**
 * href 由作者写，这里只补当前页标记与点击守卫；当前页同样渲染为 `<a>`。
 * asChild 借用作者的子节点（如路由链接）作为链接，不再渲染自己的 `<a>`。
 */
export function XhBreadcrumbLink({ value, current, asChild, children, ...rest }: XhBreadcrumbLinkProps): ReactNode {
  const ctx = useBreadcrumbContext()
  const fallbackValue = useId()
  const props = mergePartProps(
    ctx.api.getLinkProps({ value: value ?? fallbackValue, current }),
    rest,
  )
  return renderAsChild(asChild, children, props, 'breadcrumb', (p, kids) => <a {...p}>{kids}</a>, { applyAnatomy: true })
}

export interface XhBreadcrumbLinkIconProps extends ComponentPropsWithRef<'span'> {}
/** 链接中的图标位，与文字并排；纯装饰。 */
export function XhBreadcrumbLinkIcon({ children, ...rest }: XhBreadcrumbLinkIconProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <span {...mergeReactProps(ctx.api.getLinkIconProps(), rest)}>{children}</span>
}

export interface XhBreadcrumbSeparatorProps extends ComponentPropsWithRef<'li'> {}
/** 分隔符是 ol 的直接子节点，渲染为 li 并对读屏隐藏。 */
export function XhBreadcrumbSeparator({ children, ...rest }: XhBreadcrumbSeparatorProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <li {...mergeReactProps(ctx.api.getSeparatorProps(), rest)}>{children}</li>
}

export interface XhBreadcrumbEllipsisProps extends ComponentPropsWithRef<'li'> {}
/** 折叠位：路径里的一个列表项，装着展开完整路径的触发器；展开后收起。 */
export function XhBreadcrumbEllipsis({ children, ...rest }: XhBreadcrumbEllipsisProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <li {...mergeReactProps(ctx.api.getEllipsisProps(), rest)}>{children}</li>
}

export interface XhBreadcrumbEllipsisTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 折叠位里的触发器：按下展开完整路径，焦点落到第一条展开出来的链接上；不写内容时由皮肤画一枚省略号字形。 */
export function XhBreadcrumbEllipsisTrigger({ children, ...rest }: XhBreadcrumbEllipsisTriggerProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return (
    <button {...mergePartProps(ctx.api.getEllipsisTriggerProps(), rest)}>
      {children}
    </button>
  )
}

/** 按数据铺的链接：结构节点上的 current 是作者声明（在场即是），交给链接时换成布尔。 */
function BreadcrumbStructureLink({ current, ...rest }: Omit<XhBreadcrumbLinkProps, 'current'> & { current?: string }): ReactNode {
  return <XhBreadcrumbLink {...rest} current={current != null} />
}

/** 标准结构里各部件对应的组件。 */
const BREADCRUMB_PARTS = {
  'list': XhBreadcrumbList,
  'item': XhBreadcrumbItem,
  'link': BreadcrumbStructureLink,
  'link-icon': XhBreadcrumbLinkIcon,
  'separator': XhBreadcrumbSeparator,
  'ellipsis': XhBreadcrumbEllipsis,
  'ellipsis-trigger': XhBreadcrumbEllipsisTrigger,
}

/**
 * 未写 children 时照 breadcrumbStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 分隔符的内容给了 renderSeparator 就由它提供，否则交给皮肤；折叠位按钮的内容给了 renderEllipsis 就由它提供。
 */
function renderDefaultStructure(
  api: BreadcrumbApi,
  renderSeparator: (() => ReactNode) | undefined,
  renderEllipsis: ((nodes: readonly BreadcrumbNodeMeta[]) => ReactNode) | undefined,
): ReactNode[] {
  const nodes = breadcrumbStructure(api, { slotted: name => (name === 'separator' ? renderSeparator : name === 'ellipsis' ? renderEllipsis : undefined) != null })
  return renderStructure(nodes, BREADCRUMB_PARTS, (node: StructureNode) => {
    if (node.slot?.name === 'separator')
      return renderSeparator?.()
    if (node.slot?.name === 'ellipsis')
      return renderEllipsis?.(node.data as readonly BreadcrumbNodeMeta[])
    return undefined
  })
}
