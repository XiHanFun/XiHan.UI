/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 navigation menu 相关实现。

import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { NavigationMenuApi, NavigationMenuNode, NavigationMenuNodeMeta, NavigationMenuSchema, NavigationMenuTranslations, StructureNode } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import { navigationMenuStructure } from '@xihan-ui/headless'
import { useEffect, useId, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { NavigationMenuProvider, useNavigationMenuContext } from './context'
import { useNavigationMenu } from './use-navigation-menu'

type NavigationMenuProps = NavigationMenuSchema['props']

/** 根上自有的取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'nav'>, 'children' | 'defaultValue' | 'dir'>

export interface XhNavigationMenuRootProps extends RootElementProps {
  collection?: NavigationMenuNode[]
  value?: string | null
  defaultValue?: string | null
  orientation?: Orientation
  delayDuration?: number
  skipDelayDuration?: number
  dir?: Direction
  loop?: boolean
  disabled?: boolean
  translations?: Partial<NavigationMenuTranslations>
  tone?: Tone
  size?: Size
  onValueChange?: NavigationMenuProps['onValueChange']
  /** 每张面板的内容；只提供 collection 时由它承载。 */
  renderPanel?: (node: NavigationMenuNodeMeta) => ReactNode
  children?: ReactNode
}

