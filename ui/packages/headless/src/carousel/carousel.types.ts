import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 按住自动播放的来源。可同时有多个按住，最后一个松开才继续走。 */
export type CarouselPauseSource = 'pointer' | 'focus' | 'api'

export interface CarouselPageChangeDetails {
  /** 变化后的页码，0 基，恒在 [0, totalPages - 1] 内。 */
  page: number
}

/**
 * 条目自报家门：下标由作者在部件上声明，connect 据此产出属性。
 * connect 在 render 期求值，此时 DOM 尚不存在，不得读 DOM。
 */
export interface CarouselItemProps {
  /** 条目下标，0 基。 */
  index: number
}

export interface CarouselIndicatorProps {
  /** 指示点对应的页码，0 基。一页一个。 */
  index: number
}

/** 读屏用的文案。默认英文，与 dialog / pagination 的 translations 同一套写法。 */
export interface CarouselTranslations {
  /** 根节点（region 地标）的名字。 */
  root: string
  prevTrigger: string
  nextTrigger: string
  /** 指示点容器的名字。 */
  indicatorGroup: string
  /** 指示点按钮文案，入参是 1 基页码。 */
  indicator: (page: number) => string
  /**
   * 条目文案，入参是 1 基张号与总张数。
   * 默认只给 "1 of 6"：条目上已有 aria-roledescription="slide"，文案里不再重复。
   */
  item: (index: number, count: number) => string
}

export interface CarouselSchema extends MachineSchema {
  props: {
    /**
     * 当前页，0 基。给定即受控：内部不再自改，只发 onPageChange。
     * 页不是张：一页可能同时露出好几张（见 slidesPerPage）。
     */
    page?: number
    /** 非受控初始页，默认 0。 */
    defaultPage?: number
    /** 条目总数，由作者声明，不从 DOM 数。 */
    slideCount?: number
    /** 一屏放几张，默认 1。 */
    slidesPerPage?: number
    /** 一次翻几张，默认跟随 slidesPerPage（整屏翻页）。 */
    slidesPerMove?: number
    /** 轨道方向，默认 horizontal；方向键的轴跟着它走。 */
    orientation?: Orientation
    /**
     * 文字方向。水平轴上同时作用于排版与位移方向：rtl 下"下一张"在左手边，
     * 轨道也要往正方向位移。纵向轨道不受它影响。
     */
    dir?: Direction
    /** 走到尽头是否回绕，默认 false。 */
    loop?: boolean
    /**
     * 自动播放。true 用默认间隔，数值即毫秒间隔；缺省 / false / 非正数一律不自动播放。
     * 指针悬停或轮播内任一节点获得焦点时按住计时，离开后从头计满一整个间隔再翻。
     */
    autoplay?: boolean | number
    /** 允许指针拖拽切页，默认 false。 */
    allowMouseDrag?: boolean
    /** 张与张之间的间距，任意 CSS 长度（如 '12px'）。落成条目自身的内边距，不影响位移算术。 */
    spacing?: string
    translations?: Partial<CarouselTranslations>
    /** 页码变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onPageChange?: (details: CarouselPageChangeDetails) => void
  }
  context: {
    /** 当前页，0 基。受控（page 给定）时 cell 直读 prop，写只发 onPageChange 不改内部值。 */
    page: number
    /** 当前按住自动播放的来源集合，空集即计时在走。 */
    pausedBy: CarouselPauseSource[]
    /** 本次拖拽的起点坐标（沿轨道轴），null 即当前没在拖。 */
    dragStart: number | null
    /** 本次拖拽已经走出的像素位移，连接层把它叠进轨道位移，画面才跟得住手。 */
    dragOffset: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 自动播放是唯一有阶段可分的事：跑 / 被按住 / 压根没开。翻页本身住在 context 的 cell 里。 */
  state: 'idle' | 'playing' | 'playing.running' | 'playing.paused'
  event:
    | { type: 'PAGE.SET', page: number }
    | { type: 'PAGE.PREV' }
    | { type: 'PAGE.NEXT' }
    /** 开始自动播放（autoplay prop 打开、或调用方主动 play）。间隔非正数时不生效。 */
    | { type: 'AUTOPLAY.START' }
    /** 停掉自动播放，一并清空按住来源。 */
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
  effect: 'trackAutoplay'
}

export interface CarouselApi<T extends PropTypes = PropTypes> {
  /** 当前页，0 基；恒在 [0, max(totalPages-1, 0)] 内，slideCount 变小后也读得到一个可用的值。 */
  page: number
  totalPages: number
  /** 归一后的条目总数（负数/小数/缺省都已收成非负整数）。 */
  slideCount: number
  slidesPerPage: number
  slidesPerMove: number
  orientation: Orientation
  /** 当前页露出的条目下标区间，0 基闭区间；一张都没有时 end < start。 */
  slideRange: { start: number, end: number }
  /** 每一页的首张下标序列，长度即总页数。 */
  pageSnapPoints: number[]
  canScrollPrev: boolean
  canScrollNext: boolean
  /** 自动播放的计时正在走。 */
  autoplaying: boolean
  /** 自动播放开着但被按住（悬停 / 焦点 / 调用方）。 */
  paused: boolean
  dragging: boolean
  isInView: (index: number) => boolean
  /** 页码会被收进合法区间（loop 时回绕），越界入参不会写出越界的页。 */
  setPage: (page: number) => void
  goToPrev: () => void
  goToNext: () => void
  /** 开始自动播放；autoplay prop 没给出正的间隔时无事发生。 */
  play: () => void
  /** 按住计时（来源记为 api），与悬停 / 焦点叠加计数。 */
  pause: () => void
  resume: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getItemGroupProps: () => T['element']
  getItemProps: (props: CarouselItemProps) => T['element']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  getIndicatorGroupProps: () => T['element']
  getIndicatorProps: (props: CarouselIndicatorProps) => T['button']
}
