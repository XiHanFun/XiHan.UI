import type { Direction, Orientation, PropTypes, Size } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ScrollbarSchema, ScrollbarType } from '../scrollbar/scrollbar.types'

/** 哪几条轴归本组件管。被关掉的那条轴滚动条恒不显形，视口那一向也不滚。 */
export type ScrollAreaOrientation = Orientation | 'both'

/**
 * 滚动区域自己没有机器：它只是视口加两条 scrollbar 的组装。滚动条的显隐、拖动、
 * 键盘与尺寸测量全在 scrollbar 那两台机器里，这里按轴各跑一台。
 */
export interface ScrollAreaProps {
  /** 滚动条露面的时机，默认 scroll-hover。 */
  type?: ScrollbarType
  /** 收起前的等待毫秒（type 为 scroll / hover / scroll-hover 时生效），默认 600。 */
  hideDelay?: number
  /** 哪几条轴归本组件管，默认 both。 */
  orientation?: ScrollAreaOrientation
  /** 尺寸：sm / md / lg，换的是滚动条厚度。 */
  size?: Size
  /**
   * 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻一次。
   * 必须显式给：组件不读计算样式，看不见从 RTL 祖先继承来的方向。
   */
  dir?: Direction
  /** 触屏（粗指针）上也画自绘滚动条，默认 false：缺省交给原生滚动。 */
  forceVisible?: boolean
}

/** 两条轴各一台 scrollbar 机器；适配器建好后交给 connect。 */
export interface ScrollAreaServices {
  vertical: Service<ScrollbarSchema>
  horizontal: Service<ScrollbarSchema>
}

/** 滚动条自报家门：轴向是作者在部件上的声明，connect 据此取对应那台机器，不反查 DOM。 */
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

export interface ScrollAreaApi<T extends PropTypes = PropTypes> {
  type: ScrollbarType
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
  /** 某条轴的滚动条挂载点，同时充当那条 scrollbar 的根节点。 */
  getScrollbarProps: (props: ScrollAreaScrollbarProps) => T['element']
  getTrackProps: (props: ScrollAreaScrollbarProps) => T['element']
  getThumbProps: (props: ScrollAreaScrollbarProps) => T['element']
  /** 交叉口补丁，写在竖条的挂载点里；只有两条都在场时才显形。 */
  getCornerProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ScrollAreaTranslations {}
