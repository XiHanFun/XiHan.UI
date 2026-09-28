/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toolbar 相关实现。

import type { ControlVariant, Direction, Orientation, Size } from '@xihan-ui/core'
import type { ToolbarApi, ToolbarSchema, ToolbarTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { toolbarOverflowMenuProps } from '@xihan-ui/headless'
import { createElement, useEffect, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { XhMenuRoot } from '../menu/menu'
import { ToolbarProvider, useToolbarContext } from './context'
import { useToolbar } from './use-toolbar'

type ToolbarProps = ToolbarSchema['props']

/** 函数式 children 的载荷：焦点锚点、生效的主轴与整条工具条的禁用态。 */
export type ToolbarRootSlotProps = Pick<ToolbarApi, 'focusedValue' | 'orientation' | 'disabled'>

export interface XhToolbarRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  orientation?: Orientation
  dir?: Direction
  loop?: boolean
  disabled?: boolean
  variant?: ControlVariant
  size?: Size
  translations?: Partial<ToolbarTranslations>
  children?: SlotChildren<ToolbarRootSlotProps>
}

// 无对外事件：条目的点击与切换由条目自行派发
export function XhToolbarRoot({
  orientation,
  dir,
  loop,
  disabled,
  variant,
  size,
  translations,
  children,
  ...rest
}: XhToolbarRootProps): ReactNode {
  const ctx = useToolbar(withXhConfig('toolbar', { orientation, dir, loop, disabled, variant, size, translations }) as ToolbarProps)
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，条目得焦也会把它叫起来，那一下会把焦点从条目抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致。onFocusOut 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(ctx.api.getRootProps() as Record<string, unknown>, ['onFocus'])
  return (
    <ToolbarProvider value={ctx}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (el: HTMLElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {renderSlot(children, {
          focusedValue: ctx.api.focusedValue,
          orientation: ctx.api.orientation,
          disabled: ctx.api.disabled,
        })}
      </div>
    </ToolbarProvider>
  )
}

export interface XhToolbarGroupProps extends ComponentPropsWithRef<'div'> {}
export function XhToolbarGroup({ children, ...rest }: XhToolbarGroupProps): ReactNode {
  const ctx = useToolbarContext()
  return <div {...mergeReactProps(ctx.api.getGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhToolbarSeparatorProps extends ComponentPropsWithRef<'div'> {}
/** 分隔线不渲染内容。 */
export function XhToolbarSeparator({ ...rest }: XhToolbarSeparatorProps): ReactNode {
  const ctx = useToolbarContext()
  return <div {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhToolbarItemProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  value: string
  disabled?: boolean
  /** 条目渲染为哪个标签，默认 button；不自动补 type="button"，表单内需自行声明。 */
  as?: ElementType
}
export function XhToolbarItem({ value, disabled, as = 'button', children, ...rest }: XhToolbarItemProps): ReactNode {
  const ctx = useToolbarContext()
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)
  // 条目的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getItemProps({ value, disabled }) as Record<string, unknown>,
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

  // 卸载时上报工具条失焦：按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'TOOLBAR.BLUR' })
  }, [ctx.service])

  return createElement(
    as,
    mergeReactProps(
      bind.attrs,
      rest as Record<string, unknown>,
      { ref: bind.ref },
      { ref: (el: HTMLElement | null) => { itemEl.current = el } },
    ),
    children,
  )
}

export interface XhToolbarOverflowTriggerProps extends ComponentPropsWithRef<'button'> {}
/**
 * 行尾的「更多」钮：放不下的条目按次序收进它弹出的菜单，全部放得下时它收着。
 * 放在 root 的最后。它同时是一张 Menu 的触发器——菜单的条目、勾选态与落位都由工具条的机器现给
 * （toolbarOverflowMenuProps），钮按 asChild 接菜单的开合接线，自己的解剖与工具条的处理器不让位。
 * 不写内容时由皮肤画一枚横排三点。
 */
export function XhToolbarOverflowTrigger({ children, ...rest }: XhToolbarOverflowTriggerProps): ReactNode {
  const ctx = useToolbarContext()
  // 钮的聚焦上报不冒泡，与条目一样改装成原生监听器
  const bind = useNativeEvents(ctx.api.getOverflowTriggerProps() as Record<string, unknown>, ['onFocus'])
  const trigger = (
    <button {...mergePartProps(mergeReactProps(bind.attrs, { ref: bind.ref }), rest as Record<string, unknown>)}>
      {children}
    </button>
  )
  return <XhMenuRoot {...toolbarOverflowMenuProps(ctx.service)} triggerAsChild trigger={trigger} />
}
