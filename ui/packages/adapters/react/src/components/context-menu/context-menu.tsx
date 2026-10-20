/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context menu 相关实现。

import type { Direction, IconRecord, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  ContextMenuAnyItemProps,
  ContextMenuApi,
  ContextMenuCheckboxItemProps,
  ContextMenuGroupProps,
  ContextMenuNode,
  ContextMenuNodeMeta,
  ContextMenuRadioItemProps,
  ContextMenuRadioValue,
  ContextMenuSchema,
  MenuApi,
  MenuNode,
  MenuSchema,
  StructureNode,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { mergeProps } from '@xihan-ui/core'
import { contextMenuStructure } from '@xihan-ui/headless'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergePartProps, mergeReactProps, withoutScopeClass, withoutUndefined } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { XhIcon } from '../icon/icon'
import { MenuItemProvider, MenuProvider, useMenuContext } from '../menu/context'
import { MenuDefaultNodes, XhMenuContent, XhMenuItemIcon, XhMenuItemText, XhMenuPositioner } from '../menu/menu'
import { useMenuWithParent } from '../menu/use-menu'
import {
  ContextMenuGroupProvider,
  ContextMenuItemProvider,
  ContextMenuProvider,
  ContextMenuSubProvider,
  useContextMenuContext,
  useContextMenuGroupContext,
  useContextMenuItemContext,
  useContextMenuSubContext,
} from './context'
import { useContextMenu } from './use-context-menu'

type ContextMenuProps = ContextMenuSchema['props']

/** 函数式 children 的载荷：右键菜单的展开态与锚点坐标，以及开合、按坐标展开的命令。 */
export type ContextMenuRootSlotProps = Pick<ContextMenuApi, 'open' | 'point' | 'setOpen' | 'openAt' | 'checkboxValue' | 'radioValue' | 'setCheckboxValue' | 'setRadioValue'>

/** 子菜单函数式 children 的载荷：该层子菜单自己的展开态与开合命令。 */
export type ContextMenuSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

/** 代铺条目时可逐槽接管的三处渲染；三处都不给即完全按数据铺。 */
interface ContextMenuItemRenderers {
  item?: (node: ContextMenuNodeMeta) => ReactNode
  prefix?: (node: ContextMenuNodeMeta) => ReactNode
  suffix?: (node: ContextMenuNodeMeta) => ReactNode
}

export interface XhContextMenuRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'> {
  /** 条目数据；提供后不必逐条放置部件。 */
  collection?: ContextMenuNode[]
  checkboxValue?: string[]
  defaultCheckboxValue?: string[]
  radioValue?: ContextMenuRadioValue
  defaultRadioValue?: ContextMenuRadioValue
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  loop?: boolean
  typeahead?: boolean
  translations?: ContextMenuProps['translations']
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  /** 触摸与触控笔长按到弹出的毫秒数。 */
  longPressDelay?: number
  /** 整张菜单禁用：不再展开，浏览器自己的右键菜单照常出现。 */
  disabled?: boolean
  tone?: Tone
  size?: Size
  /** 触发区中放置的内容；不给 children 时由标准结构的触发区承载。 */
  trigger?: ReactNode
  /** 每个条目的自定义内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: ContextMenuNodeMeta) => ReactNode
  /** 只接管条目行首那一格；其余槽仍由数据铺。 */
  renderItemPrefix?: (node: ContextMenuNodeMeta) => ReactNode
  /** 只接管条目行尾那一格（计数、徽标、次级图标）；其余槽仍由数据铺。 */
  renderItemSuffix?: (node: ContextMenuNodeMeta) => ReactNode
  onOpenChange?: ContextMenuProps['onOpenChange']
  onItemSelect?: ContextMenuProps['onItemSelect']
  onCheckboxValueChange?: ContextMenuProps['onCheckboxValueChange']
  onRadioValueChange?: ContextMenuProps['onRadioValueChange']
  children?: SlotChildren<ContextMenuRootSlotProps>
}

