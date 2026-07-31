import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'
import type { VirtualizerAlign } from './virtualizer.geometry'
import type { VirtualizerKernel } from './virtualizer.kernel'
import type { VirtualizerItemState, VirtualizerSnapshot } from './virtualizer.sizing'

/**
 * 计算内核实例。区间、实测尺寸账本、多列分道全在它那边，本组件只负责它的生死与接线。
 * 滚动容器与条目都是 HTMLElement，不支持以 window 为滚动容器的形态。
 */
export type VirtualizerCore = VirtualizerKernel

export interface VirtualizerScrollToOptions {
  /** 默认 start。 */
  align?: VirtualizerAlign
}

/** 该渲什么变了时对外报的详情，与 api 上的同名字段同源。 */
export interface VirtualizerChangeDetails {
  virtualItems: readonly VirtualizerItemState[]
  totalSize: number
  startIndex: number | null
  endIndex: number | null
}

/** 条目自报家门：作者在节点上声明自己是第几条，连接层据此取位移，不反查 DOM。 */
export interface VirtualizerItemProps {
  index: number
}

// 适配器挂载前填入；保持缺省时效应短路，机器状态照常转移但建不出内核、快照恒为空。
export interface VirtualizerRefs {
  /** 真正 overflow:auto 的那层：内核的尺寸观察、滚动监听与滚动写回全落在它身上。 */
  getViewportEl: () => HTMLElement | null
  /** 撑出总长的那层。只用于给条目做定位上下文，内核不认识它。 */
  getContentEl: () => HTMLElement | null
  /**
   * 计算内核，由机器的效应在挂载后填入、退出时清空。
   * 它同时是内核还活着吗的判据，停机后残留的回调拿它一比即可判断。
   */
  getVirtualizer: () => VirtualizerCore | null
}

export interface VirtualizerSchema extends MachineSchema {
  props: {
    /** 总条数，默认 0。 */
    count?: number
    /**
     * 每条的估算主轴尺寸（px）。等高列表可以直接给一个数字。
     * 不给按 0 算：所有条目都会落进窗口，先渲出来再靠 measureElement 回喂真实尺寸。
     */
    estimateSize?: number | ((index: number) => number)
    /** 可视区前后各多渲几条，默认 5。 */
    overscan?: number
    /** 横向列表（主轴是行内轴），默认 false。 */
    horizontal?: boolean
    /** 相邻两条之间的主轴间距（px），默认 0。位移由内核直接算进去，不靠外边距。 */
    gap?: number
    /** 条目身份。默认即下标；列表会增删时给稳定 key，测量缓存才跟得住条目。 */
    getItemKey?: (index: number) => string | number
    /** 该渲什么变了。只在快照真的变了时回调，滚动但可见区间没变不会触发。 */
    onChange?: (details: VirtualizerChangeDetails) => void
    /**
     * 列表起点距滚动容器起点的距离（px），默认 0。
     * 列表上方还有别的内容（页头、筛选栏）时给它，否则区间会整体偏掉那一截。
     */
    scrollMargin?: number
    /** 列表前后的内边距（px），默认 0。计进总长，第一条从 paddingStart 处起算。 */
    paddingStart?: number
    paddingEnd?: number
    /** 多列网格的列数，默认 1（单列）。条目按下标轮流落到各道上。 */
    lanes?: number
  }
  context: {
    /** 该渲什么的唯一事实源。连接层只读它，一行 DOM 都不碰。 */
    snapshot: VirtualizerSnapshot
  }
  computed: Record<string, never>
  refs: VirtualizerRefs
  /**
   * 只有手正在滚这一件事进状态，区间与尺寸是算出来的数据、落在 context 里。
   * idle 停着；scrolling 滚动事件正在连着来（内核自己带停手判定）。
   */
  state: 'idle' | 'scrolling'
  event:
    /** 内核报告滚动开始。 */
    | { type: 'SCROLL.START' }
    /** 内核报告手停下了。 */
    | { type: 'SCROLL.END' }
    /** 重新量视口、丢掉实测尺寸整份重排。 */
    | { type: 'MEASURE' }
  tag: never
  guard: never
  action: 'syncOptions' | 'remeasure'
  effect: 'trackVirtualizer'
}

export interface VirtualizerApi<T extends PropTypes = PropTypes> {
  /** 此刻该渲染哪些下标，以及它们的位移与尺寸。 */
  virtualItems: readonly VirtualizerItemState[]
  /** 整份列表的主轴总长（px）。 */
  totalSize: number
  /** 可视区首条下标（不含过扫描）；一条都排不下时为 null。 */
  startIndex: number | null
  /** 可视区末条下标（不含过扫描）；一条都排不下时为 null。 */
  endIndex: number | null
  horizontal: boolean
  lanes: number
  /** 手正在滚。 */
  scrolling: boolean
  /** 滚到第几条。越界下标由内核夹住。 */
  scrollToIndex: (index: number, options?: VirtualizerScrollToOptions) => void
  /** 把条目节点的真实尺寸回喂给内核（动态高度用）。传 null 无副作用。 */
  measureElement: (element: HTMLElement | null) => void
  /** 丢掉全部实测尺寸重新按估算值排。视口换了一种排版时用得上。 */
  measure: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: VirtualizerItemProps) => T['element']
}
