/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 scrollbar 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size } from '@xihan-ui/core'
import type { ScrollAxisMetrics } from '../shared/scroll-geometry'

/**
 * 滚动条的显示时机：
 * - auto 溢出即持续显示；
 * - always 恒显示，即使内容不溢出；
 * - scroll 滚动时显示，停止 hideDelay 毫秒后收起；
 * - hover 指针进入滚动容器或滚动条时显示，离开后 hideDelay 毫秒收起；
 * - scroll-hover 滚动时与指针进入时都显示，指针在容器内滚动不启动倒计时，
 *   指针离开或停止 hideDelay 毫秒后收起。
 */
export type ScrollbarType = 'auto' | 'always' | 'scroll' | 'hover' | 'scroll-hover'

/** 指针位置，只取两个坐标。 */
export interface ScrollbarPoint {
  clientX: number
  clientY: number
}

/** 一次滑块拖动的起点快照，位移相对它计算。 */
export interface ScrollbarDragSession {
  /** 按下时指针在本轴上的客户端坐标。 */
  origin: number
  /** 按下时的滚动量（距逻辑起始缘）。 */
  startScroll: number
}

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但量不到尺寸、也不挂监听器。
export interface ScrollbarRefs {
  /**
   * 实际滚动的元素。它由作者提供，不必是本组件的后代：
   * 表格的滚动盒、虚拟滚动的视口、任意 overflow:auto 的 div 均可。
   */
  getScrollableEl: () => HTMLElement | null
  /** 轨道节点：长度在拖动 / 点击时测量。 */
  getTrackEl: () => HTMLElement | null
  /** 根节点：指针进出滚动条本身也视为指针仍在场，hover 档据此不收起。 */
  getRootEl: () => HTMLElement | null
}

export interface ScrollbarScrollDetails {
  /** 距逻辑起始缘的滚动量（px），恒非负。 */
  offset: number
  /** 仍可向前滚动的距离（px）。 */
  max: number
}

/** 读屏文案。只在 focusable 时使用：不进入 Tab 序列的滚动条对读屏是隐藏的。 */
export interface ScrollbarTranslations {
  /** 滑块的可及名，写到 role=scrollbar 的 aria-label 上。 */
  thumb: string
}