export function XhContextMenuRoot({
  collection,
  checkboxValue,
  defaultCheckboxValue,
  radioValue,
  defaultRadioValue,
  open,
  defaultOpen,
  placement,
  offset,
  loop,
  typeahead,
  translations,
  dir,
  longPressDelay,
  disabled,
  tone,
  size,
  trigger,
  renderItem,
  renderItemPrefix,
  renderItemSuffix,
  onOpenChange,
  onItemSelect,
  onCheckboxValueChange,
  onRadioValueChange,
  children,
  ...rest
}: XhContextMenuRootProps): ReactNode {
  const ctx = useContextMenu(withXhConfig('context-menu', {
    collection,
    checkboxValue,
    defaultCheckboxValue,
    radioValue,
    defaultRadioValue,
    open,
    defaultOpen,
    placement,
    offset,
    loop,
    typeahead,
    translations,
    dir,
    longPressDelay,
    disabled,
    tone,
    size,
    onOpenChange,
    onItemSelect,
    onCheckboxValueChange,
    onRadioValueChange,
  }) as ContextMenuProps)

  const body = children != null
    ? renderSlot(children, {
        open: ctx.api.open,
        point: ctx.api.point,
        setOpen: ctx.api.setOpen,
        openAt: ctx.api.openAt,
        checkboxValue: ctx.api.checkboxValue,
        radioValue: ctx.api.radioValue,
        setCheckboxValue: ctx.api.setCheckboxValue,
        setRadioValue: ctx.api.setRadioValue,
      })
    : renderDefaultStructure(ctx.api, trigger, { item: renderItem, prefix: renderItemPrefix, suffix: renderItemSuffix })

  return (
    <ContextMenuProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{body}</div>
    </ContextMenuProvider>
  )
}

XhContextMenuRoot.xhEvents = ['open-change', 'item-select', 'checkbox-value-change', 'radio-value-change'] as const