/** 根节点渲染为 nav，收起的三条出口（指针离开、焦点离场、Escape）在这一层处理。 */
export function XhNavigationMenuRoot({
  collection,
  value,
  defaultValue,
  orientation,
  delayDuration,
  skipDelayDuration,
  dir,
  loop,
  disabled,
  translations,
  tone,
  size,
  onValueChange,
  children,
  renderPanel,
  ...rest
}: XhNavigationMenuRootProps): ReactNode {
  const machineProps = {
    collection,
    value,
    defaultValue,
    orientation,
    delayDuration,
    skipDelayDuration,
    dir,
    loop,
    disabled,
    translations,
    tone,
    size,
    onValueChange,
  }
  const ctx = useNavigationMenu(withXhConfig('navigation-menu', machineProps) as NavigationMenuProps)
  // 根上的指针离开不冒泡，改装成原生监听器；onFocusout 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(
    ctx.api.getRootProps(),
    ['onPointerLeave'],
  )
  // children 里有真会画出东西的节点就照旧交给作者；只剩空白时当没写，照标准结构铺开
  const body = slotPaints(children)
    ? children
    : renderDefaultStructure(ctx.api, renderPanel)
  return (
    <NavigationMenuProvider value={ctx}>
      <nav
        {...mergeReactProps(
          bind.attrs,
          rest,
          { ref: bind.ref },
          { ref: (el: HTMLElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </nav>
    </NavigationMenuProvider>
  )
}

XhNavigationMenuRoot.xhEvents = ['value-change'] as const

export interface XhNavigationMenuListProps extends ComponentPropsWithRef<'ul'> {}
// 用 ul 而非 div：站点导航是一组并列的去处，读屏会念「列表，共 n 项」。
export function XhNavigationMenuList({ children, ...rest }: XhNavigationMenuListProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return (
    <ul
      {...mergeReactProps(
        ctx.api.getListProps(),
        rest,
        { ref: (el: HTMLUListElement | null) => { ctx.listRef.current = el } },
      )}
    >
      {children}
    </ul>
  )
}

export interface XhNavigationMenuItemProps extends ComponentPropsWithRef<'li'> {}
/** 一项渲染为一个 li；面板 content 写在同一个 li 内、紧跟 trigger 之后。 */
export function XhNavigationMenuItem({ children, ...rest }: XhNavigationMenuItemProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return <li {...mergeReactProps(ctx.api.getItemProps(), rest)}>{children}</li>
}

export interface XhNavigationMenuTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  value: string
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
export function XhNavigationMenuTrigger({ value, disabled, children, ...rest }: XhNavigationMenuTriggerProps): ReactNode {
  const ctx = useNavigationMenuContext()
  // 入口的聚焦上报与指针进入都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getTriggerProps({ value, disabled }),
    ['onFocus', 'onPointerEnter'],
  )
  return (
    <button
      {...mergeReactProps(
        bind.attrs,
        rest,
        { ref: bind.ref },
      )}
    >
      {children}
    </button>
  )
}

export interface XhNavigationMenuTriggerIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  value: string
  disabled?: boolean
}
/** 入口中表示下方还有面板的标记，展开时转向；身份与所在 trigger 同一份声明。 */
export function XhNavigationMenuTriggerIndicator({ value, disabled, children, ...rest }: XhNavigationMenuTriggerIndicatorProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return (
    <span {...mergeReactProps(ctx.api.getTriggerIndicatorProps({ value, disabled }), rest)}>
      {children}
    </span>
  )
}

export interface XhNavigationMenuContentProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
// 面板常挂，靠 hidden 显隐，不做懒挂载
export function XhNavigationMenuContent({ value, children, ...rest }: XhNavigationMenuContentProps): ReactNode {
  const ctx = useNavigationMenuContext()
  // 一个面板一份退场闸门：它们各开各的、动画各跑各的，一份管不过来。
  // 开合判据直接取 connect 这一帧的产出，不另起一套——两边各判一次迟早会说岔
  const contentRef = useRef<HTMLElement | null>(null)
  const presenceRef = useRef<PresenceHandle | null>(null)
  const visible = useOverlayExit({
    config: ctx.config,
    isOpen: () => ctx.api.isOpen(value),
    contentRef,
    onPresence: (next) => {
      const previous = presenceRef.current
      presenceRef.current = next
      if (ctx.service.getStatus() !== 'Started')
        return
      if (next) {
        ctx.service.send({ type: 'PRESENCE.SET', value, presence: next, connected: true })
      }
      else if (previous) {
        ctx.service.send({ type: 'PRESENCE.SET', value, presence: previous, connected: false })
      }
    },
  })
  // 子级 layout effect 可能早于根机器启动；被动阶段补报一次，确保首帧 Presence 已入 Headless 表。
  useEffect(() => {
    const presence = presenceRef.current
    if (!presence || ctx.service.getStatus() !== 'Started')
      return
    ctx.service.send({ type: 'PRESENCE.SET', value, presence, connected: true })
    return () => {
      if (ctx.service.getStatus() === 'Started')
        ctx.service.send({ type: 'PRESENCE.SET', value, presence, connected: false })
    }
  }, [ctx.service, value])
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps({ value }),
        rest,
        {
          // 收起跟着闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场就一帧都
          // 播不出来），所以真正的收起落成内联 display
          style: visible ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhNavigationMenuBranchTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  value: string
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
/** 面板里一枝子级的开关：展开时紧跟其后的 XhNavigationMenuBranchContent 露出来。 */
export function XhNavigationMenuBranchTrigger({ value, disabled, children, ...rest }: XhNavigationMenuBranchTriggerProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return (
    <button {...mergeReactProps(ctx.api.getBranchTriggerProps({ value, disabled }), rest)}>
      {children}
    </button>
  )
}

export interface XhNavigationMenuBranchIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  value: string
}
/** 子级开关里的展开方向标记，展开时转向；身份与所在的开关同一份声明。 */
export function XhNavigationMenuBranchIndicator({ value, children, ...rest }: XhNavigationMenuBranchIndicatorProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return (
    <span {...mergeReactProps(ctx.api.getBranchIndicatorProps({ value }), rest)}>
      {children}
    </span>
  )
}

export interface XhNavigationMenuBranchContentProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
/** 一枝子级的容器，写在面板里、紧跟自己的开关之后；收着时 hidden。 */
export function XhNavigationMenuBranchContent({ value, children, ...rest }: XhNavigationMenuBranchContentProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return (
    <div {...mergeReactProps(ctx.api.getBranchContentProps({ value }), rest)}>
      {children}
    </div>
  )
}

export interface XhNavigationMenuLinkProps extends ComponentPropsWithRef<'a'>, AsChildProps {
  current?: boolean
}
/**
 * 面板内的链接项：href 由作者写，点击不拦截，只收起导航。
 * asChild 借用作者的子节点（如路由链接）作为链接，不再渲染自己的 `<a>`。
 */
export function XhNavigationMenuLink({ current, asChild, children, ...rest }: XhNavigationMenuLinkProps): ReactNode {
  const ctx = useNavigationMenuContext()
  // 链接身份：按压通道按它记按住的那一条，按实例生成，作者不必提供
  const value = useId()
  const props = mergePartProps(ctx.api.getLinkProps({ value, current }), rest)
  return renderAsChild(asChild, children, props, 'navigation-menu', (p, kids) => <a {...p}>{kids}</a>, { applyAnatomy: true })
}

export interface XhNavigationMenuIndicatorProps extends ComponentPropsWithRef<'li'> {}
/** 指示条容器，位置由状态机计算后写入内联样式；渲染为 li 以 list 为定位参照系。 */
export function XhNavigationMenuIndicator({ ...rest }: XhNavigationMenuIndicatorProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return <li {...mergeReactProps(ctx.api.getIndicatorProps(), rest)} />
}

export interface XhNavigationMenuViewportProps extends ComponentPropsWithRef<'div'> {}
/** 可选的共享面板外壳，放在 root 内、list 之后。 */
export function XhNavigationMenuViewport({ children, ...rest }: XhNavigationMenuViewportProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return <div {...mergeReactProps(ctx.api.getViewportProps(), rest)}>{children}</div>
}

/** 按数据铺的链接：结构节点上的 current 是作者声明（在场即是），交给链接时换成布尔。 */
function NavigationMenuStructureLink({ current, ...rest }: Omit<XhNavigationMenuLinkProps, 'current'> & { current?: string }): ReactNode {
  return <XhNavigationMenuLink {...rest} current={current != null} />
}

/** 标准结构里各部件对应的组件。 */
const NAVIGATION_MENU_PARTS = {
  'list': XhNavigationMenuList,
  'item': XhNavigationMenuItem,
  'trigger': XhNavigationMenuTrigger,
  'content': XhNavigationMenuContent,
  'branch-trigger': XhNavigationMenuBranchTrigger,
  'branch-indicator': XhNavigationMenuBranchIndicator,
  'branch-content': XhNavigationMenuBranchContent,
  'link': NavigationMenuStructureLink,
  'indicator': XhNavigationMenuIndicator,
}

/**
 * 未写 children 时照 navigationMenuStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 面板内容给了 renderPanel 就由它提供，否则按这一项的 children 铺链接与子级。
 */
function renderDefaultStructure(api: NavigationMenuApi, renderPanel: ((node: NavigationMenuNodeMeta) => ReactNode) | undefined): ReactNode[] {
  const nodes = navigationMenuStructure(api, { slotted: name => name === 'panel' && renderPanel != null })
  return renderStructure(nodes, NAVIGATION_MENU_PARTS, (node: StructureNode) => {
    const meta = node.data as NavigationMenuNodeMeta | undefined
    return node.slot?.name === 'panel' && meta ? renderPanel?.(meta) : undefined
  })
}