export interface ScrollbarSchema extends MachineSchema {
  props: {
    /** 该滚动条管理的轴，默认 vertical。 */
    orientation?: Orientation
    /** 显示的时机，默认 scroll-hover。 */
    type?: ScrollbarType
    /** 收起前的等待毫秒（type 为 scroll / hover / scroll-hover 时生效），默认 600。 */
    hideDelay?: number
    /** 滑块的最小像素长度，默认 20。长文档中的滑块再短也可按下。 */
    minThumbSize?: number
    /** 方向键一步滚动的像素数，默认 40。翻页键按视口长度计算，不使用该值。 */
    step?: number
    /** 尺寸：sm / md / lg，影响滚动条厚度。 */
    size?: Size
    /** 禁用：不接受指针也不接受键盘，恒不显示。 */
    disabled?: boolean
    /**
     * 滑块进入 Tab 序列并报告 role=scrollbar，默认 false。
     *
     * 默认不进入：滚动容器自身已能用键盘滚动，再给每条滚动条一个 Tab 停靠点，
     * 长页面上会多出许多停靠点。需要键盘操作滑块本身时才开启。
     */
    focusable?: boolean
    /** 被控滚动容器的 id；focusable 时写到滑块的 aria-controls 上（未提供时使用容器自身的 id）。 */
    controls?: string
    /**
     * 横竖两条同时存在时，各自在末端让出交叉口的一格：竖条不伸到底、横条不伸到头。
     * 交叉口由其中一条中的 corner 部件补上。
     */
    gutter?: boolean
    /**
     * 触屏设备（粗指针）上也显示，默认 false：触屏没有悬停、拖动滑块也不如直接划动内容，
     * 默认交给原生滚动，本组件整条不显示并带 data-native。
     */
    forceVisible?: boolean
    /**
     * 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻转。
     * 必须显式提供：组件不读取计算样式，无法感知从 RTL 祖先继承的方向。
     */
    dir?: Direction
    translations?: Partial<ScrollbarTranslations>
    /** 开始滚动（停止 120ms 才视为一段结束，中途连续滚动不重复通知）。 */
    onScrollStart?: (details: ScrollbarScrollDetails) => void
    /** 一段滚动结束。 */
    onScrollEnd?: (details: ScrollbarScrollDetails) => void
    /** 按住滑块。 */
    onDragStart?: (details: ScrollbarScrollDetails) => void
    /** 松开滑块。 */
    onDragEnd?: (details: ScrollbarScrollDetails) => void
  }
  context: {
    /** 本轴测得的尺寸；connect 只读取它，不涉及 DOM。 */
    metrics: ScrollAxisMetrics
    /** 指针当前在滚动容器或滚动条上。拖动结束后依靠它决定是保持显示还是开始倒计时。 */
    pointerInside: boolean
    /** 正在进行的滑块拖动；未拖动时为 null。 */
    drag: ScrollbarDragSession | null
    /** 本段滚动仍在进行中。停止 120ms 后回到 false。 */
    scrolling: boolean
    /** 主指针是粗指针（触屏）。没有 matchMedia 的环境恒为 false。 */
    coarse: boolean
    /** 当前挂载的滚动容器的 id；作者未提供 controls 时 aria-controls 使用它。 */
    scrollableId: string | null
    /** 作者已提供根节点。滚动区据此判断某条轴的滚动条是否在场。 */
    rootMounted: boolean
  }
  computed: Record<string, never>
  refs: ScrollbarRefs
  /**
   * 只有 hover / scroll / scroll-hover 三种 type 会在这四个状态间转移，
   * auto / always 的可见性由 connect 直接按 type 判定。
   * hidden 收起；visible 显示且没有倒计时；hiding 显示且倒计时进行中；dragging 指针按在滑块上。
   */
  state: 'hidden' | 'visible' | 'hiding' | 'dragging'
  event:
    /** 重新测量尺寸（挂载后首帧、ResizeObserver 回调）。 */
    | { type: 'MEASURE' }
    /** 滚动容器发生滚动。 */
    | { type: 'SCROLL' }
    /** 停止足够久，本段滚动结束。 */
    | { type: 'SCROLL.IDLE' }
    | { type: 'POINTER.ENTER' }
    | { type: 'POINTER.LEAVE' }
    /** 按住滑块。 */
    | { type: 'DRAG.START', point: ScrollbarPoint }
    | { type: 'DRAG.MOVE', point: ScrollbarPoint }
    | { type: 'DRAG.END' }
    /** 点击轨道空白处：把滑块中心移过去。 */
    | { type: 'TRACK.CLICK', point: ScrollbarPoint }
    /** 相对滚动若干像素（方向键与翻页键）。 */
    | { type: 'STEP', delta: number }
    /** 滚到某个绝对位置（Home / End 与命令式 scrollTo）。 */
    | { type: 'SCROLL.TO', offset: number }
    | { type: 'after.hideDelay' }
  tag: never
  guard: 'showsOnHover' | 'showsOnScroll' | 'staysVisible' | 'canInteract'
  action:
    | 'measure'
    | 'measureSoon'
    | 'markPointerInside'
    | 'clearPointerInside'
    | 'markScrolling'
    | 'clearScrolling'
    | 'startDrag'
    | 'dragScroll'
    | 'endDrag'
    | 'scrollToTrackPoint'
    | 'stepScroll'
    | 'scrollToOffset'
  effect: 'trackScrollable' | 'trackPointerType' | 'waitForHideDelay' | 'trackPointer'
}

export interface ScrollbarApi<T extends PropTypes = PropTypes> {
  orientation: Orientation
  type: ScrollbarType
  /** 内容比可视区长。不溢出时 auto 档整条不显示。 */
  overflow: boolean
  /** 当前是否应显示（已把 type、disabled 与触屏原生路径都计算在内）。 */
  visible: boolean
  /** 已交给原生滚动：粗指针设备且未开启 forceVisible，整条不显示。 */
  native: boolean
  /** 指针当前在滚动容器或滚动条上。 */
  hover: boolean
  /** 指针按在滑块上。 */
  dragging: boolean
  /** 本段滚动仍在进行中。 */
  scrolling: boolean
  /** 滑块长度占轨道的比例，0-1。 */
  thumbSize: number
  /** 滑块起点占轨道的比例，0-1。 */
  thumbOffset: number
  /** 距逻辑起始缘的滚动量（px）。 */
  scroll: number
  /** 仍可向前滚动的距离（px）。 */
  max: number
  /** 滚动到某个绝对位置（px），越界自动夹取。 */
  scrollTo: (offset: number) => void
  /** 相对当前位置滚动若干像素。 */
  scrollBy: (delta: number) => void
  /**
   * 重新测量。内容长度变化会自动重新测量（MutationObserver 观察容器子树），
   * 该出口留给无法测量的情况：容器更换、内容在 Shadow DOM 中、或自定义元素内部修改。
   */
  measure: () => void
  getRootProps: () => T['element']
  getTrackProps: () => T['element']
  getThumbProps: () => T['element']
  /** 交叉口补丁，写在其中一条的 root 中；随该条的显隐变化。 */
  getCornerProps: () => T['element']
}
