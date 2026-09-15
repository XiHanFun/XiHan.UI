/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toast 相关实现。

import type { ToastApi, ToastSchema, ToastTone } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { ToastProvider, useToastContext } from './context'
import { useToast } from './use-toast'

type ToastProps = ToastSchema['props']

/** 函数式 children 的载荷：该条的身份、状态、计时剩余与生命周期方法。 */
export type ToastRootSlotProps = Pick<
  ToastApi,
  'id' | 'status' | 'tone' | 'loading' | 'paused' | 'remaining' | 'dismiss' | 'pause' | 'resume'
>

export interface XhToastRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 队列身份，不是 DOM id；未提供时回落到实例的 scope id。 */
  id?: string
  title?: string
  description?: string
  tone?: ToastTone
  loading?: boolean
  duration?: number
  removeDelay?: number
  closable?: boolean
  pauseOnPageIdle?: boolean
  /** 由宿主整组一起暂停计时；与指针、焦点等路径并存，最后一个释放后才继续。 */
  paused?: boolean
  translations?: ToastProps['translations']
  onStatusChange?: ToastProps['onStatusChange']
  onAction?: ToastProps['onAction']
  children?: SlotChildren<ToastRootSlotProps>
}

export function XhToastRoot({
  id,
  title,
  description,
  tone,
  loading,
  duration,
  removeDelay,
  closable,
  pauseOnPageIdle,
  paused,
  translations,
  onStatusChange,
  onAction,
  children,
  ...rest
}: XhToastRootProps): ReactNode {
  const ctx = useToast(withXhConfig('toast', {
    id,
    title,
    description,
    tone,
  loading,
    duration,
    removeDelay,
    closable,
    pauseOnPageIdle,
    paused,
    translations,
    onStatusChange,
    onAction,
  }) as ToastProps)
  const api = ctx.api
  // 指针进出改装成原生监听器：pointerenter / pointerleave 不冒泡，委派在根容器上的合成事件收不到。
  // 焦点那两路留给合成事件：连接层派的是 focusin / focusout，React 的 onFocus / onBlur 挂的正是它们，
  // 改装后名字会变回不冒泡的 focus / blur，条子内部的按钮得焦就按不住计时了
  const bind = useNativeEvents(api.getRootProps() as Record<string, unknown>, ['onPointerEnter', 'onPointerLeave'])
  return (
    <ToastProvider value={ctx}>
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
        {renderSlot(children, {
          id: api.id,
          status: api.status,
          tone: api.tone,
          loading: api.loading,
          paused: api.paused,
          remaining: api.remaining,
          dismiss: api.dismiss,
          pause: api.pause,
          resume: api.resume,
        })}
      </div>
    </ToastProvider>
  )
}

XhToastRoot.xhEvents = ['status-change', 'action'] as const

export interface XhToastIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 语气指示符：未提供内容时由皮肤按节点上的 data-tone 绘制兜底字形，data-loading 时换为加载指示。 */
export function XhToastIndicator({ children, ...rest }: XhToastIndicatorProps): ReactNode {
  const ctx = useToastContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhToastContentProps extends ComponentPropsWithRef<'div'> {}
/** 标题与可选说明的统一文本列。 */
export function XhToastContent({ children, ...rest }: XhToastContentProps): ReactNode {
  const ctx = useToastContext()
  return <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhToastTitleProps extends ComponentPropsWithRef<'div'> {}
export function XhToastTitle({ children, ...rest }: XhToastTitleProps): ReactNode {
  const ctx = useToastContext()
  // 渲染为 div 而非标题标签；作者没写内容时用 title prop 兜底
  return (
    <div {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ctx.api.title}
    </div>
  )
}

export interface XhToastDescriptionProps extends ComponentPropsWithRef<'div'> {}
export function XhToastDescription({ children, ...rest }: XhToastDescriptionProps): ReactNode {
  const ctx = useToastContext()
  return (
    <div {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ctx.api.description}
    </div>
  )
}

export interface XhToastActionTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 原生 button，激活行为交给平台。 */
export function XhToastActionTrigger({ children, ...rest }: XhToastActionTriggerProps): ReactNode {
  const ctx = useToastContext()
  return <button {...mergeReactProps(ctx.api.getActionTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhToastProgressProps extends ComponentPropsWithRef<'div'> {}
export function XhToastProgress({ children, ...rest }: XhToastProgressProps): ReactNode {
  const ctx = useToastContext()
  return <div {...mergeReactProps(ctx.api.getProgressProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhToastCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhToastCloseTrigger({ children, ...rest }: XhToastCloseTriggerProps): ReactNode {
  const ctx = useToastContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}
