/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 float button 相关实现。

import type { ActionVariant, Direction, Size, Tone } from '@xihan-ui/core'
import type {
  FloatButtonApi,
  FloatButtonExpandTrigger,
  FloatButtonPlacement,
  FloatButtonProps,
  FloatButtonTranslations,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { FloatButtonProvider, useFloatButtonContext } from './context'
import { useFloatButton } from './use-float-button'

/** 函数式 children 的载荷：展开组当前是否显示，以及改写展开状态的动作。 */
export interface FloatButtonRootSlotProps extends Pick<FloatButtonApi, 'open' | 'setOpen'> {}

export interface XhFloatButtonRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  dir?: Direction
  placement?: FloatButtonPlacement
  offset?: number
  expandTrigger?: FloatButtonExpandTrigger
  variant?: ActionVariant
  tone?: Tone
  size?: Size
  translations?: Partial<FloatButtonTranslations>
  onOpenChange?: FloatButtonProps['onOpenChange']
  children?: SlotChildren<FloatButtonRootSlotProps>
}

/** 根节点是定位壳：把整组固定在视口一角，悬停展开时以进出它为准。 */
export function XhFloatButtonRoot({
  open,
  defaultOpen,
  disabled,
  dir,
  placement,
  offset,
  expandTrigger,
  variant,
  tone,
  size,
  translations,
  onOpenChange,
  children,
  ...rest
}: XhFloatButtonRootProps): ReactNode {
  const ctx = useFloatButton(withXhConfig('float-button', {
    open,
    defaultOpen,
    disabled,
    dir,
    placement,
    offset,
    expandTrigger,
    variant,
    tone,
    size,
    translations,
  }) as FloatButtonProps, { onOpenChange })
  // 悬停展开挂的是 pointerenter / pointerleave，两者都不冒泡：留在 React 的合成事件上
  // 收到的是从 pointerover / pointerout 合出来的那一档，直接派到壳上的事件到不了
  const bind = useNativeEvents(
    ctx.api.getRootProps() as Record<string, unknown>,
    ['onPointerEnter', 'onPointerLeave'],
  )
  return (
    <FloatButtonProvider value={ctx}>
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref }, { ref: ctx.rootRef })}>
        {renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })}
      </div>
    </FloatButtonProvider>
  )
}

XhFloatButtonRoot.xhEvents = ['open-change'] as const

export interface XhFloatButtonTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 原生 button：Enter / Space 的激活与 Tab 停靠都由平台提供。 */
export function XhFloatButtonTrigger({ children, ...rest }: XhFloatButtonTriggerProps): ReactNode {
  const ctx = useFloatButtonContext()
  return (
    <button {...mergeReactProps(ctx.api.getTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhFloatButtonListProps extends ComponentPropsWithRef<'div'> {}
/** 展开的动作组；收起时带 hidden，其中的按钮一并退出 Tab 序列。 */
export function XhFloatButtonList({ children, ...rest }: XhFloatButtonListProps): ReactNode {
  const ctx = useFloatButtonContext()
  return (
    <div {...mergeReactProps(ctx.api.getListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
