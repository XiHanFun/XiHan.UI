import type { Direction, Orientation, PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { ScrollAxisMetrics } from '../shared/scroll-geometry'

/**
 * 滚动条什么时候露面：
 * - auto 溢出就一直露着；
 * - always 恒露，即便内容不溢出；
 * - scroll 滚动时露出，停手 hideDelay 毫秒后收起；
 * - hover 指针进入组件时露出，离开后 hideDelay 毫秒收起。
 */
export type ScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover'

/** 哪几条轴归本组件管。被关掉的那条轴滚动条恒不显形，视口那一向也不滚。 */
export type ScrollAreaOrientation = Orientation | 'both'

/** 指针位置，只取两个坐标。 */
export interface ScrollAreaPoint {
  clientX: number
  clientY: number
}

/** 一次滑块拖动的起点快照，位移相对它计算。 */
export interface ScrollAreaDragSession {
  axis: Orientation
  /** 按下那一刻指针在该轴上的客户端坐标。 */
  origin: number
  /** 按下那一刻的滚动量（距逻辑起始缘）。 */
  startScroll: number
}

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但量不到尺寸、也不挂监听器。
export interface ScrollAreaRefs {
  /** 真正 overflow:auto 的那层：尺寸、滚动量、scroll 事件与写回滚动位置都落在它身上。 */
  getViewportEl: () => HTMLElement | null
  /** 内容包裹层。只用于跟随尺寸变化（ResizeObserver），量数字仍以视口为准。 */
  getContentEl: () => HTMLElement | null
  /** 按轴取滚动条节点：轨道长度要在拖动/点击那一刻现量。 */
  getScrollbarEl: (orientation: Orientation) => HTMLElement | null
}

/** 滚动条自报家门：轴向是作者在部件上的声明，connect 据此产出属性，不反查 DOM。 */
export interface ScrollAreaScrollbarProps {
  orientation: Orientation
}

/** 一条轴对外的完整状态，两个适配器的插槽都透出它。 */
export interface ScrollAreaAxisState {
  /** 内容比视口长。 */
  overflow: boolean
  /** 这一刻滚动条该不该显形（已把 type 与 orientation 都算进去）。 */
  visible: boolean
  /** 滑块长度占轨道的比例，0-1。 */
  size: number
  /** 滑块起点占轨道的比例，0-1。 */
  offset: number
}

export interface ScrollAreaSchema extends MachineSchema {
  props: {
    /** 滚动条露面的时机，默认 hover。 */
    type?: ScrollAreaType
    /** 收起前的等待毫秒（type 为 scroll / hover 时生效），默认 600。 */
    hideDelay?: number
    /** 哪几条轴归本组件管，默认 both。 */
    orientation?: ScrollAreaOrientation
    /**
     * 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻一次。
     * 必须显式给：组件不读计算样式，看不见从 RTL 祖先继承来的方向。
     */
    dir?: Direction
  }
  context: {
    /** 竖轴量到的尺寸；connect 只读它，不碰 DOM。 */
    vertical: ScrollAxisMetrics
    /** 横轴量到的尺寸。 */
    horizontal: ScrollAxisMetrics
    /** 指针此刻在组件里。拖动结束后要靠它决定是留着滚动条还是开始倒计时。 */
    pointerInside: boolean
    /** 正在进行的滑块拖动；没在拖为 null。 */
    drag: ScrollAreaDragSession | null
  }
  computed: Record<string, never>
  refs: ScrollAreaRefs
  /**
   * 只有 hover / scroll 两种 type 会在这四个状态间走动，auto / always 的可见性由 connect 直接按 type 判。
   * hidden 收着；visible 露着且没有倒计时；hiding 露着且倒计时在跑；dragging 手正按在滑块上。
   */
  state: 'hidden' | 'visible' | 'hiding' | 'dragging'
  event:
    /** 重新量一遍尺寸（挂载后首帧、ResizeObserver 回调）。 */
    | { type: 'MEASURE' }
    /** 视口滚了。 */
    | { type: 'SCROLL' }
    | { type: 'POINTER.ENTER' }
    | { type: 'POINTER.LEAVE' }
    /** 按住滑块。 */
    | { type: 'DRAG.START', axis: Orientation, point: ScrollAreaPoint }
    | { type: 'DRAG.MOVE', point: ScrollAreaPoint }
    | { type: 'DRAG.END' }
    /** 点在轨道空白处：把滑块中心挪过去。 */
    | { type: 'TRACK.CLICK', axis: Orientation, point: ScrollAreaPoint }
    | { type: 'after.hideDelay' }
  tag: never
  guard: 'isHoverType' | 'isScrollType' | 'staysVisible'
  action:
    | 'measure'
    | 'measureSoon'
    | 'markPointerInside'
    | 'clearPointerInside'
    | 'startDrag'
    | 'dragScroll'
    | 'endDrag'
    | 'scrollToTrackPoint'
  effect: 'trackViewport' | 'waitForHideDelay' | 'trackPointer'
}

export interface ScrollAreaApi<T extends PropTypes = PropTypes> {
  type: ScrollAreaType
  orientation: ScrollAreaOrientation
  vertical: ScrollAreaAxisState
  horizontal: ScrollAreaAxisState
  /** 正被拖动的那条轴；没在拖为 null。 */
  draggingAxis: Orientation | null
  /** 右下角补丁该不该显形：两条滚动条同时在场才有它的位置。 */
  cornerVisible: boolean
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getContentProps: () => T['element']
  getScrollbarProps: (props: ScrollAreaScrollbarProps) => T['element']
  getThumbProps: (props: ScrollAreaScrollbarProps) => T['element']
  getCornerProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ScrollAreaTranslations {}
