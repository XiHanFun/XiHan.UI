/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 carousel 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes } from '@xihan-ui/core'
import type { MultiPointerSession } from '@xihan-ui/pointer'

/** 暂停自动播放的来源。可同时存在多个暂停，最后一个解除后才继续。 */
export type CarouselPauseSource = 'pointer' | 'focus' | 'api'

export interface CarouselPageChangeDetails {
  /** 变化后的页码，0 基，恒在 [0, totalPages - 1] 内。 */
  page: number
}

/**
 * 条目声明的身份：下标由作者在部件上声明，connect 据此产出属性。
 * connect 在 render 期求值，此时 DOM 尚不存在，不得读取 DOM。
 */
export interface CarouselItemProps {
  /** 条目下标，0 基。 */
  index: number
}

export interface CarouselIndicatorProps {
  /** 指示点对应的页码，0 基。一页一个。 */
  index: number
}

/** 读屏文案。默认英文，与 dialog / pagination 的 translations 写法一致。 */
export interface CarouselTranslations {
  /** 根节点（region 地标）的名字。 */
  root: string
  prevTrigger: string
  nextTrigger: string
  /** 自动播放开关停止时的名字（按下开始播放）。 */
  autoplayTriggerPlay: string
  /** 自动播放开关播放中的名字（按下停止）。 */
  autoplayTriggerPause: string
  /** 指示点容器的名字。 */
  indicatorGroup: string
  /** 指示点按钮文案，入参为 1 基页码。 */
  indicator: (page: number) => string
  /**
   * 条目文案，入参为 1 基张号与总张数。
   * 默认只提供 "1 of 6"：条目上已有 aria-roledescription="slide"，文案中不再重复。
   */
  item: (index: number, count: number) => string
}

export interface CarouselSchema extends MachineSchema {
  props: {
    /**
     * 当前页，0 基。提供即受控：内部不再自行修改，只发 onPageChange。
     * 页不等于张：一页可能同时显示多张（见 slidesPerPage）。
     */
    page?: number
    /** 非受控初始页，默认 0。 */
    defaultPage?: number
    /** 条目总数，由作者声明，不从 DOM 统计。 */
    slideCount?: number
    /** 一屏显示的张数，默认 1。 */
    slidesPerPage?: number
    /** 一次翻动的张数，默认跟随 slidesPerPage（整屏翻页）。 */
    slidesPerMove?: number
    /** 轨道方向，默认 horizontal；方向键的轴随之变化。 */
    orientation?: Orientation
    /**
     * 文字方向。水平轴上同时作用于排版与位移方向：rtl 下下一张在左侧，
     * 轨道也向正方向位移。纵向轨道不受影响。
     */
    dir?: Direction
    /** 到达末尾是否回绕，默认 false。 */
    loop?: boolean
    /**
     * 自动播放。true 使用默认间隔，数值即毫秒间隔；未提供 / false / 非正数一律不自动播放。
     * 指针悬停或轮播内任一节点获得焦点时暂停计时，离开后重新计满一个完整间隔再翻页。
     *
     * 减弱动效档下不自动起播：提供间隔也停在 idle，需要由用户按下播放开关。
     */
    autoplay?: boolean | number
    /**
     * 允许指针拖拽切页，默认 false。鼠标、触摸、触控笔一并门控。
     * 开启后沿轨道轴的原生滚动让位给拖拽，关闭则完全没有拖拽、触摸使用原生滚动。
     */
    allowPointerDrag?: boolean
    /** 张与张之间的间距，任意 CSS 长度（如 '12px'）。落为条目自身的内边距，不影响位移计算。 */
    spacing?: string
    translations?: Partial<CarouselTranslations>
    /** 页码变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onPageChange?: (details: CarouselPageChangeDetails) => void
  }
  context: {
    /** 当前页，0 基。受控（page 提供）时 cell 直读 prop，写入只发 onPageChange 不修改内部值。 */
    page: number
    /** 当前暂停自动播放的来源集合，空集即计时进行中。 */
    pausedBy: CarouselPauseSource[]
    /** 本次拖拽的起点坐标（沿轨道轴），null 即当前未在拖拽。 */
    dragStart: number | null
    /** 本次拖拽已产生的像素位移，连接层把它叠加进轨道位移，画面才能跟随手势。 */
    dragOffset: number
  }
  computed: Record<string, never>
  refs: {
    /** 跟随在轨道上划动的指针。整个生命周期存在，状态机停止时移除。 */
    gesture: MultiPointerSession | null
  }
  /** 自动播放是唯一有阶段可分的部分：运行 / 暂停 / 未开启。翻页本身存放在 context 的 cell 中。 */
  state: 'idle' | 'playing' | 'playing.running' | 'playing.paused'
  event:
    | { type: 'PAGE.SET', page: number }
    | { type: 'PAGE.PREV' }
    | { type: 'PAGE.NEXT' }
    /** 开始自动播放（autoplay prop 开启，或调用方主动 play）。间隔非正数时不生效。 */
    | { type: 'AUTOPLAY.START' }
    /** 停止自动播放，一并清空暂停来源。 */
    | { type: 'AUTOPLAY.STOP' }
    | { type: 'AUTOPLAY.PAUSE', src: CarouselPauseSource }
    | { type: 'AUTOPLAY.RESUME', src: CarouselPauseSource }
    | { type: 'after.autoplay' }
    /** 拖拽起点，position 是沿轨道轴的坐标。 */
    | { type: 'DRAG.START', position: number }
    | { type: 'DRAG.MOVE', position: number }
    | { type: 'DRAG.END' }
  tag: never
  guard: 'isLastPauseSource' | 'canAdvance' | 'hasAutoplay'
  action:
    | 'setPage'
    | 'goPrev'
    | 'goNext'
    | 'addPauseSource'
    | 'removePauseSource'
    | 'clearPauseSources'
    | 'syncAutoplay'
    | 'startDrag'
    | 'moveDrag'
    | 'endDrag'
  effect: 'trackAutoplay' | 'trackPointer'
}

