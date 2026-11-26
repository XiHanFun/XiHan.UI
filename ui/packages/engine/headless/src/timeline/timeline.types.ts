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

/**
 * 一条事件的数据。各字段与同名部件一一对应：给了哪一项才铺哪一块。
 * 时间线只读，条目身份写 value；不写时按下标认。
 */
export interface TimelineNode {
  /** 条目身份，同一条时间线里唯一；不写时取下标。 */
  value?: string
  /** 与内容对置的那一列：这一条的坐标（日期、版本号）。 */
  label?: string
  /** 时刻文本，铺进 time。 */
  time?: string
  /** time 的机读时间（`<time datetime>`）；组件拿不到时区与精度，不代填，给了才写。 */
  datetime?: string
  /** 事件标题。 */
  title?: string
  /** 标题下的说明。 */
  description?: string
  /** 该条的语气，只为该条的圆点上色。 */
  tone?: Tone
}

/** 一条事件的元信息，由 collection 推导。 */
export interface TimelineNodeMeta extends Omit<TimelineNode, 'value'> {
  /** node.value，没写时为下标，恒为字符串。 */
  value: string
  /** 第几条，0 起。 */
  index: number
}

export interface TimelineProps {
  /**
   * 事件数据：给了且不写结构时（Vue 不写默认插槽、React 不给 children、Web Components 只写 root）按它铺出标准结构。
   * 作者手写结构时不读它。
   */
  collection?: readonly TimelineNode[]
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
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly TimelineNodeMeta[]
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
