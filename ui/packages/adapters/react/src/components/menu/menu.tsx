/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 menu 相关实现。

import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { MenuAnyItemProps, MenuApi, MenuCheckboxItemProps, MenuGroupProps, MenuNode, MenuNodeMeta, MenuRadioItemProps, MenuRadioValue, MenuSchema, MenuTranslations, StructureNode } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { mergeProps } from '@xihan-ui/core'
import { menuNodesStructure, menuStructure } from '@xihan-ui/headless'
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { XhIcon } from '../icon/icon'
import {
  MenuGroupProvider,
  MenuItemProvider,
  MenuProvider,
  MenuSubProvider,
  useMenuContext,
  useMenuGroupContext,
  useMenuItemContext,
  useMenuSubContext,
} from './context'
import { useMenu, useMenuWithParent } from './use-menu'

type MenuProps = MenuSchema['props']

/** 函数式 children 的载荷：菜单的展开态与开合命令。 */
export type MenuRootSlotProps = Pick<MenuApi, 'open' | 'setOpen' | 'checkboxValue' | 'radioValue' | 'setCheckboxValue' | 'setRadioValue'>

/** 代铺条目时可逐槽接管的三处渲染；三处都不给即完全按数据铺。 */
interface MenuItemRenderers {
  item?: (node: MenuNodeMeta) => ReactNode
  prefix?: (node: MenuNodeMeta) => ReactNode
  suffix?: (node: MenuNodeMeta) => ReactNode
}

/** 空的渲染函数表，缺省值共用这一份。 */
const NO_RENDERERS: MenuItemRenderers = {}

/** 根菜单传给各层子菜单的条目渲染函数。 */
const MenuItemRenderersContext = createContext<MenuItemRenderers>(NO_RENDERERS)

export interface XhMenuRootProps {
  /** 条目数据；提供后不必逐条放置部件。 */
  collection?: MenuNode[]
  checkboxValue?: string[]
  defaultCheckboxValue?: string[]
  radioValue?: MenuRadioValue
  defaultRadioValue?: MenuRadioValue
  open?: boolean
  defaultOpen?: boolean
  /** 外部锚点：给了就锚在它上面、收起时焦点归还到它，不再取 trigger；按数据铺设时不铺触发按钮。 */
  anchor?: HTMLElement | null
  placement?: Placement
  offset?: number
  loop?: boolean
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  tone?: Tone
  size?: Size
  /** 内容只按可用高度封顶，不叠 20rem 的固定上限。 */
  fitAvailableHeight?: boolean
  typeahead?: boolean
  disabled?: boolean
  translations?: Partial<MenuTranslations>
  openOnHover?: boolean
  hoverOpenDelay?: number
  hoverCloseDelay?: number
  /** 触发器中放置的内容；只提供 collection 时由它承载。 */
  trigger?: ReactNode
  /** 只提供 collection 时，trigger 给出的节点直接作为触发器使用，不再外包一个 button。 */
  triggerAsChild?: boolean
  /** 按数据铺设时触发按钮的文字；给了 trigger 时以它为准。 */
  label?: string
  /** 每个条目的自定义内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: MenuNodeMeta) => ReactNode
  /** 只接管条目行首那一格；其余槽仍由数据铺。 */
  renderItemPrefix?: (node: MenuNodeMeta) => ReactNode
  /** 只接管条目行尾那一格（计数、徽标、次级图标）；其余槽仍由数据铺。 */
  renderItemSuffix?: (node: MenuNodeMeta) => ReactNode
  onOpenChange?: MenuProps['onOpenChange']
  onItemSelect?: MenuProps['onItemSelect']
  onCheckboxValueChange?: MenuProps['onCheckboxValueChange']
  onRadioValueChange?: MenuProps['onRadioValueChange']
  children?: SlotChildren<MenuRootSlotProps>
}

export function XhMenuRoot({
  trigger,
  triggerAsChild,
  label,
  renderItem,
  renderItemPrefix,
  renderItemSuffix,
  children,
  ...props
}: XhMenuRootProps): ReactNode {
  // disabled 写成自有键：作者没写时，字段集压下来的作用域禁用也要落得进来
  const ctx = useMenu(withXhConfig('menu', { ...props, disabled: props.disabled }) as MenuProps)
  // 各层子菜单按数据铺条目时与本层同用这几个渲染函数
  const renderers = useMemo<MenuItemRenderers>(
    () => ({ item: renderItem, prefix: renderItemPrefix, suffix: renderItemSuffix }),
    [renderItem, renderItemPrefix, renderItemSuffix],
  )

  const body = children != null
    ? renderSlot(children, {
        open: ctx.api.open,
        setOpen: ctx.api.setOpen,
        checkboxValue: ctx.api.checkboxValue,
        radioValue: ctx.api.radioValue,
        setCheckboxValue: ctx.api.setCheckboxValue,
        setRadioValue: ctx.api.setRadioValue,
      })
    : renderDefaultStructure(ctx.api, renderers, { trigger, triggerAsChild, label, anchored: props.anchor !== undefined })

  return (
    <MenuProvider value={ctx}>
      <MenuItemRenderersContext.Provider value={renderers}>{body}</MenuItemRenderersContext.Provider>
    </MenuProvider>
  )
}

