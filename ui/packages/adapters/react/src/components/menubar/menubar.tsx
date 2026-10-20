/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 menubar 相关实现。

import type { Direction, Orientation, Placement, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { MenuApi, MenubarAnyItemProps, MenubarApi, MenubarCheckboxItemProps, MenubarContentProps, MenubarGroupProps, MenubarNode, MenubarNodeMeta, MenubarRadioItemProps, MenubarRadioValue, MenubarSchema, MenubarTranslations, MenuNode, MenuSchema, StructureNode } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import type { MenubarPartRegistry } from './use-menubar'
import { mergeProps } from '@xihan-ui/core'
import { menubarStructure } from '@xihan-ui/headless'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { XhIcon } from '../icon/icon'
import { MenuProvider, useMenuContext } from '../menu/context'
import { MenuDefaultNodes, XhMenuContent, XhMenuPositioner } from '../menu/menu'
import { useMenuWithParent } from '../menu/use-menu'
import {
  MenubarGroupProvider,
  MenubarItemProvider,
  MenubarMenuProvider,
  MenubarPositionerProvider,
  MenubarProvider,
  MenubarSubProvider,
  useMenubarContext,
  useMenubarGroupContext,
  useMenubarItemContext,
  useMenubarMenuContext,
  useMenubarPositionerContext,
  useMenubarSubContext,
} from './context'
import { useMenubar } from './use-menubar'

type MenubarProps = MenubarSchema['props']
type MenuProps = MenuSchema['props']

/**
 * 在 ref 回调中把节点按 value 登记进菜单栏取值表。
 * 回调按 value 记忆：value 变化时 React 先用旧回调注销旧键、再用新回调登记新键，卸载时同样注销。
 */
function useMenubarPart(register: MenubarPartRegistry, value: string): (el: HTMLElement | null) => void {
  return useCallback((el: HTMLElement | null) => {
    register(value, el)
  }, [register, value])
}

/** 函数式 children 的载荷：当前展开的菜单项、是否有菜单展开，以及切换展开项的命令。 */
export type MenubarRootSlotProps = Pick<MenubarApi, 'value' | 'open' | 'setValue' | 'checkboxValue' | 'radioValue' | 'setCheckboxValue' | 'setRadioValue'>

/** 根上自有的取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

/** 代铺条目时可逐槽接管的三处渲染；三处都不给即完全按数据铺。 */
interface MenubarItemRenderers {
  item?: (node: MenubarNodeMeta) => ReactNode
  prefix?: (node: MenubarNodeMeta) => ReactNode
  suffix?: (node: MenubarNodeMeta) => ReactNode
}

export interface XhMenubarRootProps extends RootElementProps {
  /** 菜单栏数据；提供后不必逐条放置部件。 */
  collection?: MenubarNode[]
  checkboxValue?: string[]
  defaultCheckboxValue?: string[]
  radioValue?: MenubarRadioValue
  defaultRadioValue?: MenubarRadioValue
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
  onItemSelect?: MenubarProps['onItemSelect']
  onCheckboxValueChange?: MenubarProps['onCheckboxValueChange']
  onRadioValueChange?: MenubarProps['onRadioValueChange']
  /** 每个条目的自定义内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: MenubarNodeMeta) => ReactNode
  /** 只接管条目行首那一格；其余槽仍由数据铺。 */
  renderItemPrefix?: (node: MenubarNodeMeta) => ReactNode
  /** 只接管条目行尾那一格（计数、徽标、次级图标）；其余槽仍由数据铺。 */
  renderItemSuffix?: (node: MenubarNodeMeta) => ReactNode
  children?: SlotChildren<MenubarRootSlotProps>
}

/** role=menubar 根节点：trigger 的 roving tabindex 作用域，各菜单浮层也挂在其内。 */
export function XhMenubarRoot({
  collection,
  checkboxValue,
  defaultCheckboxValue,
  radioValue,
  defaultRadioValue,
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
  onItemSelect,
  onCheckboxValueChange,
  onRadioValueChange,
  children,
  renderItem,
  renderItemPrefix,
  renderItemSuffix,
  ...rest
}: XhMenubarRootProps): ReactNode {
  const machineProps = {
    collection,
    checkboxValue,
    defaultCheckboxValue,
    radioValue,
    defaultRadioValue,
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
    onItemSelect,
    onCheckboxValueChange,
    onRadioValueChange,
  }
  const ctx = useMenubar(withXhConfig('menubar', machineProps) as MenubarProps)
  // 菜单栏根上的 onFocus 是 DOM 的 focus（不冒泡，只在根自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，trigger 得焦也会把它叫起来——装成原生监听器，到达路径才与另外两家一致。
  // onFocusOut 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(ctx.api.getRootProps() as Record<string, unknown>, ['onFocus'])

  const body = children != null
    ? renderSlot(children, {
        value: ctx.api.value,
        open: ctx.api.open,
        setValue: ctx.api.setValue,
        checkboxValue: ctx.api.checkboxValue,
        radioValue: ctx.api.radioValue,
        setCheckboxValue: ctx.api.setCheckboxValue,
        setRadioValue: ctx.api.setRadioValue,
      })
    : renderDefaultStructure(ctx.api, { item: renderItem, prefix: renderItemPrefix, suffix: renderItemSuffix })

  return (
    <MenubarProvider value={ctx}>
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
    </MenubarProvider>
  )
}

XhMenubarRoot.xhEvents = ['value-change', 'item-select', 'checkbox-value-change', 'radio-value-change'] as const

export interface XhMenubarTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'value'>, AsChildProps {
  value: string
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
export function XhMenubarTrigger({ value, disabled, asChild, children, ...rest }: XhMenubarTriggerProps): ReactNode {
  const ctx = useMenubarContext()
  // trigger 同时作为定位锚点与焦点归还目标
  const setEl = useMenubarPart(ctx.registerTrigger, value)
  const triggerEl = useRef<HTMLElement | null>(null)
  // 入口的聚焦上报与指针掠过都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getTriggerProps({ value, disabled }) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter'],
  )
  // 卸载时上报菜单栏失焦：按「本入口当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    // 整条栏一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (svc.getStatus() !== 'Started')
      return
    if (triggerEl.current && svc.scope.getActiveElement() === triggerEl.current)
      svc.send({ type: 'MENUBAR.BLUR' })
  }, [ctx.service])
  const props = mergePartProps(
    mergeReactProps(
      bind.attrs,
      { ref: bind.ref },
      { ref: setEl },
      { ref: triggerEl },
    ),
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'menubar', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhMenubarPositionerProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhMenubarPositioner({ value, container, children, ...rest }: XhMenubarPositionerProps): ReactNode {
  const ctx = useMenubarContext()
  const menu = useMemo<MenubarContentProps>(() => ({ value }), [value])
  const setEl = useMenubarPart(ctx.registerPositioner, value)
  const getTrigger = ctx.getTrigger
  const source = useMemo<RefObject<HTMLElement | null>>(() => ({
    get current() {
      return getTrigger(value)
    },
  }), [getTrigger, value])
  // 这张菜单的内容节点由 content 挂载后写回；条目列表的自绘条与 content 同级、绝对定位不占布局，
  // 壳是这层已经 fixed 的 positioner；一张菜单一套，浮层里的条子走 4px 档
  const contentRef = useRef<HTMLElement | null>(null)
  const bars = useScrollbars({ scrollable: () => contentRef.current, props: () => ({ size: 'sm' }) })
  // 关着的菜单不建视觉桥：菜单栏上每一项各有一个定位层，几项就是几台挂在祖先链上的观察
  const [present, setPresent] = useState(false)
  const link = useMemo(() => ({ contentRef, setPresent }), [])
  return (
    <MenubarMenuProvider value={menu}>
      <MenubarPositionerProvider value={link}>
        <XhPortal container={container ?? ctx.portalContainer} source={source} present={present}>
          <div
            {...mergeReactProps(
              ctx.api.getPositionerProps(menu) as Record<string, unknown>,
              rest as Record<string, unknown>,
              { ref: setEl },
            )}
          >
            {children}
            {bars.render()}
          </div>
        </XhPortal>
      </MenubarPositionerProvider>
    </MenubarMenuProvider>
  )
}

export interface XhMenubarContentProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 默认时沿用外层 positioner 提供的身份，无 positioner 时必填。 */
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
  // 外层 positioner 按这个节点配自绘条、按呈现与否建视觉桥
  const positioner = useMenubarPositionerContext()
  const presenceRef = useRef<PresenceHandle | null>(null)
  const presenceValueRef = useRef<string | null>(null)
  const sendPresence = (event: MenubarSchema['event']): void => {
    const deliver = (): void => {
      if (ctx.service.getStatus() === 'Started')
        ctx.service.send(event)
    }
    if (ctx.service.getStatus() === 'Started')
      deliver()
    else
      queueMicrotask(deliver)
  }
  // 一个菜单一份退场闸门：它们各开各的、动画各跑各的，一份管不过来。
  // 开合判据直接取 connect 这一帧的产出，不另起一套——两边各判一次迟早会说岔
  const visible = useOverlayExit({
    config: ctx.config,
    isOpen: () => (ctx.api.getContentProps(menu) as Record<string, unknown>).hidden !== true,
    contentRef,
    onPresence: (next) => {
      const previous = presenceRef.current
      const previousValue = presenceValueRef.current
      presenceRef.current = next
      presenceValueRef.current = next ? own : null
      if (next)
        sendPresence({ type: 'PRESENCE.SET', value: own, presence: next, connected: true })
      else if (previous && previousValue != null)
        sendPresence({ type: 'PRESENCE.SET', value: previousValue, presence: previous, connected: false })
    },
  })
  // 布局阶段写回：positioner 在绘制前跟着重渲一次，按新值建桥或撤桥
  useIsomorphicLayoutEffect(() => {
    if (!positioner)
      return
    positioner.setPresent(visible)
    return () => positioner.setPresent(false)
  }, [positioner, visible])
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
        {
          ref: (el: HTMLDivElement | null) => {
            contentRef.current = el
            if (positioner)
              positioner.contentRef.current = el
          },
        },
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

export interface XhMenubarRadioGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhMenubarRadioGroup({ value, children, ...rest }: XhMenubarRadioGroupProps): ReactNode {
  const ctx = useMenubarContext()
  const group = useMemo<MenubarGroupProps>(() => ({ value }), [value])
  return (
    <MenubarGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getRadioGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
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
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
interface MenubarItemImplProps extends ComponentPropsWithRef<'div'> {
  item: MenubarAnyItemProps
}
function MenubarItemImpl({ item, children, ...rest }: MenubarItemImplProps): ReactNode {
  const ctx = useMenubarContext()
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(item.value)
  const headlessProps = item.kind === 'checkbox'
    ? ctx.api.getCheckboxItemProps(item)
    : item.kind === 'radio'
      ? ctx.api.getRadioItemProps(item)
      : ctx.api.getItemProps(item)
  // 条目的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    headlessProps as Record<string, unknown>,
    ['onFocus'],
  )

  // 本条目持有焦点时，value 变更按新值重报焦点条目
  useEffect(() => {
    const prev = previous.current
    previous.current = item.value
    if (prev === item.value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.FOCUS', value: item.value })
  }, [ctx.service, item.value])

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

export function XhMenubarItem({ value, disabled, children, ...rest }: XhMenubarItemProps): ReactNode {
  const item = useMemo<MenubarAnyItemProps>(() => ({ value, disabled, kind: 'item' }), [value, disabled])
  return <MenubarItemImpl item={item} {...rest}>{children}</MenubarItemImpl>
}

export interface XhMenubarCheckboxItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'>, MenubarCheckboxItemProps {}
export function XhMenubarCheckboxItem({ value, disabled, closeOnSelect, children, ...rest }: XhMenubarCheckboxItemProps): ReactNode {
  const item = useMemo<MenubarAnyItemProps>(() => ({ value, disabled, closeOnSelect, kind: 'checkbox' }), [value, disabled, closeOnSelect])
  return <MenubarItemImpl item={item} {...rest}>{children}</MenubarItemImpl>
}

export interface XhMenubarRadioItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'>, Omit<MenubarRadioItemProps, 'group'> {}
export function XhMenubarRadioItem({ value, disabled, closeOnSelect, children, ...rest }: XhMenubarRadioItemProps): ReactNode {
  const group = useMenubarGroupContext()
  const item = useMemo<MenubarAnyItemProps>(() => ({ value, disabled, closeOnSelect, kind: 'radio', group: group.value }), [value, disabled, closeOnSelect, group.value])
  return <MenubarItemImpl item={item} {...rest}>{children}</MenubarItemImpl>
}

export interface XhMenubarItemTextProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的文字载体：连打检索取它，图标与副文本的文字因此不进入检索串。 */
export function XhMenubarItemText({ children, ...rest }: XhMenubarItemTextProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMenubarItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的标记位（勾选、图标），纯装饰。 */
export function XhMenubarItemIndicator({ children, ...rest }: XhMenubarItemIndicatorProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMenubarItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的副文本，排在文字下一行。 */
export function XhMenubarItemDescription({ children, ...rest }: XhMenubarItemDescriptionProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMenubarItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarItemIconProps extends ComponentPropsWithRef<'span'> {}
/** 条目文字之前的图标格；装饰态，读屏从条目文字取意。 */
export function XhMenubarItemIcon({ children, ...rest }: XhMenubarItemIconProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMenubarItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIconProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarItemShortcutProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的快捷键提示，贴行尾；纯装饰，读屏从条目文字取意。 */
export function XhMenubarItemShortcut({ children, ...rest }: XhMenubarItemShortcutProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMenubarItemContext()
  return <span {...mergeReactProps(ctx.api.getItemShortcutProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarItemSuffixProps extends ComponentPropsWithRef<'span'> {}
/** 条目行尾的作者内容（计数、徽标、次级图标）；家族只管落位，不规定字号与颜色。 */
export function XhMenubarItemSuffix({ children, ...rest }: XhMenubarItemSuffixProps): ReactNode {
  const ctx = useMenubarContext()
  const item = useMenubarItemContext()
  return <span {...mergeReactProps(ctx.api.getItemSuffixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenubarSeparatorProps extends ComponentPropsWithRef<'div'> {}
export function XhMenubarSeparator({ ...rest }: XhMenubarSeparatorProps): ReactNode {
  const ctx = useMenubarContext()
  return <div {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhMenubarArrowProps extends ComponentPropsWithRef<'div'> {}
/** 指向本菜单锚点的箭头，纯装饰；须写在同一菜单的 positioner 中。 */
export function XhMenubarArrow({ ...rest }: XhMenubarArrowProps): ReactNode {
  const ctx = useMenubarContext()
  const menu = useMenubarMenuContext()
  if (!menu)
    throw new Error('XhMenubarArrow 要放在 XhMenubarPositioner 里')
  return <div {...mergeReactProps(ctx.api.getArrowProps(menu) as Record<string, unknown>, rest as Record<string, unknown>)} />
}

/** 子菜单函数式 children 的载荷：该层子菜单自己的展开态与开合命令。 */
export type MenubarSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

export interface XhMenubarSubProps {
  /** 它在所属菜单中的条目身份。 */
  value: string
  /** 按数据铺设时触发条目的文字；缺省取所属菜单 items 里这一条的 label。 */
  label?: string
  disabled?: boolean
  /** 子层的条目数据：显示文本与禁用的事实源，按数据铺子层时由默认树代填。 */
  collection?: MenuNode[]
  placement?: Placement
  offset?: number
  loop?: boolean
  openOnHover?: boolean
  hoverOpenDelay?: number
  hoverCloseDelay?: number
  /** 文字方向；默认继承父层。子层被迁移到浮层落点，无法继承父层的方向。 */
  dir?: Direction
  /** 语气；默认继承父层。子层是浮层落点下的同级节点，CSS 私有槽无法继承。 */
  tone?: Tone
  /** 尺寸；默认继承父层，理由同 tone。 */
  size?: Size
  children?: SlotChildren<MenubarSubSlotProps>
}

/**
 * 子菜单：内部再运行一台 menu 状态机（submenu 模式），触发条目由 XhMenubarSubTrigger
 * 渲染为菜单栏条目与本子菜单触发器的双重身份。本身不渲染节点。
 * 不给 children 时照标准结构铺自己那一层：触发条目、定位层与按 collection 铺的条目。
 */
export function XhMenubarSub({ value, label, disabled, children, ...props }: XhMenubarSubProps): ReactNode {
  const parent = useMenubarContext()
  const owner = useMenubarMenuContext()
  if (!owner)
    throw new Error('XhMenubarSub 要放在 XhMenubarPositioner 里')
  const ownerValue = owner.value
  // 子层跑的是一台子菜单模式的 menu 机器：菜单栏那台是单机器单锚点，装不下第二层
  const sub = useMenuWithParent({
    ...props,
    disabled,
    submenu: true,
    dir: props.dir ?? parent.service.prop('dir'),
    tone: props.tone ?? parent.service.prop('tone'),
    size: props.size ?? parent.service.prop('size'),
  } as MenuProps, parent.tree)

  const handle = useMemo(() => ({ parent, value, disabled }), [parent, value, disabled])
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
      <MenubarSubProvider value={handle}>
        {children != null
          ? renderSlot(children, { open: sub.api.open, setOpen: sub.api.setOpen })
          : (
              <>
                <XhMenubarSubTrigger>{label ?? ownItems(parent.api, owner).find(node => node.value === value)?.label ?? value}</XhMenubarSubTrigger>
                <XhMenuPositioner>
                  <XhMenuContent>
                    <MenuDefaultNodes />
                  </XhMenuContent>
                </XhMenuPositioner>
              </>
            )}
      </MenubarSubProvider>
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

/** 所属那张菜单里按数据铺的条目元信息。 */
function ownItems(api: MenubarApi, owner: MenubarContentProps | null): readonly MenubarNodeMeta[] {
  return api.collection.find(node => node.value === owner?.value)?.items ?? []
}

/** 按数据铺的条目：kind 取所属菜单 items 里这一条，勾选与单选条目各用自己的部件组件。 */
function MenubarStructureItem({ value, children }: { value: string, children?: ReactNode }): ReactNode {
  const ctx = useMenubarContext()
  const meta = ownItems(ctx.api, useMenubarMenuContext()).find(node => node.value === value)
  if (meta?.kind === 'checkbox')
    return <XhMenubarCheckboxItem value={value} closeOnSelect={meta.closeOnSelect}>{children}</XhMenubarCheckboxItem>
  if (meta?.kind === 'radio')
    return <XhMenubarRadioItem value={value} closeOnSelect={meta.closeOnSelect}>{children}</XhMenubarRadioItem>
  return <XhMenubarItem value={value}>{children}</XhMenubarItem>
}

/** 按数据铺的分组：组里有单选条目时是单选组。 */
function MenubarStructureGroup({ value, children }: { value: string, children?: ReactNode }): ReactNode {
  const ctx = useMenubarContext()
  return ownItems(ctx.api, useMenubarMenuContext()).some(node => node.kind === 'radio' && node.group === value)
    ? <XhMenubarRadioGroup value={value}>{children}</XhMenubarRadioGroup>
    : <XhMenubarGroup value={value}>{children}</XhMenubarGroup>
}

/** 标准结构里各部件对应的组件。 */
const MENUBAR_PARTS = {
  'trigger': XhMenubarTrigger,
  'positioner': XhMenubarPositioner,
  'content': XhMenubarContent,
  'item': MenubarStructureItem,
  'item-icon': XhMenubarItemIcon,
  'item-text': XhMenubarItemText,
  'item-indicator': XhMenubarItemIndicator,
  'item-description': XhMenubarItemDescription,
  'item-shortcut': XhMenubarItemShortcut,
  'item-suffix': XhMenubarItemSuffix,
  'separator': XhMenubarSeparator,
  'group': MenubarStructureGroup,
  'group-label': XhMenubarGroupLabel,
}

/** 结构里组合进来的组件：带 children 的条目是嵌套的子菜单。 */
const MENUBAR_INSTANCES = { menu: XhMenubarSub, icon: XhIcon }

/**
 * 未写 children 时照 menubarStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 入口按钮的文字取入口的 label；条目文字、行首、行尾可由三个渲染函数逐槽接管，其余照数据铺。
 */
function renderDefaultStructure(api: MenubarApi, renderers: MenubarItemRenderers): ReactNode[] {
  const renderOf = (name: string | undefined): ((node: MenubarNodeMeta) => ReactNode) | undefined =>
    name === 'item' ? renderers.item : name === 'item-prefix' ? renderers.prefix : name === 'item-suffix' ? renderers.suffix : undefined
  return renderStructure(menubarStructure(api, { slotted: name => renderOf(name) != null }), MENUBAR_PARTS, (node: StructureNode) => {
    const render = renderOf(node.slot?.name)
    const meta = node.data as MenubarNodeMeta | undefined
    return render && meta ? render(meta) : undefined
  }, MENUBAR_INSTANCES)
}
