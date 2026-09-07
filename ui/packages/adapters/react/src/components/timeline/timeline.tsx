import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { TimelinePlacement, TimelineProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectTimeline } from '@xihan-ui/headless'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { TimelineItemProvider, TimelineProvider, useTimelineContext, useTimelineItemContext } from './context'

export interface XhTimelineRootProps extends ComponentPropsWithRef<'ol'> {
  /** 方向，缺省 vertical。 */
  orientation?: Orientation
  /** 侧别：内容与坐标排在线的哪一侧。 */
  placement?: TimelinePlacement
  /** 尺寸：sm / md / lg。 */
  size?: Size
}

/** 根渲染为 ol：事件本来就有先后，列表标记由皮肤抹掉、列表语义由 role 兜住。 */
export function XhTimelineRoot({ orientation, placement, size, children, ...rest }: XhTimelineRootProps): ReactNode {
  const api = connectTimeline(
    withXhConfig('timeline', { orientation, placement, size }) as TimelineProps,
    reactNormalize,
  )
  return (
    <TimelineProvider value={{ api }}>
      <ol {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </ol>
    </TimelineProvider>
  )
}

export interface XhTimelineItemProps extends ComponentPropsWithRef<'li'> {
  /** 这一条的语气，只在本条内生效，下传给它自己的圆点。 */
  tone?: Tone
}

/** 一条事件。 */
export function XhTimelineItem({ tone, children, ...rest }: XhTimelineItemProps): ReactNode {
  const ctx = useTimelineContext()
  const item = useMemo(() => ({ tone }), [tone])
  return (
    <TimelineItemProvider value={item}>
      <li {...mergeReactProps(ctx.api.getItemProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </li>
    </TimelineItemProvider>
  )
}

export interface XhTimelineLabelProps extends ComponentPropsWithRef<'div'> {}

/** 这一条的坐标（日期、版本号），与内容对置的那一列。 */
export function XhTimelineLabel({ children, ...rest }: XhTimelineLabelProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <div {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhTimelineIndicatorProps extends ComponentPropsWithRef<'span'> {}

export function XhTimelineIndicator({ children, ...rest }: XhTimelineIndicatorProps): ReactNode {
  const ctx = useTimelineContext()
  const item = useTimelineItemContext()
  return (
    <span {...mergeReactProps(ctx.api.getIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhTimelineConnectorProps extends ComponentPropsWithRef<'span'> {}

export function XhTimelineConnector({ children, ...rest }: XhTimelineConnectorProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <span {...mergeReactProps(ctx.api.getConnectorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhTimelineContentProps extends ComponentPropsWithRef<'div'> {}

export function XhTimelineContent({ children, ...rest }: XhTimelineContentProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhTimelineTitleProps extends ComponentPropsWithRef<'div'> {}

export function XhTimelineTitle({ children, ...rest }: XhTimelineTitleProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <div {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhTimelineDescriptionProps extends ComponentPropsWithRef<'div'> {}

export function XhTimelineDescription({ children, ...rest }: XhTimelineDescriptionProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <div {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhTimelineTimeProps extends ComponentPropsWithRef<'time'> {}

/** 渲染为 time：机读时间由作者写 datetime，属性原样透传到这个节点上。 */
export function XhTimelineTime({ children, ...rest }: XhTimelineTimeProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <time {...mergeReactProps(ctx.api.getTimeProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </time>
  )
}
