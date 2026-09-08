import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { SideNavApi, SideNavNode, SideNavSchema, SideNavTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { SideNavNodeProvider, SideNavProvider, useSideNavContext, useSideNavNodeContext } from './context'
import { useSideNav } from './use-side-nav'

type SideNavProps = SideNavSchema['props']

/** 函数式 children 的载荷：选中项、展开集合、折叠与浮层状态、逐节点的状态判定，与选中、展开、折叠、弹出等命令。 */
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
>

/** 根上自有的那些取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
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

export interface XhSideNavItemProps extends ComponentPropsWithRef<'li'> {}
// 叶子行的列表项：列表容器是 ul，链接得裹在 li 里才是它合法的直接子节点
export function XhSideNavItem({ children, ...rest }: XhSideNavItemProps): ReactNode {
  const ctx = useSideNavContext()
  return <li {...mergeReactProps(ctx.api.getItemProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
}

export interface XhSideNavGroupProps extends Omit<ComponentPropsWithRef<'li'>, 'value'> {
  /** 分组身份，与 group-label 靠它配对。 */
  value: string
}
export function XhSideNavGroup({ value, children, ...rest }: XhSideNavGroupProps): ReactNode {
  const ctx = useSideNavContext()
  return <li {...mergeReactProps(ctx.api.getGroupProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
}

export interface XhSideNavGroupLabelProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhSideNavGroupLabel({ value, children, ...rest }: XhSideNavGroupLabelProps): ReactNode {
  const ctx = useSideNavContext()
  return <div {...mergeReactProps(ctx.api.getGroupLabelProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhSideNavBranchProps extends Omit<ComponentPropsWithRef<'li'>, 'value'> {
  value: string
}
export function XhSideNavBranch({ value, children, ...rest }: XhSideNavBranchProps): ReactNode {
  const ctx = useSideNavContext()
  const node = useMemo(() => ({ value }), [value])
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

export interface XhSideNavBranchContentProps extends ComponentPropsWithRef<'ul'> {}
export function XhSideNavBranchContent({ children, ...rest }: XhSideNavBranchContentProps): ReactNode {
  const ctx = useSideNavContext()
  const node = useSideNavNodeContext()
  const value = node.value
  // 一个弹出面板一份退场闸门：退场动画挂在面板上，从它身上探测。
  // 开合判据直接取 connect 这一帧的产出，不另起一套
  const panelRef = useRef<HTMLElement | null>(null)
  const visible = useOverlayExit({
    config: ctx.config,
    isOpen: () => (ctx.api.getPopoutPositionerProps({ value }) as Record<string, unknown>).hidden !== true,
    contentRef: panelRef,
  })

  const contentProps = ctx.api.getBranchContentProps({ value }) as Record<string, unknown>
  if (!ctx.api.isPopoutPanel(value)) {
    // 平铺分支没有定位层，原地渲染
    return <ul {...mergeReactProps(contentProps, rest as Record<string, unknown>)}>{children}</ul>
  }

  // 折叠态的弹出面板：定位层搬到浮层落点，逃开祖先的层叠上下文。
  // 收起跟着退场闸门走：定位层与面板的 hidden 都押后到退场动画播完
  const hidden = !visible || undefined
  return (
    <XhPortal container={ctx.portalContainer}>
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

export interface XhSideNavLinkTextProps extends ComponentPropsWithRef<'span'> {}
export function XhSideNavLinkText({ children, ...rest }: XhSideNavLinkTextProps): ReactNode {
  const ctx = useSideNavContext()
  return <span {...mergeReactProps(ctx.api.getLinkTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSideNavLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'value'> {
  value: string
}
export function XhSideNavLink({ value, children, ...rest }: XhSideNavLinkProps): ReactNode {
  const ctx = useSideNavContext()
  // 链接的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getLinkProps({ value }) as Record<string, unknown>,
    ['onFocus'],
  )
  return <a {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>{children}</a>
}