export interface CarouselApi<T extends PropTypes = PropTypes> {
  /** 当前页，0 基；恒在 [0, max(totalPages-1, 0)] 内，slideCount 减小后也能读到可用的值。 */
  page: number
  totalPages: number
  /** 归一化后的条目总数（负数 / 小数 / 未提供都已收敛为非负整数）。 */
  slideCount: number
  slidesPerPage: number
  slidesPerMove: number
  orientation: Orientation
  /** 当前页显示的条目下标区间，0 基闭区间；没有条目时 end < start。 */
  slideRange: { start: number, end: number }
  /** 每一页的首张下标序列，长度即总页数。 */
  pageSnapPoints: number[]
  canScrollPrev: boolean
  canScrollNext: boolean
  /** 自动播放的计时进行中。 */
  autoplaying: boolean
  /** 自动播放已开启但被暂停（悬停 / 焦点 / 调用方）。 */
  paused: boolean
  /**
   * 自动播放当前是否由用户停止：计时未进行（idle），或由调用方暂停。
   * 与 `paused` 的差别在于它不计入悬停与焦点两路：这两路一离开即自动恢复，
   * 若用它驱动播放 / 暂停开关的名字与图形，鼠标一碰按钮就会在两态之间跳动。
   */
  autoplayStopped: boolean
  dragging: boolean
  isInView: (index: number) => boolean
  /** 页码会被收敛进合法区间（loop 时回绕），越界入参不会写出越界的页。 */
  setPage: (page: number) => void
  goToPrev: () => void
  goToNext: () => void
  /** 开始自动播放；autoplay prop 未提供正的间隔时无操作。 */
  play: () => void
  /** 暂停计时（来源记为 api），与悬停 / 焦点叠加计数。 */
  pause: () => void
  resume: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: (props: CarouselItemProps) => T['element']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  /** 播放 / 暂停开关。未配置自动播放（间隔为 0）时为原生 disabled。 */
  getAutoplayTriggerProps: () => T['button']
  getIndicatorGroupProps: () => T['element']
  getIndicatorProps: (props: CarouselIndicatorProps) => T['button']
}
