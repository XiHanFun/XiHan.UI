/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 layout 相关实现。

import type { LayoutBreakpoint, LayoutSchema, LayoutSiderPlacement, LayoutSiderPresentation } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { LayoutProvider, useLayoutContext } from './context'
import { useLayout } from './use-layout'

type LayoutProps = LayoutSchema['props']

export interface XhLayoutRootProps extends ComponentPropsWithRef<'div'> {
  /** 受控折叠态：提供值后由宿主决定。 */
  siderCollapsed?: boolean
  /** 非受控初始折叠态。 */
  defaultSiderCollapsed?: boolean
  /** 展开时侧栏的宽度，任意 CSS 长度。 */
  siderWidth?: string
  /** 折叠时侧栏的宽度，任意 CSS 长度。 */
  siderCollapsedWidth?: string
  /** 侧栏挂在行首还是行尾，默认 start。 */
  siderPlacement?: LayoutSiderPlacement
  /** 侧栏的自适应断点：视口窄于该档时侧栏按折叠宽度显示。 */
  siderBreakpoint?: LayoutBreakpoint
  /** 侧栏呈现形态，默认 inline；sheet 是覆盖档。 */
  siderPresentation?: LayoutSiderPresentation
  /** 头部吸顶：只写标记，固定的实现归皮肤。 */
  headerFixed?: boolean
  /** 侧栏吸附：只写标记，固定的实现归皮肤。 */
  siderFixed?: boolean
  /** 在头部、侧栏、脚部与内容之间绘制分隔线。 */
  bordered?: boolean
  onSiderCollapsedChange?: LayoutProps['onSiderCollapsedChange']
  onSiderBreakpoint?: LayoutProps['onSiderBreakpoint']
}

/** 各段一律渲染为 div：地标（banner / navigation / main / contentinfo）由作者自行标注。 */
export function XhLayoutRoot({ children, ...props }: XhLayoutRootProps): ReactNode {
  const ctx = useLayout(props as LayoutProps)
  return (
    <LayoutProvider value={ctx}>
      <div {...ctx.api.getRootProps() as Record<string, unknown>}>{children}</div>
    </LayoutProvider>
  )
}

XhLayoutRoot.xhEvents = ['sider-collapsed-change', 'sider-breakpoint'] as const

export interface XhLayoutHeaderProps extends ComponentPropsWithRef<'div'> {}

export function XhLayoutHeader({ children, ...rest }: XhLayoutHeaderProps): ReactNode {
  const ctx = useLayoutContext()
  return (
    <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhLayoutSiderBackdropProps extends ComponentPropsWithRef<'div'> {}

/** 覆盖档铺在内容之上的遮罩：点击它收起侧栏。写在 XhLayoutSider 之前，两层同一个层号。 */
export function XhLayoutSiderBackdrop({ children, ...rest }: XhLayoutSiderBackdropProps): ReactNode {
  const ctx = useLayoutContext()
  return (
    <div {...mergeReactProps(ctx.api.getSiderBackdropProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhLayoutSiderProps extends ComponentPropsWithRef<'div'> {}

export function XhLayoutSider({ children, ...rest }: XhLayoutSiderProps): ReactNode {
  const ctx = useLayoutContext()
  return (
    <div {...mergeReactProps(ctx.api.getSiderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhLayoutContentProps extends ComponentPropsWithRef<'div'> {}

export function XhLayoutContent({ children, ...rest }: XhLayoutContentProps): ReactNode {
  const ctx = useLayoutContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhLayoutFooterProps extends ComponentPropsWithRef<'div'> {}

export function XhLayoutFooter({ children, ...rest }: XhLayoutFooterProps): ReactNode {
  const ctx = useLayoutContext()
  return (
    <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhLayoutSiderTriggerProps extends ComponentPropsWithRef<'button'> {}

/** 折叠把手渲染为原生 button：Enter / Space 的激活交给平台。 */
export function XhLayoutSiderTrigger({ children, ...rest }: XhLayoutSiderTriggerProps): ReactNode {
  const ctx = useLayoutContext()
  return (
    <button {...mergeReactProps(ctx.api.getSiderTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}
