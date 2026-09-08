import type { Direction, Orientation, Placement, Size, Tone } from '@xihan-ui/core'
import type { MenuApi, MenubarApi, MenubarContentProps, MenubarGroupProps, MenubarItemProps, MenubarNode, MenubarNodeMeta, MenubarSchema, MenubarTranslations, MenuSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import type { MenubarChain } from './context'
import type { MenubarPartRegistry } from './use-menubar'
import { mergeProps } from '@xihan-ui/core'
import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { MenuChainProvider, MenuProvider, useMenuContext } from '../menu/context'
import { useMenu } from '../menu/use-menu'
import {
  MenubarChainProvider,
  MenubarGroupProvider,
  MenubarItemProvider,
  MenubarMenuProvider,
  MenubarProvider,
  MenubarSubProvider,
  useMenubarChain,
  useMenubarContext,
  useMenubarGroupContext,
  useMenubarItemContext,
  useMenubarMenuContext,
  useMenubarSubContext,
} from './context'
import { useMenubar } from './use-menubar'

type MenubarProps = MenubarSchema['props']
type MenuProps = MenuSchema['props']

/**
 * 在 ref 回调里把节点按 value 登记进菜单栏取值表。
 * 回调按 value 记忆：value 变了 React 先拿旧回调注销旧键、再拿新回调登记新键，卸载时同样注销。
 */
function useMenubarPart(register: MenubarPartRegistry, value: string): (el: HTMLElement | null) => void {
  return useCallback((el: HTMLElement | null) => {
    register(value, el)
  }, [register, value])
}

/** 函数式 children 的载荷：当前展开的那一项、有没有菜单展开着，与切换展开项的命令。 */
export type MenubarRootSlotProps = Pick<MenubarApi, 'value' | 'open' | 'setValue'>

/** 根上自有的那些取值；defaultValue、dir 与 onSelect 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir' | 'onSelect'>

export interface XhMenubarRootProps extends RootElementProps {
  /** 菜单栏数据；给了它就不必逐条摆部件。 */
  collection?: MenubarNode[]
  value?: string | null
  defaultValue?: string | null
  orientation?: Orientation
  loop?: boolean
  dir?: Direction
  disabled?: boolean
  typeahead?: boolean
  placement?: Placement
  offset?: number
  tone?: Tone
  size?: Size
  translations?: Partial<MenubarTranslations>
  onValueChange?: MenubarProps['onValueChange']
  onSelect?: MenubarProps['onSelect']
  /** 每个条目的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: MenubarNodeMeta) => ReactNode
  children?: SlotChildren<MenubarRootSlotProps>
}

/** role=menubar 根节点：trigger 的 roving tabindex 作用域，各菜单浮层也挂在其内。 */
export function XhMenubarRoot({
  collection,
  value,
  defaultValue,
  orientation,
  loop,
  dir,
  disabled,
  typeahead,
  placement,
  offset,
  tone,
  size,
  translations,
  onValueChange,
  onSelect,
  children,
  renderItem,
  ...rest
}: XhMenubarRootProps): ReactNode {
  const machineProps = {
    collection,
    value,
    defaultValue,
    orientation,
    loop,
    dir,
    disabled,
    typeahead,
    placement,
    offset,
    tone,
    size,
    translations,
    onValueChange,
    onSelect,
  }
  const ctx = useMenubar(withXhConfig('menubar', machineProps) as MenubarProps)
  // 菜单栏根上的 onFocus 是 DOM 的 focus（不冒泡，只在根自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，trigger 得焦也会把它叫起来——装成原生监听器，到达路径才与另外两家一致。
  // onFocusOut 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(ctx.api.getRootProps() as Record<string, unknown>, ['onFocus'])

  // 子菜单任意层级的选中都汇到这里：先发根的 select，再关掉整条菜单栏。
  // 关根用 setValue(null) —— 菜单栏是「当前展开哪一项」的模型，没有 setOpen。
  // 取值器每帧换、链只建一次：拿 ref 转一道，别让它成为重建的理由
  const latest = useRef({ onSelect, api: ctx.api })
  latest.current = { onSelect, api: ctx.api }
  const chain = useMemo<MenubarChain>(() => ({
    notifySelect: (details) => {
      latest.current.onSelect?.(details)
      latest.current.api.setValue(null)
    },
  }), [])

  const body = children != null
    ? renderSlot(children, { value: ctx.api.value, open: ctx.api.open, setValue: ctx.api.setValue })
    : collection
      ? <DefaultTree collection={ctx.api.collection} renderItem={renderItem} />
      : null

  return (
    <MenubarProvider value={ctx}>
      <MenubarChainProvider value={chain}>
        <div
          {...mergeReactProps(
            bind.attrs,
            rest as Record<string, unknown>,
            { ref: bind.ref },
            { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
          )}
        >
          {body}
        </div>
      </MenubarChainProvider>
    </MenubarProvider>
  )
}

XhMenubarRoot.xhEvents = ['value-change', 'select'] as const

export interface XhMenubarTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'value'>, AsChildProps {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhMenubarTrigger({ value, disabled, asChild, children, ...rest }: XhMenubarTriggerProps): ReactNode {
  const ctx = useMenubarContext()
  // trigger 同时作为定位锚点与焦点归还目标
  const setEl = useMenubarPart(ctx.registerTrigger, value)
  // 入口的聚焦上报与指针掠过都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getTriggerProps({ value, disabled }) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter'],
  )
  const props = mergePartProps(
    mergeReactProps(
      bind.attrs,
      { ref: bind.ref },
      { ref: setEl },
    ),
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'menubar', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhMenubarPositionerProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhMenubarPositioner({ value, container, children, ...rest }: XhMenubarPositionerProps): ReactNode {
  const ctx = useMenubarContext()
  const menu = useMemo<MenubarContentProps>(() => ({ value }), [value])
  const setEl = useMenubarPart(ctx.registerPositioner, value)
  return (
    <MenubarMenuProvider value={menu}>
      <XhPortal container={container ?? ctx.portalContainer}>
        <div
          {...mergeReactProps(
            ctx.api.getPositionerProps(menu) as Record<string, unknown>,
            rest as Record<string, unknown>,
            { ref: setEl },
          )}
        >
          {children}
        </div>
      </XhPortal>
    </MenubarMenuProvider>
  )
}

export interface XhMenubarContentProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 缺省时沿用外层 positioner 提供的身份，无 positioner 时必填。 */
  value?: string
}
export function XhMenubarContent({ value, children, ...rest }: XhMenubarContentProps): ReactNode {
  const ctx = useMenubarContext()
  const inherited = useMenubarMenuContext()
  const own = value ?? inherited?.value
  if (own == null)
    throw new Error('XhMenubarContent 要放在 XhMenubarPositioner 里，或自带 value')
  const menu = useMemo<MenubarContentProps>(() => ({ value: own }), [own])
  const setEl = useMenubarPart(ctx.registerContent, own)
  const contentRef = useRef<HTMLElement | null>(null)
  // 一个菜单一份退场闸门：它们各开各的、动画各跑各的，一份管不过来。
  // 开合判据直接取 connect 这一帧的产出，不另起一套——两边各判一次迟早会说岔
  const visible = useOverlayExit({
    config: ctx.config,
    isOpen: () => (ctx.api.getContentProps(menu) as Record<string, unknown>).hidden !== true,
    contentRef,
  })
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps(menu) as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场就一帧都
          // 播不出来），所以真正的收起落成内联 display
          style: visible ? undefined : { display: 'none' },
          ref: setEl,
        },
        { ref: (el: HTMLDivElement | null) => { contentRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhMenubarGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhMenubarGroup({ value, children, ...rest }: XhMenubarGroupProps): ReactNode {
  const ctx = useMenubarContext()
  const group = useMemo<MenubarGroupProps>(() => ({ value }), [value])
  return (
    <MenubarGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </MenubarGroupProvider>
  )
}

export interface XhMenubarGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhMenubarGroupLabel({ children, ...rest }: XhMenubarGroupLabelProps): ReactNode {
  const ctx = useMenubarContext()
  const group = useMenubarGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhMenubarItem({ value, disabled, children, ...rest }: XhMenubarItemProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMemo<MenubarItemProps>(() => ({ value, disabled }), [value, disabled])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)
  // 条目的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getItemProps(item) as Record<string, unknown>,
    ['onFocus'],
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
    <MenubarItemProvider value={item}>
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
    </MenubarItemProvider>
  )
}

export interface XhMenubarItemTextProps extends ComponentPropsWithRef<'span'> {}
/** 条目里的文字载体：连打检索取它，图标与副文本的文字因此不进检索串。 */
export function XhMenubarItemText({ children, ...rest }: XhMenubarItemTextProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMenubarItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 条目里的标记位（勾选、图标），纯装饰。 */
export function XhMenubarItemIndicator({ children, ...rest }: XhMenubarItemIndicatorProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMenubarItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
/** 条目里的副文本，排在文字下一行。 */
export function XhMenubarItemDescription({ children, ...rest }: XhMenubarItemDescriptionProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMenubarItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarSeparatorProps extends ComponentPropsWithRef<'div'> {}
export function XhMenubarSeparator({ ...rest }: XhMenubarSeparatorProps): ReactNode {
  const ctx = useMenubarContext()
  return <div {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhMenubarArrowProps extends ComponentPropsWithRef<'div'> {}
/** 指向本张菜单锚点的箭头，纯装饰；须写在同一张菜单的 positioner 里。 */
export function XhMenubarArrow({ ...rest }: XhMenubarArrowProps): ReactNode {
  const ctx = useMenubarContext()
  const menu = useMenubarMenuContext()
  if (!menu)
    throw new Error('XhMenubarArrow 要放在 XhMenubarPositioner 里')
  return <div {...mergeReactProps(ctx.api.getArrowProps(menu) as Record<string, unknown>, rest as Record<string, unknown>)} />
}

/** 子菜单函数式 children 的载荷：这一层子菜单自己的展开态与开合命令。 */
export type MenubarSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

export interface XhMenubarSubProps {
  /** 它在所属那张菜单里的条目身份。 */
  value: string
  disabled?: boolean
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
  children?: SlotChildren<MenubarSubSlotProps>
}

/**
 * 子菜单：内部再跑一台 menu 机器（submenu 模式），触发条目由 XhMenubarSubTrigger
 * 渲染成「菜单栏条目 + 本子菜单触发器」的双重身份。本身不渲染节点。
 */
export function XhMenubarSub({ value, disabled, children, ...props }: XhMenubarSubProps): ReactNode {
  const parent = useMenubarContext()
  const owner = useMenubarMenuContext()
  if (!owner)
    throw new Error('XhMenubarSub 要放在 XhMenubarPositioner 里')
  const chain = useMenubarChain()
  const ownerValue = owner.value
  // 菜单栏的选中要带菜单身份，子层只知道条目值，在这里补上
  const notifySelect = useCallback(
    (details: { value: string }) => chain.notifySelect({ menu: ownerValue, value: details.value }),
    [chain, ownerValue],
  )
  // 子层跑的是一台子菜单模式的 menu 机器：菜单栏那台是单机器单锚点，装不下第二层
  const sub = useMenu({
    ...props,
    disabled,
    submenu: true,
    dir: props.dir ?? parent.service.prop('dir'),
    tone: props.tone ?? parent.service.prop('tone'),
    size: props.size ?? parent.service.prop('size'),
    onSelect: notifySelect,
  } as MenuProps)

  const handle = useMemo(() => ({ parent, value, disabled }), [parent, value, disabled])
  // 子层里还能再嵌一层 XhMenuSub：那一层要往上找选中汇总的链
  const menuChain = useMemo(() => ({ notifySelect }), [notifySelect])

  // 所属那张菜单收起时本层跟着收，层层传导
  const ownerOpen = parent.api.isOpen(ownerValue)
  const setOpenRef = useRef(sub.api.setOpen)
  setOpenRef.current = sub.api.setOpen
  useEffect(() => {
    if (!ownerOpen)
      setOpenRef.current(false)
  }, [ownerOpen])

  return (
    <MenuProvider value={sub}>
      <MenuChainProvider value={menuChain}>
        <MenubarSubProvider value={handle}>
          {renderSlot(children, { open: sub.api.open, setOpen: sub.api.setOpen })}
        </MenubarSubProvider>
      </MenuChainProvider>
    </MenuProvider>
  )
}

export interface XhMenubarSubTriggerProps extends ComponentPropsWithRef<'div'> {}
export function XhMenubarSubTrigger({ children, ...rest }: XhMenubarSubTriggerProps): ReactNode {
  const handle = useMenubarSubContext()
  const sub = useMenuContext()
  const item = { value: handle.value, disabled: handle.disabled }
  // 合并序=子先父后：父层的 data-scope/data-part 胜出，菜单栏的方向键与选中照常认它。
  // 反过来写会让节点带上 data-scope="menu"，菜单栏按自己的 scope 查条目就一条都找不到。
  // 聚焦上报与指针掠过都不冒泡，合完再整份改装成原生监听器
  const bind = useNativeEvents(
    mergeProps(
      sub.api.getSubmenuTriggerProps(item) as Record<string, unknown>,
      handle.parent.api.getItemProps(item) as Record<string, unknown>,
    ),
    ['onFocus', 'onPointerEnter'],
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

/** 相邻同 group 的条目并成一段，没写 group 的各自成段。 */
function groupRuns(collection: readonly MenubarNodeMeta[]): MenubarNodeMeta[][] {
  const runs: MenubarNodeMeta[][] = []
  for (const meta of collection) {
    const last = runs.at(-1)
    if (last && meta.group != null && last[0]!.group === meta.group)
      last.push(meta)
    else
      runs.push([meta])
  }
  return runs
}

/** 单个条目：文字在上，副文本在下，没给副文本就不铺那个部件。 */
function renderNode(meta: MenubarNodeMeta, renderItem?: (node: MenubarNodeMeta) => ReactNode): ReactNode {
  return (
    <XhMenubarItem key={meta.value} value={meta.value}>
      <XhMenubarItemText>{renderItem?.(meta) ?? meta.label}</XhMenubarItemText>
      {meta.description != null ? <XhMenubarItemDescription>{meta.description}</XhMenubarItemDescription> : null}
    </XhMenubarItem>
  )
}

/** content 的内容：分组段铺成 group，段首的分隔线落在 group 外面。 */
function renderNodes(collection: readonly MenubarNodeMeta[], renderItem?: (node: MenubarNodeMeta) => ReactNode): ReactNode {
  return groupRuns(collection).map((run, runIndex) => {
    const head = run[0]!
    // 首条上的标记不产出分隔线：菜单开头不留一道空隔
    const lead = runIndex > 0 && head.separatorBefore ? <XhMenubarSeparator /> : null
    if (head.group == null) {
      return (
        <Fragment key={head.value}>
          {lead}
          {renderNode(head, renderItem)}
        </Fragment>
      )
    }
    const groupLabel = run.find(node => node.groupLabel != null)?.groupLabel ?? null
    return (
      <Fragment key={`group:${head.group}`}>
        {lead}
        <XhMenubarGroup value={head.group}>
          {groupLabel != null ? <XhMenubarGroupLabel>{groupLabel}</XhMenubarGroupLabel> : null}
          {run.map((node, index) => (
            <Fragment key={node.value}>
              {index > 0 && node.separatorBefore ? <XhMenubarSeparator /> : null}
              {renderNode(node, renderItem)}
            </Fragment>
          ))}
        </XhMenubarGroup>
      </Fragment>
    )
  })
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 一排入口排在前、各自那张菜单的浮层排在后，与手写部件产出的 DOM 完全一致；
 * 要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly MenubarNodeMeta[]
  renderItem?: (node: MenubarNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      {props.collection.map(menu => (
        <XhMenubarTrigger key={`trigger:${menu.value}`} value={menu.value}>{menu.label}</XhMenubarTrigger>
      ))}
      {props.collection.map(menu => (
        <XhMenubarPositioner key={`positioner:${menu.value}`} value={menu.value}>
          <XhMenubarContent>{renderNodes(menu.items, props.renderItem)}</XhMenubarContent>
        </XhMenubarPositioner>
      ))}
    </>
  )
}
