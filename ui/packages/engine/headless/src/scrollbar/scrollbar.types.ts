import type { Direction, Orientation, PropTypes, Size } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { ScrollAxisMetrics } from '../shared/scroll-geometry'

/**
 * 滚动条什么时候露面：
 * - auto 溢出就一直露着；
 * - always 恒露，即便内容不溢出；
 * - scroll 滚动时露出，停手 hideDelay 毫秒后收起；
 * - hover 指针进入滚动容器或滚动条时露出，离开后 hideDelay 毫秒收起；
 * - scroll-hover 滚动时与指针进入时都露出，指针在容器里滚动不起倒计时，
 *   指针离开或停手 hideDelay 毫秒后收起。
 */
export type ScrollbarType = 'auto' | 'always' | 'scroll' | 'hover' | 'scroll-hover'

/** 指针位置，只取两个坐标。 */
export interface ScrollbarPoint {
  clientX: number
  clientY: number
}

/** 一次滑块拖动的起点快照，位移相对它计算。 */
export interface ScrollbarDragSession {
  /** 按下那一刻指针在本轴上的客户端坐标。 */
  origin: number
  /** 按下那一刻的滚动量（距逻辑起始缘）。 */
  startScroll: number
}

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但量不到尺寸、也不挂监听器。
export interface ScrollbarRefs {
  /**
   * 真正在滚的那个元素。它由作者给，不必是本组件的后代——
   * 表格的滚动盒、虚拟滚动的视口、随便一个 overflow:auto 的 div 都行。
   */
  getScrollableEl: () => HTMLElement | null
  /** 轨道节点：长度要在拖动/点击那一刻现量。 */
  getTrackEl: () => HTMLElement | null
  /** 根节点：指针进出滚动条本身也算「手还在这儿」，hover 档据此不收起。 */
  getRootEl: () => HTMLElement | null
}

export interface ScrollbarScrollDetails {
  /** 距逻辑起始缘的滚动量（px），恒非负。 */
  offset: number
  /** 还能往前滚多少（px）。 */
  max: number
}

/** 读屏用的文案。只在 focusable 时用得上——不进 Tab 序的滚动条对读屏是隐藏的。 */
export interface ScrollbarTranslations {
  /** 滑块的可及名字，落到 role=scrollbar 的 aria-label 上。 */
  thumb: string
}