XhMenuRoot.xhEvents = ['open-change', 'item-select', 'checkbox-value-change', 'radio-value-change'] as const

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
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhMenuPositioner({ children, container, ...rest }: XhMenuPositionerProps): ReactNode {
  const ctx = useMenuContext()
  // 条目列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；浮层里的条子走 4px 档
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current, props: () => ({ size: 'sm' }) })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.portalSource} present={ctx.rendered}>
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
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
interface MenuItemImplProps extends ComponentPropsWithRef<'div'> {
  item: MenuAnyItemProps
}

function MenuItemImpl({ item, children, ...rest }: MenuItemImplProps): ReactNode {
  const ctx = useMenuContext()
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(item.value)
  const headlessProps = item.kind === 'checkbox'
    ? ctx.api.getCheckboxItemProps(item)
    : item.kind === 'radio'
      ? ctx.api.getRadioItemProps(item)
      : ctx.api.getItemProps(item)
  // 条目的聚焦上报与指针划过都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    headlessProps as Record<string, unknown>,
    ['onFocus', 'onPointerEnter', 'onPointerLeave'],
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

export function XhMenuItem({ value, disabled, children, ...rest }: XhMenuItemProps): ReactNode {
  const item = useMemo<MenuAnyItemProps>(() => ({ value, disabled, kind: 'item' }), [value, disabled])
  return <MenuItemImpl item={item} {...rest}>{children}</MenuItemImpl>
}

export interface XhMenuCheckboxItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'>, MenuCheckboxItemProps {}
export function XhMenuCheckboxItem({ value, disabled, closeOnSelect, children, ...rest }: XhMenuCheckboxItemProps): ReactNode {
  const item = useMemo<MenuAnyItemProps>(() => ({ value, disabled, closeOnSelect, kind: 'checkbox' }), [value, disabled, closeOnSelect])
  return <MenuItemImpl item={item} {...rest}>{children}</MenuItemImpl>
}

export interface XhMenuRadioItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'>, Omit<MenuRadioItemProps, 'group'> {}
export function XhMenuRadioItem({ value, disabled, closeOnSelect, children, ...rest }: XhMenuRadioItemProps): ReactNode {
  const group = useMenuGroupContext()
  const item = useMemo<MenuAnyItemProps>(() => ({ value, disabled, closeOnSelect, kind: 'radio', group: group.value }), [value, disabled, closeOnSelect, group.value])
  return <MenuItemImpl item={item} {...rest}>{children}</MenuItemImpl>
}

export interface XhMenuItemTextProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的文字载体：连打检索取它，图标与副文本的文字因此不进入检索串。 */
export function XhMenuItemText({ children, ...rest }: XhMenuItemTextProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenuItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 勾选与单选条目的对号，排在条目最后，纯装饰；行首的图标写在 XhMenuItemIcon 里。 */
export function XhMenuItemIndicator({ children, ...rest }: XhMenuItemIndicatorProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenuItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的副文本，排在文字下一行。 */
export function XhMenuItemDescription({ children, ...rest }: XhMenuItemDescriptionProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenuItemIconProps extends ComponentPropsWithRef<'span'> {}
/** 条目文字之前的图标格；装饰态，读屏从条目文字取意。 */
export function XhMenuItemIcon({ children, ...rest }: XhMenuItemIconProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIconProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenuItemShortcutProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的快捷键提示，贴行尾；纯装饰，读屏从条目文字取意。 */
export function XhMenuItemShortcut({ children, ...rest }: XhMenuItemShortcutProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemShortcutProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhMenuItemSuffixProps extends ComponentPropsWithRef<'span'> {}
/** 条目行尾的作者内容（计数、徽标、次级图标）；家族只管落位，不规定字号与颜色。 */
export function XhMenuItemSuffix({ children, ...rest }: XhMenuItemSuffixProps): ReactNode {
  const ctx = useMenuContext()
  const item = useMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemSuffixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
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

export interface XhMenuRadioGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
export function XhMenuRadioGroup({ value, children, ...rest }: XhMenuRadioGroupProps): ReactNode {
  const ctx = useMenuContext()
  const group = useMemo<MenuGroupProps>(() => ({ value }), [value])
  return (
    <MenuGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getRadioGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
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

/** 子菜单函数式 children 的载荷：该层子菜单自己的展开态与开合命令。 */
export type MenuSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

export interface XhMenuSubProps {
  /** 它在父菜单中的条目身份。 */
  value: string
  /** 按数据铺设时触发条目的文字；缺省取父菜单 collection 里这一条的 label。 */
  label?: string
  disabled?: boolean
  collection?: MenuNode[]
  checkboxValue?: string[]
  defaultCheckboxValue?: string[]
  radioValue?: MenuRadioValue
  defaultRadioValue?: MenuRadioValue
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
  /** 只按可用高度封顶；默认继承父层，理由同 tone。 */
  fitAvailableHeight?: boolean
  onCheckboxValueChange?: MenuProps['onCheckboxValueChange']
  onRadioValueChange?: MenuProps['onRadioValueChange']
  children?: SlotChildren<MenuSubSlotProps>
}

/**
 * 子菜单：内部再运行一台 menu 状态机（submenu 模式），触发条目由 XhMenuSubTrigger
 * 渲染为父菜单条目与本子菜单触发器的双重身份。本身不渲染节点。
 * 不给 children 时照标准结构铺自己那一层：触发条目、定位层与按 collection 铺的条目。
 */
export function XhMenuSub({ value, label, disabled, children, ...props }: XhMenuSubProps): ReactNode {
  const parent = useMenuContext()
  const ctx = useMenuWithParent({
    ...props,
    disabled,
    submenu: true,
    dir: props.dir ?? parent.service.prop('dir'),
    tone: props.tone ?? parent.service.prop('tone'),
    size: props.size ?? parent.service.prop('size'),
    fitAvailableHeight: props.fitAvailableHeight ?? parent.service.prop('fitAvailableHeight'),
  } as MenuProps, parent.tree)

  const handle = useMemo(() => ({ parent, value, disabled }), [parent, value, disabled])

  // 父层收起（Escape、外点、选中）时本层跟着收，层层传导
  const parentOpen = parent.api.open
  const setOpenRef = useRef(ctx.api.setOpen)
  setOpenRef.current = ctx.api.setOpen
  useEffect(() => {
    if (!parentOpen)
      setOpenRef.current(false)
  }, [parentOpen])

  const renderers = useContext(MenuItemRenderersContext)

  return (
    <MenuProvider value={ctx}>
      <MenuSubProvider value={handle}>
        {children != null
          ? renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })
          : renderSubStructure(ctx.api, parent.api, value, label, renderers)}
      </MenuSubProvider>
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

/** 按数据铺的条目：kind 取 collection 里这一条，勾选与单选条目各用自己的部件组件。 */
function MenuStructureItem({ value, children }: { value: string, children?: ReactNode }): ReactNode {
  const ctx = useMenuContext()
  const meta = ctx.api.collection.find(node => node.value === value)
  if (meta?.kind === 'checkbox')
    return <XhMenuCheckboxItem value={value} closeOnSelect={meta.closeOnSelect}>{children}</XhMenuCheckboxItem>
  if (meta?.kind === 'radio')
    return <XhMenuRadioItem value={value} closeOnSelect={meta.closeOnSelect}>{children}</XhMenuRadioItem>
  return <XhMenuItem value={value}>{children}</XhMenuItem>
}

/** 按数据铺的分组：组里有单选条目时是单选组。 */
function MenuStructureGroup({ value, children }: { value: string, children?: ReactNode }): ReactNode {
  const ctx = useMenuContext()
  return ctx.api.collection.some(node => node.kind === 'radio' && node.group === value)
    ? <XhMenuRadioGroup value={value}>{children}</XhMenuRadioGroup>
    : <XhMenuGroup value={value}>{children}</XhMenuGroup>
}

/** 根菜单借作者节点当触发器（triggerAsChild）。 */
function MenuAsChildTrigger({ children }: { children?: ReactNode }): ReactNode {
  return <XhMenuTrigger asChild>{children}</XhMenuTrigger>
}

/** 子菜单的触发条目：身份取子菜单上下文，结构写在节点上的 value 不落到 DOM。 */
function MenuStructureSubTrigger({ children }: { children?: ReactNode }): ReactNode {
  return <XhMenuSubTrigger>{children}</XhMenuSubTrigger>
}

/** 标准结构里各部件对应的组件。 */
const MENU_PARTS = {
  'trigger': XhMenuTrigger,
  'positioner': XhMenuPositioner,
  'content': XhMenuContent,
  'item': MenuStructureItem,
  'item-icon': XhMenuItemIcon,
  'item-text': XhMenuItemText,
  'item-indicator': XhMenuItemIndicator,
  'item-description': XhMenuItemDescription,
  'item-shortcut': XhMenuItemShortcut,
  'item-suffix': XhMenuItemSuffix,
  'separator': XhMenuSeparator,
  'group': MenuStructureGroup,
  'group-label': XhMenuGroupLabel,
}

/** 结构里组合进来的组件：带 children 的条目是嵌套的子菜单。 */
const MENU_INSTANCES = { menu: XhMenuSub, icon: XhIcon }

/** 条目三处渲染的接管：item 整条、item-prefix 行首、item-suffix 行尾，入参是这一条的元信息。 */
function itemContent(renderers: MenuItemRenderers, lookup: (value: string) => MenuNodeMeta | undefined): (node: StructureNode) => ReactNode | undefined {
  return (node) => {
    const name = node.slot?.name
    const render = name === 'item' ? renderers.item : name === 'item-prefix' ? renderers.prefix : name === 'item-suffix' ? renderers.suffix : undefined
    if (!render)
      return undefined
    const meta = (node.data as MenuNodeMeta | undefined) ?? lookup(node.slot!.key ?? '')
    return meta ? render(meta) : undefined
  }
}

function slottedBy(renderers: MenuItemRenderers): (name: string) => boolean {
  return name => (name === 'item' ? renderers.item : name === 'item-prefix' ? renderers.prefix : name === 'item-suffix' ? renderers.suffix : undefined) != null
}

/**
 * 未写 children 时照 menuStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 触发按钮的内容由 trigger 承载，没给时取 label；条目内容默认按数据铺，可由三处渲染函数逐槽接管。
 */
function renderDefaultStructure(
  api: MenuApi,
  renderers: MenuItemRenderers,
  trigger: { trigger?: ReactNode, triggerAsChild?: boolean, label?: string, anchored?: boolean },
): ReactNode[] {
  const slotted = slottedBy(renderers)
  const nodes = menuStructure(api, {
    ...(trigger.label === undefined ? {} : { label: trigger.label }),
    anchored: trigger.anchored ?? false,
    slotted: name => name === 'trigger' ? trigger.trigger != null : slotted(name),
  })
  const items = itemContent(renderers, value => api.collection.find(node => node.value === value))
  const parts = trigger.triggerAsChild ? { ...MENU_PARTS, trigger: MenuAsChildTrigger } : MENU_PARTS
  return renderStructure(nodes, parts, node => node.slot?.name === 'trigger' ? trigger.trigger : items(node), MENU_INSTANCES)
}

/** 子菜单那一层照 menuStructure 铺：触发条目的文字与 renderItem 的入参取父菜单里这一条。 */
function renderSubStructure(api: MenuApi, parent: MenuApi, value: string, label: string | undefined, renderers: MenuItemRenderers): ReactNode[] {
  const meta = parent.collection.find(node => node.value === value)
  const nodes = menuStructure(api, { submenu: true, value, label: label ?? meta?.label ?? value, slotted: slottedBy(renderers) })
  const lookup = (key: string): MenuNodeMeta | undefined => key === value ? meta : api.collection.find(node => node.value === key)
  return renderStructure(nodes, { ...MENU_PARTS, trigger: MenuStructureSubTrigger }, itemContent(renderers, lookup), MENU_INSTANCES)
}

/**
 * 子菜单那一层的条目：从本层机器的 collection 照 menuNodesStructure 现铺，条目带 children 的再往下一层。
 * Menubar 与 ContextMenu 按数据铺子层时用它。不作为公开组件导出。
 */
export function MenuDefaultNodes({ renderers = NO_RENDERERS }: { renderers?: MenuItemRenderers }): ReactNode {
  const ctx = useMenuContext()
  const api = ctx.api
  return (
    <MenuItemRenderersContext.Provider value={renderers}>
      {renderStructure(
        menuNodesStructure(api.collection, slottedBy(renderers)),
        MENU_PARTS,
        itemContent(renderers, value => api.collection.find(node => node.value === value)),
        MENU_INSTANCES,
      )}
    </MenuItemRenderersContext.Provider>
  )
}
