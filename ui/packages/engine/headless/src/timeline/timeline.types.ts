/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 timeline 类型契约。

import type { Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 内容位于线的哪一侧。
 * start / end 是整条时间线统一一侧，alternate 是逐条左右（或上下）交替。
 */
export type TimelinePlacement = 'start' | 'end' | 'alternate'

export interface TimelineProps {
  /** 事件排列方向：vertical 自上而下、horizontal 自起点向终点，默认 vertical。 */
  orientation?: Orientation
  /** 内容位于线的哪一侧：start / end / alternate，未提供时内容落在结束侧。 */
  placement?: TimelinePlacement
  /** 尺寸：sm / md / lg，决定圆点直径、条目间距与字号。 */
  size?: Size
}

/**
 * 条目的声明。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TimelineItemProps {
  /** 该条的语气：brand / neutral / success / warning / danger / info，只作用于该条的圆点。 */
  tone?: Tone
}

export interface TimelineApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: () => T['element']
  /** 与内容对置的一列，放置该条的坐标；排布随整条线的方向与侧别变化。 */
  getLabelProps: () => T['element']
  /** 圆点的语气取自它所属的条目。 */
  getIndicatorProps: (props: TimelineItemProps) => T['element']
  getConnectorProps: () => T['element']
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getTimeProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface TimelineTranslations {}
