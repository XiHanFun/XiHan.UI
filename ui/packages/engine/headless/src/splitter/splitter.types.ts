import type { Direction, Orientation, PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 一块面板的约束声明。数组顺序即面板在容器里的顺序，与作者写下的面板节点一一对应。
 * 整份都可以不给：不给就是"每块 0-100 随便走、不可折叠"。
 */
export interface SplitterPanelProps {
  /** 作者给这块面板起的名字，用来派生它的 DOM id（分隔条的 aria-controls 指向它）。 */
  id: string
  /** 百分比下界，默认 0。 */
  min?: number
  /** 百分比上界，默认 100。 */
  max?: number
  /** 允不允许折叠，默认 false。 */
  collapsible?: boolean
  /** 折叠后的百分比，默认 0；collapsible 为假时用不上。 */
  collapsedSize?: number
}

export interface SplitterSizeChangeDetails {
  /** 每块面板的百分比，总和恒为 100。 */
  size: number[]
}

export interface SplitterSizeChangeEndDetails {
  size: number[]
  /** 刚被推动的那条分隔条的下标。 */
  index: number
}

export interface SplitterPoint {
  clientX: number
  clientY: number
}

/**
 * 一次拖拽从按下那一刻起冻住的全部依据。
 * 每帧从按下时的布局加指针总位移重算，不累加每帧增量。
 */
export interface SplitterDragSession {
  /** 被拖的是第几条分隔条。 */
  index: number
  origin: SplitterPoint
  /** 容器在排布轴上的像素长度；整场拖拽只量一次。 */
  extent: number
  /** 按下那一刻的百分比布局。 */
  size: number[]
}

export interface SplitterSchema extends MachineSchema {
  props: {
    /** 每块面板的百分比。给定即受控：内部不再自改，只发 onSizeChange。 */
    size?: number[]
    /** 非受控初值；不给就按面板数等分。 */
    defaultSize?: number[]
    /** 逐块的约束；数组长度同时决定面板块数。 */
    panels?: SplitterPanelProps[]
    /** 面板的排布轴，默认 horizontal（并排，拖左右）；vertical 是上下堆叠，拖上下。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只对调水平排布下的左右两键与指针位移的正负。 */
    dir?: Direction
    /** 禁用：分隔条退出 Tab 序列、拖不动也推不动。 */
    disabled?: boolean
    /** 方向键的步长（百分比），默认 1。 */
    step?: number
    /** Shift + 方向键的步长（百分比），默认 10。 */
    largeStep?: number
    /** 每次尺寸变化都发；拖动过程中会连续发很多次。 */
    onSizeChange?: (details: SplitterSizeChangeDetails) => void
    /** 只在一次操作结束时发一次，适合拿来存布局。 */
    onSizeChangeEnd?: (details: SplitterSizeChangeEndDetails) => void
  }
  context: {
    /** 每块面板的百分比，总和恒为 100。 */
    size: number[]
    /** 正在被推动的分隔条下标：拖动期间是被抓住的那条，键盘操作时是聚焦的那条。 */
    activeIndex: number
  }
  computed: Record<string, never>
  refs: {
    /** 容器节点。拖拽开始时量它的矩形换算像素与百分比，connect 一律不碰 DOM。 */
    getRootEl: () => HTMLElement | null
    /** 当前这场拖拽的依据；不在拖拽中时为 null。 */
    drag: SplitterDragSession | null
    /** 面板折叠前的尺寸，展开时照它还原。 */
    restore: Map<number, number>
  }
  state: 'idle' | 'dragging'
  event:
    /** 整份赋值（作者的命令式出口）；写入前会逐块夹进约束并把总和归位到 100。 */
    | { type: 'SIZE.SET', size: number[] }
    | { type: 'BOUNDARY.STEP', index: number, direction: 1 | -1, large?: boolean }
    | { type: 'BOUNDARY.TO_MIN', index: number }
    | { type: 'BOUNDARY.TO_MAX', index: number }
    | { type: 'BOUNDARY.SET', index: number, size: number }
    | { type: 'BOUNDARY.FOCUS', index: number }
    | { type: 'PANEL.COLLAPSE', index: number }
    | { type: 'PANEL.EXPAND', index: number }
    | { type: 'DRAG.START', index: number, point: SplitterPoint }
    | { type: 'DRAG.MOVE', point: SplitterPoint }
    | { type: 'DRAG.END' }
  tag: never
  guard: 'canResize'
  action:
    | 'setSize'
    | 'setActiveIndex'
    | 'stepBoundary'
    | 'boundaryToMin'
    | 'boundaryToMax'
    | 'setBoundary'
    | 'collapse'
    | 'expand'
    | 'dragBoundary'
    | 'invokeChangeEnd'
  effect: 'trackPointer'
}

export interface SplitterPanelState {
  index: number
  /** 作者声明的名字；没声明就是下标的字符串形式。 */
  id: string
  /** 当前百分比。 */
  size: number
  /** 眼下真正能收到多小（自己的下界与后面的面板能吃下多少，取松的那个）。 */
  min: number
  /** 眼下真正能撑到多大。 */
  max: number
  collapsible: boolean
  collapsed: boolean
}

export interface SplitterApi<T extends PropTypes = PropTypes> {
  size: number[]
  panels: SplitterPanelState[]
  dragging: boolean
  disabled: boolean
  /** 整份赋值：逐块夹进约束、总和归位到 100 之后才落地。 */
  setSize: (next: number[]) => void
  /**
   * 把第 index 块调到 next，缺的那部分从它后面的面板里取。
   * 最后一块没有属于自己的分隔条，它的尺寸是其余面板的余数，调不动。
   */
  setPanelSize: (index: number, next: number) => void
  collapsePanel: (index: number) => void
  expandPanel: (index: number) => void
  /** 折叠着就展开、展开着就折叠；不可折叠的面板上是空操作。 */
  togglePanel: (index: number) => void
  getRootProps: () => T['element']
  getPanelProps: (index: number) => T['element']
  /** 第 index 条分隔条坐在第 index 与第 index+1 块面板之间，调整的是前一块。 */
  getResizeTriggerProps: (index: number) => T['element']
}
