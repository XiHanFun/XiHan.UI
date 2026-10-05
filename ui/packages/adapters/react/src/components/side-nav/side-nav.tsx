/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 side nav 相关实现。

import type { Direction, Service, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { SideNavApi, SideNavFilter, SideNavNode, SideNavSchema, SideNavTranslations, TooltipSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { connectSideNav, findSideNavRowEl, sideNavTooltipProps, tooltipMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { reactNormalize } from '../../runtime/normalize-props'
import { XhPortal } from '../../runtime/portal'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { renderSlot } from '../../runtime/slot-content'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { TooltipGroupContext } from '../tooltip/context'
import { SideNavGroupProvider, SideNavItemProvider, SideNavNodeProvider, SideNavProvider, useSideNavContext, useSideNavGroupContext, useSideNavItemContext, useSideNavNodeContext } from './context'
import { useSideNav } from './use-side-nav'

type SideNavProps = SideNavSchema['props']

/** 函数式 children 的载荷：选中项、展开集合、折叠与浮层状态、检索词与搜索状态、逐节点的状态判定，以及选中、展开、折叠、弹出、改写检索词等命令。 */
export type SideNavRootSlotProps = Pick<
  SideNavApi,
  | 'value'
  | 'expandedValue'
  | 'collapsed'
  | 'popoutValue'
  | 'isSelected'
  | 'isExpanded'
  | 'isActiveBranch'
  | 'select'
  | 'setValue'
  | 'setExpandedValue'
  | 'expand'
  | 'collapse'
  | 'openPopout'
  | 'closePopout'
  | 'inputValue'
  | 'setInputValue'
  | 'searching'
>

/** 根上自有的取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'nav'>, 'children' | 'defaultValue' | 'dir'>

export interface XhSideNavRootProps extends RootElementProps {
  collection?: SideNavNode[]
  value?: string | null
  defaultValue?: string | null
  expandedValue?: string[]
  defaultExpandedValue?: string[]
  accordion?: boolean
  collapsed?: boolean
  collapsedPopout?: boolean
  disabled?: boolean
  loop?: boolean
  dir?: Direction
  tone?: Tone
  size?: Size
  /** 搜索框的匹配规则；缺省为标签（缺省退回 value）大小写不敏感包含。 */
  filter?: SideNavFilter
  translations?: Partial<SideNavTranslations>
  onValueChange?: SideNavProps['onValueChange']
  onExpandedValueChange?: SideNavProps['onExpandedValueChange']
  children?: SlotChildren<SideNavRootSlotProps>
}

export function XhSideNavRoot({
  collection,
  value,
  defaultValue,
  expandedValue,
  defaultExpandedValue,
  accordion,
  collapsed,
  collapsedPopout,
  disabled,
  loop,
  dir,
  tone,
  size,
  filter,
  translations,
  onValueChange,
  onExpandedValueChange,
  children,
  ...rest
}: XhSideNavRootProps): ReactNode {
  const ctx = useSideNav(withXhConfig('side-nav', {
    collection,
    value,
    defaultValue,
    expandedValue,
    defaultExpandedValue,
    accordion,
    collapsed,
    collapsedPopout,
    disabled,
    loop,
    dir,
    tone,
    size,
    filter,
    translations,
    onValueChange,
    onExpandedValueChange,
  }) as SideNavProps)
  const api = ctx.api
  // 经 children 载荷交出状态与命令，供折叠开关这类外部控件使用
  return (
    <SideNavProvider value={ctx}>
      <nav {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          value: api.value,
          expandedValue: api.expandedValue,
          collapsed: api.collapsed,
          popoutValue: api.popoutValue,
          isSelected: api.isSelected,
          isExpanded: api.isExpanded,
          isActiveBranch: api.isActiveBranch,
          select: api.select,
          setValue: api.setValue,
          setExpandedValue: api.setExpandedValue,
          expand: api.expand,
          collapse: api.collapse,
          openPopout: api.openPopout,
          closePopout: api.closePopout,
          inputValue: api.inputValue,
          setInputValue: api.setInputValue,
          searching: api.searching,
        })}
      </nav>
    </SideNavProvider>
  )
}

