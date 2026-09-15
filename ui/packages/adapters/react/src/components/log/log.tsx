/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 log 相关实现。

import type { Size } from '@xihan-ui/core'
import type { LogApi, LogLevel, LogProps, LogSchema, LogTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { LogProvider, useLogContext } from './context'
import { useLog } from './use-log'

/** 函数式 children 的载荷：行数与载入态、粘底状态与按钮的显示情况，以及滚动到底部的句柄。 */
export type LogRootSlotProps = Pick<
  LogApi,
  | 'rows'
  | 'loading'
  | 'atBottom'
  | 'sticking'
  | 'showScrollToEndTrigger'
  | 'scrollToBottom'
>

/** 根上自有的取值。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children'>

export interface XhLogRootProps extends RootElementProps {
  /** 视口按多少行定高；默认时高度由皮肤给出。 */
  rows?: number
  /** 行仍在加载：日志区报告 aria-busy，根写 data-loading。 */
  loading?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  translations?: Partial<LogTranslations>
  onStickChange?: LogSchema['props']['onStickChange']
  children?: SlotChildren<LogRootSlotProps>
}

export function XhLogRoot({
  rows,
  loading,
  size,
  translations,
  onStickChange,
  children,
  ...rest
}: XhLogRootProps): ReactNode {
  const ctx = useLog(withXhConfig('log', { rows, loading, size, translations }) as LogProps, onStickChange)
  const { api } = ctx
  return (
    <LogProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          rows: api.rows,
          loading: api.loading,
          atBottom: api.atBottom,
          sticking: api.sticking,
          showScrollToEndTrigger: api.showScrollToEndTrigger,
          scrollToBottom: api.scrollToBottom,
        })}
      </div>
    </LogProvider>
  )
}

XhLogRoot.xhEvents = ['stick-change'] as const

export interface XhLogViewportProps extends ComponentPropsWithRef<'div'> {}
/** 把视口节点交给状态机，由粘底句柄监听滚动。 */
export function XhLogViewport({ children, ...rest }: XhLogViewportProps): ReactNode {
  const ctx = useLogContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getViewportProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.viewportRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhLogContentProps extends ComponentPropsWithRef<'div'> {}
/** 把内容节点交给状态机，由粘底句柄观察尺寸。 */
export function XhLogContent({ children, ...rest }: XhLogContentProps): ReactNode {
  const ctx = useLogContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhLogLineProps extends ComponentPropsWithRef<'div'> {
  /** 该行的级别，写为行上的 data-level。 */
  level?: LogLevel
}
/** 一行的文本与标注由作者写在 children 中。 */
export function XhLogLine({ level, children, ...rest }: XhLogLineProps): ReactNode {
  const ctx = useLogContext()
  return (
    <div {...mergeReactProps(ctx.api.getLineProps({ level }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhLogScrollToEndTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 收起时使用 hidden 属性，节点不卸载；未提供内容时由皮肤绘制兜底字形。 */
export function XhLogScrollToEndTrigger({ children, ...rest }: XhLogScrollToEndTriggerProps): ReactNode {
  const ctx = useLogContext()
  return (
    <button {...mergeReactProps(ctx.api.getScrollToEndTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhLogLiveRegionProps extends ComponentPropsWithRef<'div'> {}
/** 内容由宿主写入，朗读哪句、何时朗读都由宿主决定。 */
export function XhLogLiveRegion({ children, ...rest }: XhLogLiveRegionProps): ReactNode {
  const ctx = useLogContext()
  return (
    <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