export interface XhContextMenuTriggerProps extends ComponentPropsWithRef<'div'>, AsChildProps {}
/** 触发区渲染为 div，语义由 connect 写入的 ARIA 属性给出。 */
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
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhContextMenuPositioner({ children, container, ...rest }: XhContextMenuPositionerProps): ReactNode {
  const ctx = useContextMenuContext()
  // 条目列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  // 浮层里的条子走 4px 档
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current, props: () => ({ size: 'sm' }) })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef} present={ctx.rendered}>
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
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
interface ContextMenuItemImplProps extends ComponentPropsWithRef<'div'> {
  item: ContextMenuAnyItemProps
}
function ContextMenuItemImpl({ item, children, ...rest }: ContextMenuItemImplProps): ReactNode {
  const ctx = useContextMenuContext()
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

export function XhContextMenuItem({ value, disabled, children, ...rest }: XhContextMenuItemProps): ReactNode {
  const item = useMemo<ContextMenuAnyItemProps>(() => ({ value, disabled, kind: 'item' }), [value, disabled])
  return <ContextMenuItemImpl item={item} {...rest}>{children}</ContextMenuItemImpl>
}

export interface XhContextMenuCheckboxItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'>, ContextMenuCheckboxItemProps {}
export function XhContextMenuCheckboxItem({ value, disabled, closeOnSelect, children, ...rest }: XhContextMenuCheckboxItemProps): ReactNode {
  const item = useMemo<ContextMenuAnyItemProps>(() => ({ value, disabled, closeOnSelect, kind: 'checkbox' }), [value, disabled, closeOnSelect])
  return <ContextMenuItemImpl item={item} {...rest}>{children}</ContextMenuItemImpl>
}

export interface XhContextMenuRadioItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'>, Omit<ContextMenuRadioItemProps, 'group'> {}
export function XhContextMenuRadioItem({ value, disabled, closeOnSelect, children, ...rest }: XhContextMenuRadioItemProps): ReactNode {
  const group = useContextMenuGroupContext()
  const item = useMemo<ContextMenuAnyItemProps>(() => ({ value, disabled, closeOnSelect, kind: 'radio', group: group.value }), [value, disabled, closeOnSelect, group.value])
  return <ContextMenuItemImpl item={item} {...rest}>{children}</ContextMenuItemImpl>
}

export interface XhContextMenuItemTextProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的文字载体：连打检索取它，标记位与副文本的文字因此不进入检索串。 */
export function XhContextMenuItemText({ children, ...rest }: XhContextMenuItemTextProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useContextMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhContextMenuItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 勾选与单选条目的对号，排在条目最后，纯装饰；行首的图标写在 XhContextMenuItemIcon 里。 */
export function XhContextMenuItemIndicator({ children, ...rest }: XhContextMenuItemIndicatorProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useContextMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhContextMenuItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的副文本，排在文字下一行。 */
export function XhContextMenuItemDescription({ children, ...rest }: XhContextMenuItemDescriptionProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useContextMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhContextMenuItemIconProps extends ComponentPropsWithRef<'span'> {}
/** 条目文字之前的图标格；装饰态，读屏从条目文字取意。 */
export function XhContextMenuItemIcon({ children, ...rest }: XhContextMenuItemIconProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useContextMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIconProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhContextMenuItemShortcutProps extends ComponentPropsWithRef<'span'> {}
/** 条目中的快捷键提示，贴行尾；纯装饰，读屏从条目文字取意。 */
export function XhContextMenuItemShortcut({ children, ...rest }: XhContextMenuItemShortcutProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useContextMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemShortcutProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhContextMenuItemSuffixProps extends ComponentPropsWithRef<'span'> {}
/** 条目行尾的作者内容（计数、徽标、次级图标）；家族只管落位，不规定字号与颜色。 */
export function XhContextMenuItemSuffix({ children, ...rest }: XhContextMenuItemSuffixProps): ReactNode {
  const ctx = useContextMenuContext()
  const item = useContextMenuItemContext()
  return <span {...mergeReactProps(ctx.api.getItemSuffixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
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

export interface XhContextMenuRadioGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
export function XhContextMenuRadioGroup({ value, children, ...rest }: XhContextMenuRadioGroupProps): ReactNode {
  const ctx = useContextMenuContext()
  const group = useMemo<ContextMenuGroupProps>(() => ({ value }), [value])
  return (
    <ContextMenuGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getRadioGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
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
  /** 它在父右键菜单中的条目身份。 */
  value: string
  /** 按数据铺设时触发条目的文字；缺省取父层 collection 里这一条的 label。 */
  label?: string
  /** 按数据铺设时触发条目的图标；缺省取父层 collection 里这一条的 icon。 */
  icon?: IconRecord
  disabled?: boolean
  collection?: MenuNode[]
  checkboxValue?: string[]
  defaultCheckboxValue?: string[]
  radioValue?: ContextMenuRadioValue
  defaultRadioValue?: ContextMenuRadioValue
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
  onCheckboxValueChange?: MenuSchema['props']['onCheckboxValueChange']
  onRadioValueChange?: MenuSchema['props']['onRadioValueChange']
  children?: SlotChildren<ContextMenuSubSlotProps>
}

/**
 * 右键菜单中的子菜单：子层运行一台 submenu 模式的 menu 状态机，触发条目由
 * XhContextMenuSubTrigger 渲染为父层条目与子层触发器的双重身份。
 * 子层内部使用 XhMenu 系部件。本身不渲染节点。
 * 不给 children 时照标准结构铺自己那一层：触发条目、定位层与按 collection 铺的条目。
 */
export function XhContextMenuSub({ value, label, icon, disabled, children, ...props }: XhContextMenuSubProps): ReactNode {
  const parent = useContextMenuContext()
  const sub = useMenuWithParent({
    ...props,
    disabled,
    submenu: true,
    dir: props.dir ?? parent.service.prop('dir'),
    tone: props.tone ?? parent.service.prop('tone'),
    size: props.size ?? parent.service.prop('size'),
  }, parent.tree)

  const handle = useMemo(() => ({ parent, value, disabled }), [parent, value, disabled])
  // 父层收起（Escape、外点、选中）时本层跟着收，层层传导
  const parentOpen = parent.api.open
  const setOpenRef = useRef(sub.api.setOpen)
  setOpenRef.current = sub.api.setOpen
  useEffect(() => {
    if (!parentOpen)
      setOpenRef.current(false)
  }, [parentOpen])

  const entryIcon = icon ?? parent.api.collection.find(node => node.value === value)?.icon
  return (
    <MenuProvider value={sub}>
      <ContextMenuSubProvider value={handle}>
        {children != null
          ? renderSlot(children, { open: sub.api.open, setOpen: sub.api.setOpen })
          : (
              <>
                <XhContextMenuSubTrigger>
                  {entryIcon ? <XhMenuItemIcon><XhIcon icon={entryIcon} /></XhMenuItemIcon> : null}
                  <XhMenuItemText>{label ?? parent.api.collection.find(node => node.value === value)?.label ?? value}</XhMenuItemText>
                </XhContextMenuSubTrigger>
                <XhMenuPositioner>
                  <XhMenuContent>
                    <MenuDefaultNodes />
                  </XhMenuContent>
                </XhMenuPositioner>
              </>
            )}
      </ContextMenuSubProvider>
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
      // 子层的挂载类让给父层：节点只认父层那一个 scope，两个挂载类都挂着，菜单条目的皮肤也会落到它身上
      withoutScopeClass(sub.api.getSubmenuTriggerProps(item) as Record<string, unknown>),
      // 父层没给的键不盖掉子层给的：子层的 data-state、aria-expanded 等照留
      withoutUndefined(handle.parent.api.getItemProps(item) as Record<string, unknown>),
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
      <MenuItemProvider value={item}>{children}</MenuItemProvider>
    </div>
  )
}

/** 按数据铺的条目：kind 取 collection 里这一条，勾选与单选条目各用自己的部件组件。 */
function ContextMenuStructureItem({ value, children }: { value: string, children?: ReactNode }): ReactNode {
  const ctx = useContextMenuContext()
  const meta = ctx.api.collection.find(node => node.value === value)
  if (meta?.kind === 'checkbox')
    return <XhContextMenuCheckboxItem value={value} closeOnSelect={meta.closeOnSelect}>{children}</XhContextMenuCheckboxItem>
  if (meta?.kind === 'radio')
    return <XhContextMenuRadioItem value={value} closeOnSelect={meta.closeOnSelect}>{children}</XhContextMenuRadioItem>
  return <XhContextMenuItem value={value}>{children}</XhContextMenuItem>
}

/** 按数据铺的分组：组里有单选条目时是单选组。 */
function ContextMenuStructureGroup({ value, children }: { value: string, children?: ReactNode }): ReactNode {
  const ctx = useContextMenuContext()
  return ctx.api.collection.some(node => node.kind === 'radio' && node.group === value)
    ? <XhContextMenuRadioGroup value={value}>{children}</XhContextMenuRadioGroup>
    : <XhContextMenuGroup value={value}>{children}</XhContextMenuGroup>
}

/** 标准结构里各部件对应的组件。 */
const CONTEXT_MENU_PARTS = {
  'trigger': XhContextMenuTrigger,
  'positioner': XhContextMenuPositioner,
  'content': XhContextMenuContent,
  'item': ContextMenuStructureItem,
  'item-icon': XhContextMenuItemIcon,
  'item-text': XhContextMenuItemText,
  'item-indicator': XhContextMenuItemIndicator,
  'item-description': XhContextMenuItemDescription,
  'item-shortcut': XhContextMenuItemShortcut,
  'item-suffix': XhContextMenuItemSuffix,
  'separator': XhContextMenuSeparator,
  'group': ContextMenuStructureGroup,
  'group-label': XhContextMenuGroupLabel,
}

/** 结构里组合进来的组件：带 children 的条目是嵌套的子菜单。 */
const CONTEXT_MENU_INSTANCES = { menu: XhContextMenuSub, icon: XhIcon }

/**
 * 未写 children 时照 contextMenuStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 触发区的内容归作者（trigger）；条目文字、行首、行尾可由三个渲染函数逐槽接管，其余照数据铺。
 */
function renderDefaultStructure(api: ContextMenuApi, trigger: ReactNode, renderers: ContextMenuItemRenderers): ReactNode[] {
  const slotted = (name: string): boolean => name === 'trigger'
    ? trigger != null
    : (name === 'item' ? renderers.item : name === 'item-prefix' ? renderers.prefix : name === 'item-suffix' ? renderers.suffix : undefined) != null
  return renderStructure(contextMenuStructure(api, { slotted }), CONTEXT_MENU_PARTS, (node: StructureNode) => {
    const name = node.slot?.name
    if (name === 'trigger')
      return trigger
    const render = name === 'item' ? renderers.item : name === 'item-prefix' ? renderers.prefix : name === 'item-suffix' ? renderers.suffix : undefined
    if (!render)
      return undefined
    const meta = (node.data as ContextMenuNodeMeta | undefined) ?? api.collection.find(item => item.value === node.slot!.key)
    return meta ? render(meta) : undefined
  }, CONTEXT_MENU_INSTANCES)
}
