import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  ContextMenuApi,
  ContextMenuGroupProps,
  ContextMenuItemProps,
  ContextMenuNode,
  ContextMenuNodeMeta,
  ContextMenuSchema,
  MenuApi,
  MenuNode,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import type { ContextMenuChain } from './context'
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
import { MenuChainProvider, MenuProvider, useMenuContext } from '../menu/context'
import { useMenu } from '../menu/use-menu'
import {
  ContextMenuChainProvider,
  ContextMenuGroupProvider,
  ContextMenuItemProvider,
  ContextMenuProvider,
  ContextMenuSubProvider,
  useContextMenuChain,
  useContextMenuContext,
  useContextMenuGroupContext,
  useContextMenuItemContext,
  useContextMenuSubContext,
} from './context'
import { useContextMenu } from './use-context-menu'

type ContextMenuProps = ContextMenuSchema['props']

/** 函数式 children 的载荷：右键菜单的展开态与锚点坐标，以及开合、按坐标展开的命令。 */
export type ContextMenuRootSlotProps = Pick<ContextMenuApi, 'open' | 'point' | 'setOpen' | 'openAt'>

/** 子菜单函数式 children 的载荷：这一层子菜单自己的展开态与开合命令。 */
export type ContextMenuSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

export interface XhContextMenuRootProps {
  /** 条目数据；给了它就不必逐条摆部件。 */
  collection?: ContextMenuNode[]
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  loop?: boolean
  typeahead?: boolean
  translations?: ContextMenuProps['translations']
  /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
  dir?: Direction
  /** 触摸与触控笔长按到弹出的毫秒数。 */
  longPressDelay?: number
  tone?: Tone
  size?: Size
  /** 触发区里放什么；只交 collection 时由它承载。 */
  trigger?: ReactNode
  /** 每个条目的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: ContextMenuNodeMeta) => ReactNode
  onOpenChange?: ContextMenuProps['onOpenChange']
  onSelect?: ContextMenuProps['onSelect']
  children?: SlotChildren<ContextMenuRootSlotProps>
}

export function XhContextMenuRoot({ trigger, renderItem, children, ...props }: XhContextMenuRootProps): ReactNode {
  const ctx = useContextMenu(withXhConfig('context-menu', props) as ContextMenuProps)

  // 子菜单任意层级的选中都汇到根：先发根的 select 再关根，各级随父关闭级联收起。
  // 取值器每帧换、链只建一次：拿 ref 转一道，别让它成为重建的理由
  const latest = useRef({ onSelect: props.onSelect, api: ctx.api })
  latest.current = { onSelect: props.onSelect, api: ctx.api }
  const chain = useMemo<ContextMenuChain>(() => ({
    notifySelect: (details) => {
      latest.current.onSelect?.(details)
      latest.current.api.setOpen(false)
    },
  }), [])

  const body = children != null
    ? renderSlot(children, {
        open: ctx.api.open,
        point: ctx.api.point,
        setOpen: ctx.api.setOpen,
        openAt: ctx.api.openAt,
      })
    : props.collection
      ? <DefaultTree collection={ctx.api.collection} trigger={trigger} renderItem={renderItem} />
      : null

  return (
    <ContextMenuProvider value={ctx}>
      <ContextMenuChainProvider value={chain}>
        <div {...ctx.api.getRootProps() as Record<string, unknown>}>{body}</div>
      </ContextMenuChainProvider>
    </ContextMenuProvider>
  )
}

XhContextMenuRoot.xhEvents = ['open-change', 'select'] as const

export interface XhContextMenuTriggerProps extends ComponentPropsWithRef<'div'>, AsChildProps {}
/** 触发区渲染为 div，语义由 connect 打上的 ARIA 属性给出。 */
export function XhContextMenuTrigger({ children, asChild, ...rest }: XhContextMenuTriggerProps): ReactNode {
  const ctx = useContextMenuContext()
  const props = mergePartProps(
    mergeReactProps(
      ctx.api.getTriggerProps() as Record<string, unknown>,
      { ref: (el: HTMLElement | null) => { ctx.triggerRef.current = el } },
    ),
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'context-menu', (p, kids) => <div {...p}>{kids}</div>)
}

export interface XhContextMenuPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhContextMenuPositioner({ children, container, ...rest }: XhContextMenuPositionerProps): ReactNode {
  const ctx = useContextMenuContext()
  // 条目列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
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

export interface XhContextMenuContentProps extends ComponentPropsWithRef<'div'> {}
export function XhContextMenuContent({ children, ...rest }: XhContextMenuContentProps): ReactNode {
  const ctx = useContextMenuContext()
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

export interface XhContextMenuItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhContextMenuItem({ value, disabled, children, ...rest }: XhContextMenuItemProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useMemo<ContextMenuItemProps>(() => ({ value, disabled }), [value, disabled])
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
    <ContextMenuItemProvider value={item}>
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
    </ContextMenuItemProvider>
  )
}

export interface XhContextMenuItemTextProps extends ComponentPropsWithRef<'span'> {}
/** 条目里的文字载体：连打检索取它，标记位与副文本的文字因此不进检索串。 */
export function XhContextMenuItemText({ children, ...rest }: XhContextMenuItemTextProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useContextMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhContextMenuItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 条目里的标记位（勾选、图标），纯装饰。 */
export function XhContextMenuItemIndicator({ children, ...rest }: XhContextMenuItemIndicatorProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useContextMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhContextMenuItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
/** 条目里的副文本，排在文字下一行。 */
export function XhContextMenuItemDescription({ children, ...rest }: XhContextMenuItemDescriptionProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useContextMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhContextMenuGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
export function XhContextMenuGroup({ value, children, ...rest }: XhContextMenuGroupProps): ReactNode {
  const ctx = useContextMenuContext()
  const group = useMemo<ContextMenuGroupProps>(() => ({ value }), [value])
  return (
    <ContextMenuGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </ContextMenuGroupProvider>
  )
}

export interface XhContextMenuGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhContextMenuGroupLabel({ children, ...rest }: XhContextMenuGroupLabelProps): ReactNode {
  const ctx = useContextMenuContext()
  const group = useContextMenuGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhContextMenuSeparatorProps extends ComponentPropsWithRef<'div'> {}
export function XhContextMenuSeparator({ children, ...rest }: XhContextMenuSeparatorProps): ReactNode {
  const ctx = useContextMenuContext()
  return <div {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhContextMenuArrowProps extends ComponentPropsWithRef<'div'> {}
export function XhContextMenuArrow({ children, ...rest }: XhContextMenuArrowProps): ReactNode {
  const ctx = useContextMenuContext()
  return <div {...mergeReactProps(ctx.api.getArrowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhContextMenuSubProps {
  /** 它在父右键菜单里的条目身份。 */
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
  children?: SlotChildren<ContextMenuSubSlotProps>
}

/**
 * 右键菜单里的子菜单：子层跑一台 submenu 模式的 menu 机器，触发条目由
 * XhContextMenuSubTrigger 渲染成「父层条目 + 子层触发器」的双重身份。
 * 子层内部用 XhMenu 系部件。本身不渲染节点。
 */
export function XhContextMenuSub({ value, disabled, children, ...props }: XhContextMenuSubProps): ReactNode {
  const parent = useContextMenuContext()
  const chain = useContextMenuChain()
  const sub = useMenu({
    ...props,
    disabled,
    submenu: true,
    dir: props.dir ?? parent.service.prop('dir'),
    tone: props.tone ?? parent.service.prop('tone'),
    size: props.size ?? parent.service.prop('size'),
    onSelect: details => chain.notifySelect(details),
  })

  const handle = useMemo(() => ({ parent, value, disabled }), [parent, value, disabled])
  // 子层里还能再嵌一层 XhMenuSub：那一层要往上找选中汇总的链，
  // 而链只在 XhMenuRoot 里给过，右键菜单这一支得自己接上
  const menuChain = useMemo(() => ({ notifySelect: chain.notifySelect }), [chain])

  // 父层收起（Escape、外点、选中）时本层跟着收，层层传导
  const parentOpen = parent.api.open
  const setOpenRef = useRef(sub.api.setOpen)
  setOpenRef.current = sub.api.setOpen
  useEffect(() => {
    if (!parentOpen)
      setOpenRef.current(false)
  }, [parentOpen])

  return (
    <MenuProvider value={sub}>
      <MenuChainProvider value={menuChain}>
        <ContextMenuSubProvider value={handle}>
          {renderSlot(children, { open: sub.api.open, setOpen: sub.api.setOpen })}
        </ContextMenuSubProvider>
      </MenuChainProvider>
    </MenuProvider>
  )
}

export interface XhContextMenuSubTriggerProps extends ComponentPropsWithRef<'div'> {}
export function XhContextMenuSubTrigger({ children, ...rest }: XhContextMenuSubTriggerProps): ReactNode {
  const handle = useContextMenuSubContext()
  const sub = useMenuContext()
  const item = { value: handle.value, disabled: handle.disabled }
  // 合并序＝子先父后：父层的 data-scope / data-part 胜出，父层的方向键与选中照常认它。
  // 指针划过与聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    mergeProps(
      sub.api.getSubmenuTriggerProps(item) as Record<string, unknown>,
      handle.parent.api.getItemProps(item) as Record<string, unknown>,
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
        { ref: (el: HTMLDivElement | null) => { sub.triggerRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

/** 一段连续的同组条目；不分组的条目各自单独成段。 */
type NodeRun = [ContextMenuNodeMeta, ...ContextMenuNodeMeta[]]

/** 相邻同 group 的条目并成一段，没写 group 的各自成段。 */
function groupRuns(collection: readonly ContextMenuNodeMeta[]): NodeRun[] {
  const runs: NodeRun[] = []
  for (const meta of collection) {
    const last = runs.at(-1)
    if (last && meta.group != null && last[0].group === meta.group)
      last.push(meta)
    else
      runs.push([meta])
  }
  return runs
}

/** 单个条目：标记位排在文字前面，没给标记位就不铺那个部件。 */
function renderItemNode(
  meta: ContextMenuNodeMeta,
  renderItem?: (node: ContextMenuNodeMeta) => ReactNode,
): ReactNode {
  return (
    <XhContextMenuItem key={meta.value} value={meta.value}>
      {meta.indicator != null ? <XhContextMenuItemIndicator>{meta.indicator}</XhContextMenuItemIndicator> : null}
      <XhContextMenuItemText>{renderItem?.(meta) ?? meta.label}</XhContextMenuItemText>
      {meta.description != null ? <XhContextMenuItemDescription>{meta.description}</XhContextMenuItemDescription> : null}
    </XhContextMenuItem>
  )
}

/** content 的内容：分组段铺成 group，段首的分隔线落在 group 外面。 */
function renderNodes(
  collection: readonly ContextMenuNodeMeta[],
  renderItem?: (node: ContextMenuNodeMeta) => ReactNode,
): ReactNode[] {
  return groupRuns(collection).map((run, runIndex) => {
    const head = run[0]
    // 首条上的标记不产出分隔线：菜单开头不留一道空隔
    const lead = runIndex > 0 && head.separatorBefore ? <XhContextMenuSeparator /> : null
    if (head.group == null) {
      return (
        <Fragment key={head.value}>
          {lead}
          {renderItemNode(head, renderItem)}
        </Fragment>
      )
    }
    const groupLabel = run.find(node => node.groupLabel != null)?.groupLabel ?? null
    return (
      <Fragment key={`group:${head.group}`}>
        {lead}
        <XhContextMenuGroup value={head.group}>
          {groupLabel != null ? <XhContextMenuGroupLabel>{groupLabel}</XhContextMenuGroupLabel> : null}
          {run.map((node, index) => (
            <Fragment key={node.value}>
              {index > 0 && node.separatorBefore ? <XhContextMenuSeparator /> : null}
              {renderItemNode(node, renderItem)}
            </Fragment>
          ))}
        </XhContextMenuGroup>
      </Fragment>
    )
  })
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly ContextMenuNodeMeta[]
  trigger?: ReactNode
  renderItem?: (node: ContextMenuNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      <XhContextMenuTrigger>{props.trigger}</XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>{renderNodes(props.collection, props.renderItem)}</XhContextMenuContent>
      </XhContextMenuPositioner>
    </>
  )
}
