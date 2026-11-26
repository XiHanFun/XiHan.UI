/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timeline 相关实现。

import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { TimelineApi, TimelineNode, TimelinePlacement, TimelineProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectTimeline, timelineStructure } from '@xihan-ui/headless'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { renderStructure } from '../../runtime/structure'
import { TimelineItemProvider, TimelineProvider, useTimelineContext, useTimelineItemContext } from './context'

export interface XhTimelineRootProps extends ComponentPropsWithRef<'ol'> {
  /** 事件数据：不给 children 时按它铺出标准结构。 */
  collection?: readonly TimelineNode[]
  /** 方向，默认 vertical。 */
  orientation?: Orientation
  /** 侧别：内容与坐标排在线的哪一侧。 */
  placement?: TimelinePlacement
  /** 尺寸：sm / md / lg。 */
  size?: Size
}

/** 根渲染为 ol：事件本身有先后，列表标记由皮肤去除、列表语义由 role 保留。 */
export function XhTimelineRoot({ collection, orientation, placement, size, children, ...rest }: XhTimelineRootProps): ReactNode {
  const api = connectTimeline(
    withXhConfig('timeline', { collection, orientation, placement, size }) as TimelineProps,
    reactNormalize,
  )
  return (
    <TimelineProvider value={{ api }}>
      <ol {...mergeReactProps(api.getRootProps(), rest)}>
        {children ?? renderDefaultStructure(api)}
      </ol>
    </TimelineProvider>
  )
}

export interface XhTimelineItemProps extends ComponentPropsWithRef<'li'> {
  /** 该条的语气，只在本条内生效，下传给它自己的圆点。 */
  tone?: Tone
}

/** 一条事件。 */
export function XhTimelineItem({ tone, children, ...rest }: XhTimelineItemProps): ReactNode {
  const ctx = useTimelineContext()
  const item = useMemo(() => ({ tone }), [tone])
  return (
    <TimelineItemProvider value={item}>
      <li {...mergeReactProps(ctx.api.getItemProps(), rest)}>
        {children}
      </li>
    </TimelineItemProvider>
  )
}

export interface XhTimelineLabelProps extends ComponentPropsWithRef<'div'> {}

/** 该条的坐标（日期、版本号），与内容对置的一列。 */
export function XhTimelineLabel({ children, ...rest }: XhTimelineLabelProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <div {...mergeReactProps(ctx.api.getLabelProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhTimelineIndicatorProps extends ComponentPropsWithRef<'span'> {}

export function XhTimelineIndicator({ children, ...rest }: XhTimelineIndicatorProps): ReactNode {
  const ctx = useTimelineContext()
  const item = useTimelineItemContext()
  return (
    <span {...mergeReactProps(ctx.api.getIndicatorProps(item), rest)}>
      {children}
    </span>
  )
}

export interface XhTimelineConnectorProps extends ComponentPropsWithRef<'span'> {}

export function XhTimelineConnector({ children, ...rest }: XhTimelineConnectorProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <span {...mergeReactProps(ctx.api.getConnectorProps(), rest)}>
      {children}
    </span>
  )
}

export interface XhTimelineContentProps extends ComponentPropsWithRef<'div'> {}

export function XhTimelineContent({ children, ...rest }: XhTimelineContentProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhTimelineTitleProps extends ComponentPropsWithRef<'div'> {}

export function XhTimelineTitle({ children, ...rest }: XhTimelineTitleProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <div {...mergeReactProps(ctx.api.getTitleProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhTimelineDescriptionProps extends ComponentPropsWithRef<'div'> {}

export function XhTimelineDescription({ children, ...rest }: XhTimelineDescriptionProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <div {...mergeReactProps(ctx.api.getDescriptionProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhTimelineTimeProps extends ComponentPropsWithRef<'time'> {}

/** 渲染为 time：机读时间由作者写 datetime，属性原样透传到该节点上。 */
export function XhTimelineTime({ children, ...rest }: XhTimelineTimeProps): ReactNode {
  const ctx = useTimelineContext()
  return (
    <time {...mergeReactProps(ctx.api.getTimeProps(), rest)}>
      {children}
    </time>
  )
}

/** 按数据铺的时刻：结构节点上的机读时间是 DOM 写法 datetime，交给 React 时换成 dateTime。 */
function TimelineStructureTime({ datetime, ...rest }: XhTimelineTimeProps & { datetime?: string }): ReactNode {
  return <XhTimelineTime {...rest} dateTime={datetime} />
}

/** 标准结构里各部件对应的组件。 */
const TIMELINE_PARTS = {
  item: XhTimelineItem,
  label: XhTimelineLabel,
  indicator: XhTimelineIndicator,
  connector: XhTimelineConnector,
  content: XhTimelineContent,
  title: XhTimelineTitle,
  description: XhTimelineDescription,
  time: TimelineStructureTime,
}

/** 未给 children 时照 timelineStructure 铺开的事件流，与 Web Components 不写部件时元素生成的节点出自同一份。 */
function renderDefaultStructure(api: TimelineApi): ReactNode[] {
  return renderStructure(timelineStructure(api), TIMELINE_PARTS)
}