export interface ScrollbarSchema extends MachineSchema {
  props: {
    /** 这条滚动条管哪条轴，默认 vertical。 */
    orientation?: Orientation
    /** 露面的时机，默认 scroll-hover。 */
    type?: ScrollbarType
    /** 收起前的等待毫秒（type 为 scroll / hover / scroll-hover 时生效），默认 600。 */
    hideDelay?: number
    /** 滑块最短多少像素，默认 20。长文档里的滑块再短也按得住。 */
    minThumbSize?: number
    /** 方向键一步滚多少像素，默认 40。翻页键按视口长度走，不看这个值。 */
    step?: number
    /** 尺寸：sm / md / lg，换的是滚动条厚度。 */
    size?: Size
    /** 禁用：不接指针也不接键盘，恒不显形。 */
    disabled?: boolean
    /**
     * 滑块进 Tab 序并报 role=scrollbar，默认 false。
     *
     * 缺省不进：滚动容器自己已经能用键盘滚，再给每条滚动条一个 Tab 停靠点，
     * 长页面上会平白多出十几站。要键盘操作滑块本身时才开。
     */
    focusable?: boolean
    /** 被控滚动容器的 id；focusable 时落到滑块的 aria-controls 上（没给就用容器自己的 id）。 */
    controls?: string
    /**
     * 横竖两条同时摆着时，各自在末端让出交叉口那一格：竖条不伸到底、横条不伸到头。
     * 交叉口由其中一条里的 corner 部件补上。
     */
    gutter?: boolean
    /**
     * 触屏设备（粗指针）上也显形，默认 false：触屏没有悬停、拖滑块也不如直接划内容，
     * 缺省交给原生滚动，本组件整条不显形并带 data-native。
     */
    forceVisible?: boolean
    /**
     * 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻一次。
     * 必须显式给：组件不读计算样式，看不见从 RTL 祖先继承来的方向。
     */
    dir?: Direction
    translations?: Partial<ScrollbarTranslations>
    /** 开始滚了（停手 120ms 才算一段结束，中途连滚不重复通知）。 */
    onScrollStart?: (details: ScrollbarScrollDetails) => void
    /** 一段滚动结束。 */
    onScrollEnd?: (details: ScrollbarScrollDetails) => void
    /** 按住滑块。 */
    onDragStart?: (details: ScrollbarScrollDetails) => void
    /** 松开滑块。 */
    onDragEnd?: (details: ScrollbarScrollDetails) => void
  }
  context: {
    /** 本轴量到的尺寸；connect 只读它，不碰 DOM。 */
    metrics: ScrollAxisMetrics
    /** 指针此刻在滚动容器或滚动条上。拖动结束后要靠它决定是留着还是开始倒计时。 */
    pointerInside: boolean
    /** 正在进行的滑块拖动；没在拖为 null。 */
    drag: ScrollbarDragSession | null
    /** 这一段滚动还在进行中。停手 120ms 后落回 false。 */
    scrolling: boolean
    /** 主指针是粗指针（触屏）。没有 matchMedia 的环境恒为 false。 */
    coarse: boolean
    /** 此刻挂着的滚动容器的 id；作者没给 controls 时 aria-controls 用它。 */
    scrollableId: string | null
    /** 作者把根节点交上来了。滚动区据此判断某条轴的滚动条在不在场。 */
    rootMounted: boolean
  }
  computed: Record<string, never>
  refs: ScrollbarRefs
  /**
   * 只有 hover / scroll / scroll-hover 三种 type 会在这四个状态间走动，
   * auto / always 的可见性由 connect 直接按 type 判。
   * hidden 收着；visible 露着且没有倒计时；hiding 露着且倒计时在跑；dragging 手正按在滑块上。
   */
  state: 'hidden' | 'visible' | 'hiding' | 'dragging'
  event:
    /** 重新量一遍尺寸（挂载后首帧、ResizeObserver 回调）。 */
    | { type: 'MEASURE' }
    /** 滚动容器滚了。 */
    | { type: 'SCROLL' }
    /** 停手够久，这一段滚动结束。 */
    | { type: 'SCROLL.IDLE' }
    | { type: 'POINTER.ENTER' }
    | { type: 'POINTER.LEAVE' }
    /** 按住滑块。 */
    | { type: 'DRAG.START', point: ScrollbarPoint }
    | { type: 'DRAG.MOVE', point: ScrollbarPoint }
    | { type: 'DRAG.END' }
    /** 点在轨道空白处：把滑块中心挪过去。 */
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
  /** 内容比可视区长。不溢出时 auto 档整条不显形。 */
  overflow: boolean
  /** 这一刻该不该显形（已把 type、disabled 与触屏原生那一路都算进去）。 */
  visible: boolean
  /** 交给了原生滚动：粗指针设备且没开 forceVisible，整条不显形。 */
  native: boolean
  /** 指针此刻在滚动容器或滚动条上。 */
  hover: boolean
  /** 手正按在滑块上。 */
  dragging: boolean
  /** 这一段滚动还在进行中。 */
  scrolling: boolean
  /** 滑块长度占轨道的比例，0-1。 */
  thumbSize: number
  /** 滑块起点占轨道的比例，0-1。 */
  thumbOffset: number
  /** 距逻辑起始缘的滚动量（px）。 */
  scroll: number
  /** 还能往前滚多少（px）。 */
  max: number
  /** 滚到某个绝对位置（px），越界自动夹。 */
  scrollTo: (offset: number) => void
  /** 相对当前位置滚若干像素。 */
  scrollBy: (delta: number) => void
  /**
   * 重新量一遍。内容长短变了会自动重量（MutationObserver 盯着容器子树），
   * 这个出口留给量不到的那些：容器换了、内容在 Shadow DOM 里、或是自定义元素内部改的。
   */
  measure: () => void
  getRootProps: () => T['element']
  getTrackProps: () => T['element']
  getThumbProps: () => T['element']
  /** 交叉口补丁，写在其中一条的 root 里；跟着这一条的显隐走。 */
  getCornerProps: () => T['element']
}
