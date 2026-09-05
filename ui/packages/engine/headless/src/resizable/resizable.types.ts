import type { Direction, MachineSchema, PropTypes } from '@xihan-ui/core'
import type { ResizeEdge } from '@xihan-ui/pointer'

export interface ResizableDimensions {
  width: number
  height: number
}

/** 相对初始位置的累计位移。推西边与北边时它才不为零。 */
export interface ResizableOffset {
  x: number
  y: number
}

export interface ResizableDimensionsChangeDetails {
  dimensions: ResizableDimensions
}

export interface ResizableDimensionsChangeEndDetails {
  dimensions: ResizableDimensions
  /** 这一次调整推的是哪条边。 */
  edge: ResizeEdge
}

/** 读屏用的文案，默认英文。八个把手长得一样，名字是它们唯一的区分。 */
export interface ResizableTranslations {
  /** 整块可调区域的名字。 */
  root: string
  /** 某条边的把手叫什么。 */
  handle: (edge: ResizeEdge) => string
}

export interface ResizableRefs {
  getRootEl: () => HTMLElement | null
  /** 按下那一刻的矩形、边与起点。跟手一律相对它算，不相对上一帧。 */
  session: { edge: ResizeEdge, rect: { x: number, y: number, width: number, height: number }, originX: number, originY: number, offset: ResizableOffset } | null
}

export interface ResizableSchema extends MachineSchema {
  props: {
    /** 受控尺寸。给了就由外面说了算，内部只发意图。 */
    dimensions?: ResizableDimensions
    defaultDimensions?: ResizableDimensions
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    /** 宽高比（宽 ÷ 高）。给了就锁死；四条边各按自己那一轴算另一轴，四个角以宽为准。 */
    aspectRatio?: number
    /** 吸附步进：宽高各自落到最近的整数倍。 */
    step?: number
    /** 方向键一次推多远（px），默认 8。 */
    keyboardStep?: number
    /** 按住 Shift 时的步长（px），默认 40。 */
    keyboardLargeStep?: number
    /**
     * 允许哪几条边可调，默认八向全开。
     * 只给东南两向就是「只能往右下角撑大」，那是文档流里最常见的形态。
     */
    edges?: ResizeEdge[]
    disabled?: boolean
    dir?: Direction
    translations?: Partial<ResizableTranslations>
    /** 尺寸变化意图。拖动途中连着发。 */
    onDimensionsChange?: (details: ResizableDimensionsChangeDetails) => void
    /** 一次调整收尾发一次。存尺寸用它，别用 onDimensionsChange。 */
    onDimensionsChangeEnd?: (details: ResizableDimensionsChangeEndDetails) => void
  }
  context: {
    dimensions: ResizableDimensions
    /** 推西边与北边产生的累计位移，写成 root 的 left / top。 */
    offset: ResizableOffset
    /** 正在推的那条边；没在推是 null。 */
    activeEdge: ResizeEdge | null
  }
  refs: ResizableRefs
  state: 'idle' | 'resizing'
  event:
    | { type: 'RESIZE.START', edge: ResizeEdge, point: { clientX: number, clientY: number } }
    | { type: 'RESIZE.MOVE', point: { clientX: number, clientY: number } }
    | { type: 'RESIZE.END' }
    | { type: 'RESIZE.CANCEL' }
    /** 键盘推一步。dx / dy 是屏幕方向上的位移。 */
    | { type: 'RESIZE.NUDGE', edge: ResizeEdge, dx: number, dy: number }
    /** 推到这条边能到的一端。 */
    | { type: 'RESIZE.TO_BOUND', edge: ResizeEdge, bound: 'min' | 'max' }
    | { type: 'DIMENSIONS.SET', dimensions: ResizableDimensions }
  guard: 'canResize'
  action:
    | 'startResize'
    | 'trackResize'
    | 'nudge'
    | 'toBound'
    | 'setDimensions'
    | 'endResize'
    | 'cancelResize'
    | 'invokeChangeEnd'
  effect: 'trackPointer'
  computed: Record<string, never>
  tag: string
}

export interface ResizableApi<T extends PropTypes = PropTypes> {
  dimensions: ResizableDimensions
  offset: ResizableOffset
  /** 正在调整（拖动中）。键盘推一步不算。 */
  resizing: boolean
  activeEdge: ResizeEdge | null
  disabled: boolean
  /** 这条边是否开放。 */
  edgeEnabled: (edge: ResizeEdge) => boolean
  /** 整份赋值：先过约束再落地。 */
  setDimensions: (dimensions: ResizableDimensions) => void
  getRootProps: () => T['element']
  getHandleProps: (props: { edge: ResizeEdge }) => T['element']
}
