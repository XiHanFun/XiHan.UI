/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 scroll area 类型契约。

import type { Direction, Orientation, PropTypes, Service, Size } from '@xihan-ui/core'
import type { ScrollbarSchema, ScrollbarType } from '../scrollbar/scrollbar.types'

/** 归本组件管理的轴。被关闭的轴滚动条恒不显示，视口在该方向也不滚动。 */
export type ScrollAreaOrientation = Orientation | 'both'

/**
 * 形态档：plain 是默认，内容边缘齐平切断；
 * fade 在该端仍可滚动时把该侧内容淡出，滚到头即收起，带宽跟随 size。
 */
export type ScrollAreaVariant = 'plain' | 'fade'

/**
 * 滚动区域自身没有状态机：它只是视口加两条 scrollbar 的组装。滚动条的显隐、拖动、
 * 键盘与尺寸测量全在 scrollbar 的两台状态机中，这里按轴各运行一台。
 */
export interface ScrollAreaProps {
  /** 滚动条显示的时机，默认 scroll-hover。 */
  type?: ScrollbarType
  /** 收起前的等待毫秒（type 为 scroll / hover / scroll-hover 时生效），默认 600。 */
  hideDelay?: number
  /** 归本组件管理的轴，默认 both。 */
  orientation?: ScrollAreaOrientation
  /** 形态：plain / fade，默认 plain。 */
  variant?: ScrollAreaVariant
  /** 尺寸：sm / md / lg，影响滚动条厚度，也是边缘渐隐的带宽。 */
  size?: Size
  /**
   * 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻转。
   * 必须显式提供：组件不读取计算样式，无法感知从 RTL 祖先继承的方向。
   */
  dir?: Direction
  /** 触屏（粗指针）上也绘制自绘滚动条，默认 false：默认交给原生滚动。 */
  forceVisible?: boolean
}

/** 两条轴各一台 scrollbar 状态机；适配器创建后交给 connect。 */
export interface ScrollAreaServices {
  vertical: Service<ScrollbarSchema>
  horizontal: Service<ScrollbarSchema>
}

/** 滚动条的声明：轴向是作者在部件上的声明，connect 据此取对应的状态机，不反查 DOM。 */
export interface ScrollAreaScrollbarProps {
  orientation: Orientation
}

/** 一条轴对外的完整状态，各适配器的插槽都透出它。 */
export interface ScrollAreaAxisState {
  /** 内容比视口长。 */
  overflow: boolean
  /** 当前滚动条是否应显示（已把 type 与 orientation 都计算在内）。 */
  visible: boolean
  /** 滑块长度占轨道的比例，0-1。 */
  size: number
  /** 滑块起点占轨道的比例，0-1。 */
  offset: number
  /** 已贴着该轴的起始端，无法再向回滚动；内容不溢出时与 atMax 同时为真。 */
  atMin: boolean
  /** 已贴着该轴的末端。 */
  atMax: boolean
}

export interface ScrollAreaApi<T extends PropTypes = PropTypes> {
  type: ScrollbarType
  orientation: ScrollAreaOrientation
  vertical: ScrollAreaAxisState
  horizontal: ScrollAreaAxisState
  /** 正被拖动的轴；未拖动时为 null。 */
  draggingAxis: Orientation | null
  /** 右下角补丁是否应显示：两条滚动条同时在场才有它的位置。 */
  cornerVisible: boolean
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getContentProps: () => T['element']
  /** 某条轴的滚动条挂载点，同时充当该 scrollbar 的根节点。 */
  getScrollbarProps: (props: ScrollAreaScrollbarProps) => T['element']
  getTrackProps: (props: ScrollAreaScrollbarProps) => T['element']
  getThumbProps: (props: ScrollAreaScrollbarProps) => T['element']
  /** 交叉口补丁，写在竖条的挂载点中；只有两条都在场时才显示。 */
  getCornerProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ScrollAreaTranslations {}