XhSideNavRoot.xhEvents = ['value-change', 'expanded-value-change'] as const

export interface XhSideNavListProps extends ComponentPropsWithRef<'ul'> {}
export function XhSideNavList({ children, ...rest }: XhSideNavListProps): ReactNode {
  const ctx = useSideNavContext()
  return <ul {...mergeReactProps(ctx.api.getListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</ul>
}

export interface XhSideNavInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'children'> {}
/** 搜索框：放在 list 之前，输入即按标签过滤导航树。 */
export function XhSideNavInput(rest: XhSideNavInputProps): ReactNode {
  const ctx = useSideNavContext()
  return <input {...mergeReactProps(ctx.api.getInputProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhSideNavEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 搜索一条都没命中时露面的占位；没写内容时显示 translations.noMatch。 */
export function XhSideNavEmpty({ children, ...rest }: XhSideNavEmptyProps): ReactNode {
  const ctx = useSideNavContext()
  return (
    <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.translations.noMatch}
    </div>
  )
}

/** 把一个值登记进所在分组，值变了换一条，卸下时撤销。 */
function useJoinGroup(value: string): void {
  const join = useSideNavGroupContext()?.join
  useIsomorphicLayoutEffect(() => join?.(value), [join, value])
}

export interface XhSideNavItemProps extends ComponentPropsWithRef<'li'> {}
// 叶子行的列表项：列表容器是 ul，链接得裹在 li 里才是它合法的直接子节点。
// 身份取它包着的那条链接报上来的值：搜索时没命中就整行收起
export function XhSideNavItem({ children, ...rest }: XhSideNavItemProps): ReactNode {
  const ctx = useSideNavContext()
  const [linkValue, setLinkValue] = useState<string | null>(null)
  return (
    <SideNavItemProvider value={setLinkValue}>
      <li {...mergeReactProps(ctx.api.getItemProps({ value: linkValue ?? undefined }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
    </SideNavItemProvider>
  )
}

export interface XhSideNavGroupProps extends Omit<ComponentPropsWithRef<'li'>, 'value'> {
  /** 分组身份，group-label 与 group-list 依靠它配对。 */
  value: string
}
// 分组是上一层列表里的一条（li）：里面放 group-label 与 group-list，组内的行挂在 group-list 里
export function XhSideNavGroup({ value, children, ...rest }: XhSideNavGroupProps): ReactNode {
  const ctx = useSideNavContext()
  // 成员由组里的链接与分支挂上时登记：搜索时一个成员都没命中就整组收起
  const [members, setMembers] = useState<readonly string[]>([])
  const join = useCallback((member: string) => {
    setMembers(current => [...current, member])
    return () => setMembers((current) => {
      const at = current.indexOf(member)
      return at === -1 ? current : current.filter((_, i) => i !== at)
    })
  }, [])
  const group = useMemo(() => ({ value, join }), [value, join])
  return (
    <SideNavGroupProvider value={group}>
      <li {...mergeReactProps(ctx.api.getGroupProps({ value, members }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
    </SideNavGroupProvider>
  )
}

export interface XhSideNavGroupLabelProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhSideNavGroupLabel({ value, children, ...rest }: XhSideNavGroupLabelProps): ReactNode {
  const ctx = useSideNavContext()
  return <div {...mergeReactProps(ctx.api.getGroupLabelProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhSideNavGroupListProps extends ComponentPropsWithRef<'ul'> {}
/** 分组里的列表：组内的 item 与 branch 挂在这里，以组标题命名；分组身份取自所在的 XhSideNavGroup。 */
export function XhSideNavGroupList({ children, ...rest }: XhSideNavGroupListProps): ReactNode {
  const ctx = useSideNavContext()
  const group = useSideNavGroupContext()
  if (!group)
    throw new Error('XhSideNavGroupList 要放在 XhSideNavGroup 里')
  return <ul {...mergeReactProps(ctx.api.getGroupListProps({ value: group.value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</ul>
}

export interface XhSideNavBranchProps extends Omit<ComponentPropsWithRef<'li'>, 'value'> {
  value: string
}
export function XhSideNavBranch({ value, children, ...rest }: XhSideNavBranchProps): ReactNode {
  const ctx = useSideNavContext()
  const node = useMemo(() => ({ value }), [value])
  useJoinGroup(value)
  return (
    <SideNavNodeProvider value={node}>
      <li {...mergeReactProps(ctx.api.getBranchProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
    </SideNavNodeProvider>
  )
}

export interface XhSideNavBranchTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhSideNavBranchTrigger({ children, ...rest }: XhSideNavBranchTriggerProps): ReactNode {
  const ctx = useSideNavContext()
  const node = useSideNavNodeContext()
  // 分支入口的聚焦上报与指针进出都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getBranchTriggerProps({ value: node.value }) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter', 'onPointerLeave'],
  )
  return (
    <button {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>{children}</button>
  )
}

export interface XhSideNavBranchTextProps extends ComponentPropsWithRef<'span'> {}
export function XhSideNavBranchText({ children, ...rest }: XhSideNavBranchTextProps): ReactNode {
  const ctx = useSideNavContext()
  return <span {...mergeReactProps(ctx.api.getBranchTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSideNavBranchIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhSideNavBranchIndicator({ children, ...rest }: XhSideNavBranchIndicatorProps): ReactNode {
  const ctx = useSideNavContext()
  const node = useSideNavNodeContext()
  return (
    <span {...mergeReactProps(ctx.api.getBranchIndicatorProps({ value: node.value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhSideNavBranchContentProps extends ComponentPropsWithRef<'ul'> {
  /** 本分支弹层的 Portal 容器；优先于应用级配置。 */
  container?: () => Element | null
}
export function XhSideNavBranchContent({ children, container, ...rest }: XhSideNavBranchContentProps): ReactNode {
  const ctx = useSideNavContext()
  const node = useSideNavNodeContext()
  const value = node.value
  // 一个弹出面板一份退场闸门：退场动画挂在面板上，从它身上探测。
  // 开合判据直接取 connect 这一帧的产出，不另起一套
  const panelRef = useRef<HTMLElement | null>(null)
  const presenceRef = useRef<PresenceHandle | null>(null)
  const visible = useOverlayExit({
    config: ctx.config,
    isOpen: () => (ctx.api.getPopoutPositionerProps({ value }) as Record<string, unknown>).hidden !== true,
    contentRef: panelRef,
    onPresence: (next) => {
      const previous = presenceRef.current
      presenceRef.current = next
      if (ctx.service.getStatus() !== 'Started')
        return
      if (next)
        ctx.service.send({ type: 'PRESENCE.SET', value, presence: next, connected: true })
      else if (previous)
        ctx.service.send({ type: 'PRESENCE.SET', value, presence: previous, connected: false })
    },
  })
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

  const contentProps = ctx.api.getBranchContentProps({ value }) as Record<string, unknown>
  if (!ctx.api.isPopoutPanel(value)) {
    // 平铺分支没有定位层，原地渲染
    return <ul {...mergeReactProps(contentProps, rest as Record<string, unknown>)}>{children}</ul>
  }

  // 折叠态的弹出面板：定位层搬到浮层落点，逃开祖先的层叠上下文。
  // 收起跟着退场闸门走：定位层与面板的 hidden 都押后到退场动画播完
  const hidden = !visible || undefined
  // 关着的弹出面板不建视觉桥：折叠态下每个分支各有一个定位层
  return (
    <XhPortal container={container ?? ctx.portalContainer} present={visible}>
      <div {...ctx.api.getPopoutPositionerProps({ value }) as Record<string, unknown>} hidden={hidden}>
        <ul
          {...mergeReactProps(
            contentProps,
            rest as Record<string, unknown>,
            { hidden, ref: (el: HTMLUListElement | null) => { panelRef.current = el } },
          )}
        >
          {children}
        </ul>
      </div>
    </XhPortal>
  )
}

export interface XhSideNavTooltipProps {
  /** 名称提示的 Portal 容器；优先于应用级配置。 */
  container?: () => Element | null
}
/**
 * 图标栏的名称提示：落成图标栏后，只剩图标的行悬停或聚焦时在行尾一侧显示行的标签。
 * 本体是一台内嵌的 Tooltip 机器（延时、接替窗口、提示组与定位全随 Tooltip），开合受控于侧栏；
 * 放一个即可，定位层搬到浮层落点，文字取 collection 里的标签，对读屏隐藏。
 */
export function XhSideNavTooltip({ container }: XhSideNavTooltipProps): ReactNode {
  const ctx = useSideNavContext()
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<TooltipSchema> | null>(null)
  // 放在 XhTooltipProvider 里就归它那一组，与页面上其余提示共用接替窗口
  const group = useContext(TooltipGroupContext)
  // 锚点是提示此刻对着的那一行，现查
  const nav = ctx.service
  const anchor = useCallback(() => findSideNavRowEl(nav, nav.context.get('tooltipValue')), [nav])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen: false,
    isOpen: () => serviceRef.current?.state.matches('visible') ?? false,
    // 提示只参与 Escape 仲裁与栈顶判定：不陷焦点、不锁滚动、没有遮罩；对着的那一行记为本层分支
    layer: () => ({ kind: 'inline', branches: () => [anchor()].filter(Boolean) as Element[], isModal: () => false }),
    node: () => contentRef.current,
    refs: (service) => {
      service.refs.set('position', createPositionEngine() as never)
      service.refs.set('getAnchorEl', anchor as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('group', group as never)
    },
  })
  const hint = useMachine<TooltipSchema>(tooltipMachine, () => sideNavTooltipProps(nav), {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = hint

  // 交给根：行上的指针与焦点经根的连接层转给这台机器
  const { setTooltip } = ctx
  useIsomorphicLayoutEffect(() => {
    setTooltip(hint)
    return () => setTooltip(null)
  }, [setTooltip, hint])

  const api = connectSideNav(nav, reactNormalize, hint)
  // 指针进出装成原生监听器：移入提示要能撤销收起等待
  const bind = useNativeEvents(api.getTooltipContentProps() as Record<string, unknown>)
  return (
    <XhPortal container={container ?? ctx.portalContainer} present={overlay.rendered}>
      <div
        {...mergeReactProps(
          api.getTooltipPositionerProps() as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { positionerRef.current = el } },
        )}
      >
        <div
          {...mergeReactProps(
            bind.attrs,
            { ref: bind.ref },
            {
              // 收起跟着退场闸门走：皮肤给 content 声明了 display，真正的收起落成内联 display
              style: overlay.rendered ? undefined : { display: 'none' },
              ref: (el: HTMLDivElement | null) => { contentRef.current = el },
            },
          )}
        >
          {api.tooltipText}
        </div>
      </div>
    </XhPortal>
  )
}

export interface XhSideNavLinkTextProps extends ComponentPropsWithRef<'span'> {}
export function XhSideNavLinkText({ children, ...rest }: XhSideNavLinkTextProps): ReactNode {
  const ctx = useSideNavContext()
  return <span {...mergeReactProps(ctx.api.getLinkTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSideNavLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'value'>, AsChildProps {
  value: string
}
/** 导航链接。asChild 借用作者的子节点（如路由链接）作为链接，不再渲染自己的 `<a>`。 */
export function XhSideNavLink({ value, asChild, children, ...rest }: XhSideNavLinkProps): ReactNode {
  const ctx = useSideNavContext()
  // 身份报给外面的列表项与分组：搜索时它们据此决定整行、整组收不收
  const reportItem = useSideNavItemContext()
  useIsomorphicLayoutEffect(() => {
    if (!reportItem)
      return
    reportItem(value)
    return () => reportItem(null)
  }, [reportItem, value])
  useJoinGroup(value)
  // 链接的聚焦上报与指针进出（图标栏的名称提示）都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getLinkProps({ value }) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter', 'onPointerLeave'],
  )
  const props = mergePartProps(mergeReactProps(bind.attrs, { ref: bind.ref }), rest as Record<string, unknown>)
  return renderAsChild(asChild, children, props, 'side-nav', (p, kids) => <a {...p}>{kids}</a>, { applyAnatomy: true })
}
