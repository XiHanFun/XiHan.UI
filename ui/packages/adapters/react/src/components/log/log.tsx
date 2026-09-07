import type { Size } from '@xihan-ui/core'
import type { LogApi, LogLevel, LogProps, LogSchema, LogTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { LogProvider, useLogContext } from './context'
import { useLog } from './use-log'

/** 函数式 children 的载荷：行数与载入态、粘底状态与按钮的露面情况，以及滚到底部的句柄。 */
export type LogRootSlotProps = Pick<
  LogApi,
  | 'rows'
  | 'loading'
  | 'atBottom'
  | 'sticking'
  | 'showScrollToEndTrigger'
  | 'scrollToBottom'
>

export interface XhLogRootProps {
  /** 视口按多少行定高；缺省时高度由皮肤给。 */
  rows?: number
  /** 行还在路上：日志区报 aria-busy，根落 data-loading。 */
  loading?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  translations?: Partial<LogTranslations>
  onStickChange?: LogSchema['props']['onStickChange']
  children?: SlotChildren<LogRootSlotProps>
}

export function XhLogRoot({ children, onStickChange, ...props }: XhLogRootProps): ReactNode {
  const ctx = useLog(withXhConfig('log', props) as LogProps, onStickChange)
  const { api } = ctx
  return (
    <LogProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
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
/** 把视口节点交给机器，由粘底句柄监听滚动。 */
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
/** 把内容节点交给机器，由粘底句柄观察尺寸。 */
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
  /** 这一行的级别，落成行上的 data-level。 */
  level?: LogLevel
}
/** 一行的文本与标注由作者写在 children 里。 */
export function XhLogLine({ level, children, ...rest }: XhLogLineProps): ReactNode {
  const ctx = useLogContext()
  return (
    <div {...mergeReactProps(ctx.api.getLineProps({ level }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhLogScrollToEndTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 收起时走 hidden 属性，节点不卸载；不给内容则由皮肤画兜底字形。 */
export function XhLogScrollToEndTrigger({ children, ...rest }: XhLogScrollToEndTriggerProps): ReactNode {
  const ctx = useLogContext()
  return (
    <button {...mergeReactProps(ctx.api.getScrollToEndTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhLogLiveRegionProps extends ComponentPropsWithRef<'div'> {}
/** 内容由宿主写入，念哪一句、什么时候念都归宿主定。 */
export function XhLogLiveRegion({ children, ...rest }: XhLogLiveRegionProps): ReactNode {
  const ctx = useLogContext()
  return (
    <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
