import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { MenuApi, MenuGroupProps, MenuItemProps, MenuNode, MenuNodeMeta, MenuSchema, MenuTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import type { MenuChain } from './context'
import { mergeProps } from '@xihan-ui/core'
import { Fragment, useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import {
  MenuChainProvider,
  MenuGroupProvider,
  MenuItemProvider,
  MenuProvider,
  MenuSubProvider,
  useMenuChain,
  useMenuContext,
  useMenuGroupContext,
  useMenuItemContext,
  useMenuSubContext,
} from './context'
import { menuHoverParentOf } from './hover-branches'
import { useMenu, useMenuWithHoverParent } from './use-menu'

type MenuProps = MenuSchema['props']

/** 函数式 children 的载荷：菜单的展开态与开合命令。 */
export type MenuRootSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

export interface XhMenuRootProps {
  /** 条目数据；给了它就不必逐条摆部件。 */
  collection?: MenuNode[]
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  loop?: boolean
  /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
  dir?: Direction
  tone?: Tone
  size?: Size
  typeahead?: boolean
  disabled?: boolean
  translations?: Partial<MenuTranslations>
  openOnHover?: boolean
  hoverOpenDelay?: number
  hoverCloseDelay?: number
  /** 触发器里放什么；只交 collection 时由它承载。 */
  trigger?: ReactNode
  /** 只交 collection 时，trigger 给的那个节点直接当触发器用，不再外包一颗 button。 */
  triggerAsChild?: boolean
  /** 每个条目的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: MenuNodeMeta) => ReactNode
  onOpenChange?: MenuProps['onOpenChange']
  onSelect?: MenuProps['onSelect']
  children?: SlotChildren<MenuRootSlotProps>
}

export function XhMenuRoot({
  trigger,
  triggerAsChild,
  renderItem,
  children,
  ...props
}: XhMenuRootProps): ReactNode {
  const ctx = useMenu(withXhConfig('menu', props) as MenuProps)

  // 任意层级子菜单的选中都汇到根：先发根的 select 再关根，各级随父关闭级联收起。
  // 取值器每帧换、链只建一次：拿 ref 转一道，别让它成为重建的理由
  const latest = useRef({ onSelect: props.onSelect, api: ctx.api })
  latest.current = { onSelect: props.onSelect, api: ctx.api }
  const chain = useMemo<MenuChain>(() => ({
    notifySelect: (details) => {
      latest.current.onSelect?.(details)
      latest.current.api.setOpen(false)
    },
  }), [])

  const body = children != null
    ? renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })
    : props.collection
      ? <DefaultTree collection={ctx.api.collection} trigger={trigger} triggerAsChild={triggerAsChild} renderItem={renderItem} />
      : null

  return (
    <MenuProvider value={ctx}>
      <MenuChainProvider value={chain}>{body}</MenuChainProvider>
    </MenuProvider>
  )
}

XhMenuRoot.xhEvents = ['open-change', 'select'] as const

export interface XhMenuTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}
export function XhMenuTrigger({ children, asChild, ...rest }: XhMenuTriggerProps): ReactNode {
  const ctx = useMenuContext()
  const props = mergePartProps(
    mergeReactProps(
      ctx.api.getTriggerProps() as Record<string, unknown>,
      { ref: (el: HTMLElement | null) => { ctx.triggerRef.current = el } },
    ),
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'menu', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhMenuPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhMenuPositioner({ children, container, ...rest }: XhMenuPositionerProps): ReactNode {
  const ctx = useMenuContext()
  // 条目列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhMenuContentProps extends ComponentPropsWithRef<'div'> {}
export function XhMenuContent({ children, ...rest }: XhMenuContentProps): ReactNode {
  const ctx = useMenuContext()
  // content 自身得焦时清锚点，收的是不冒泡的 DOM focus：合成事件挂在冒泡的 focusin 上，
  // 后代条目得焦也会把它叫起来，判据整个变味
  const bind = useNativeEvents(ctx.api.getContentProps() as Record<string, unknown>, ['onFocus'])
  return (
    <div
      {...mergeReactProps(
        bind.attrs,
        rest as Record<string, unknown>,
        { ref: bind.ref },
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhMenuItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhMenuItem({ value, disabled, children, ...rest }: XhMenuItemProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMemo<MenuItemProps>(() => ({ value, disabled }), [value, disabled])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)
  // 条目的聚焦上报与指针划过都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getItemProps(item) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter', 'onPointerLeave'],
  )

  // 本条目持有焦点时，value 变更按新值重报焦点条目
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.FOCUS', value })
  }, [ctx.service, value])

  // 卸载时上报焦点丢失：按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.LOST' })
  }, [ctx.service])

  return (
    <MenuItemProvider value={item}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (el: HTMLDivElement | null) => { itemEl.current = el } },
        )}
      >
        {children}
      </div>
    </MenuItemProvider>
  )
}

export interface XhMenuItemTextProps extends ComponentPropsWithRef<'span'> {}
/** 条目里的文字载体：连打检索取它，图标与副文本的文字因此不进检索串。 */
export function XhMenuItemText({ children, ...rest }: XhMenuItemTextProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenuItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 条目里的标记位（勾选、图标），纯装饰。 */
export function XhMenuItemIndicator({ children, ...rest }: XhMenuItemIndicatorProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenuItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
/** 条目里的副文本，排在文字下一行。 */
export function XhMenuItemDescription({ children, ...rest }: XhMenuItemDescriptionProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenuGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
export function XhMenuGroup({ value, children, ...rest }: XhMenuGroupProps): ReactNode {
  const ctx = useMenuContext()
  const group = useMemo<MenuGroupProps>(() => ({ value }), [value])
  return (
    <MenuGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </MenuGroupProvider>
  )
}

export interface XhMenuGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhMenuGroupLabel({ children, ...rest }: XhMenuGroupLabelProps): ReactNode {
  const ctx = useMenuContext()
  const group = useMenuGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenuSeparatorProps extends ComponentPropsWithRef<'div'> {}
export function XhMenuSeparator({ children, ...rest }: XhMenuSeparatorProps): ReactNode {
  const ctx = useMenuContext()
  return <div {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhMenuArrowProps extends ComponentPropsWithRef<'div'> {}
export function XhMenuArrow({ children, ...rest }: XhMenuArrowProps): ReactNode {
  const ctx = useMenuContext()
  return <div {...mergeReactProps(ctx.api.getArrowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

/** 子菜单函数式 children 的载荷：这一层子菜单自己的展开态与开合命令。 */
export type MenuSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

export interface XhMenuSubProps {
  /** 它在父菜单里的条目身份。 */
  value: string
  disabled?: boolean
  collection?: MenuNode[]
  placement?: Placement
  offset?: number
  loop?: boolean
  openOnHover?: boolean
  hoverOpenDelay?: number
  hoverCloseDelay?: number
  /** 文字方向；缺省继承父层。子层被搬到浮层落点，继承不到父层的方向。 */
  dir?: Direction
  /** 语气；缺省继承父层。子层是浮层落点下的同级节点，CSS 私有槽继承不到。 */
  tone?: Tone
  /** 尺寸；缺省继承父层，理由同 tone。 */
  size?: Size
  children?: SlotChildren<MenuSubSlotProps>
}

/**
 * 子菜单：内部再跑一台 menu 机器（submenu 模式），触发条目由 XhMenuSubTrigger
 * 渲染成「父菜单条目 + 本子菜单触发器」的双重身份。本身不渲染节点。
 */
export function XhMenuSub({ value, disabled, children, ...props }: XhMenuSubProps): ReactNode {
  const parent = useMenuContext()
  const chain = useMenuChain()
  const ctx = useMenuWithHoverParent({
    ...props,
    disabled,
    submenu: true,
    dir: props.dir ?? parent.service.prop('dir'),
    tone: props.tone ?? parent.service.prop('tone'),
    size: props.size ?? parent.service.prop('size'),
    // 子层的选中汇到根：根发 select 并关根，各级随父关闭级联收起
    onSelect: details => chain.notifySelect(details),
  } as MenuProps, menuHoverParentOf(parent.service))

  const handle = useMemo(() => ({ parent, value, disabled }), [parent, value, disabled])

  // 父层收起（Escape、外点、选中）时本层跟着收，层层传导
  const parentOpen = parent.api.open
  const setOpenRef = useRef(ctx.api.setOpen)
  setOpenRef.current = ctx.api.setOpen
  // 后代已经先完成自己的收起；这一层随后收起再上报祖先，保证共享层栈按叶到根释放。
  const descendantChain = useMemo<MenuChain>(() => ({
    notifySelect: (details) => {
      setOpenRef.current(false)
      chain.notifySelect(details)
    },
  }), [chain])
  useEffect(() => {
    if (!parentOpen)
      setOpenRef.current(false)
  }, [parentOpen])

  return (
    <MenuProvider value={ctx}>
      <MenuChainProvider value={descendantChain}>
        <MenuSubProvider value={handle}>
          {renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })}
        </MenuSubProvider>
      </MenuChainProvider>
    </MenuProvider>
  )
}

export interface XhMenuSubTriggerProps extends ComponentPropsWithRef<'div'> {}
export function XhMenuSubTrigger({ children, ...rest }: XhMenuSubTriggerProps): ReactNode {
  const handle = useMenuSubContext()
  const ctx = useMenuContext()
  const item = { value: handle.value, disabled: handle.disabled }
  // 指针划过要把焦点搬来，那一下不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    mergeProps(
      handle.parent.api.getItemProps(item) as Record<string, unknown>,
      ctx.api.getSubmenuTriggerProps(item) as Record<string, unknown>,
    ),
    ['onFocus', 'onPointerEnter', 'onPointerLeave'],
  )
  return (
    <div
      {...mergeReactProps(
        bind.attrs,
        rest as Record<string, unknown>,
        { ref: bind.ref },
        // 子菜单的定位锚点就是这一条
        { ref: (el: HTMLDivElement | null) => { ctx.triggerRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly MenuNodeMeta[]
  trigger?: ReactNode
  triggerAsChild?: boolean
  renderItem?: (node: MenuNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      <XhMenuTrigger asChild={props.triggerAsChild}>{props.trigger}</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          {props.collection.map((node, index) => (
            // 首条上的标记不产出分隔线：菜单开头不留一道空隔
            <Fragment key={node.value}>
              {index > 0 && node.separatorBefore ? <XhMenuSeparator /> : null}
              <XhMenuItem value={node.value}>{props.renderItem?.(node) ?? node.label}</XhMenuItem>
            </Fragment>
          ))}
        </XhMenuContent>
      </XhMenuPositioner>
    </>
  )
}
