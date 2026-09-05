import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 面板的三种形态：常规（作者摆出来的位置与尺寸）、收拢（只留标题栏）、铺满（占满视口）。
 * 取值与 floating-panel.css 的 [data-window-state] 选择器一一对应。
 */
export type FloatingPanelWindowState = 'default' | 'maximized' | 'minimized'

/**
 * 八个改尺把手守的边，取值是罗盘方位：n 上 / e 右 / s 下 / w 左，两两组合即四角。
 * 这是屏幕方位而不是逻辑方位——推动量来自指针与方向键，两者都是屏幕坐标。
 */
export type FloatingPanelResizeEdge = 'e' | 'n' | 'ne' | 'nw' | 's' | 'se' | 'sw' | 'w'

/** 面板左上角相对视口的像素坐标。 */
export interface FloatingPanelPosition {
  x: number
  y: number
}

/**
 * 面板的像素尺寸：`dimensions` 与 `minSize` / `maxSize` 三处都用它。
 * 本组件不带视觉三轴的 size，皮肤里也没有 [data-size] 选择器。
 */
export interface FloatingPanelSize {
  width: number
  height: number
}

/** 指针在视口里的落点。 */
export interface FloatingPanelPoint {
  clientX: number
  clientY: number
}

/**
 * 一次拖动或改尺从按下那一刻起冻住的全部依据。
 * 每帧从按下时的矩形加指针总位移重算，不累加每帧增量：
 * 累加在顶到尺寸下限之后就回不来了。
 */
export interface FloatingPanelDragSession {
  /** 搬整块面板，还是推某一条边。 */
  kind: 'move' | 'resize'
  /** kind 为 move 时没有边可言。 */
  edge: FloatingPanelResizeEdge | null
  origin: FloatingPanelPoint
  position: FloatingPanelPosition
  size: FloatingPanelSize
}

export interface FloatingPanelOpenChangeDetails {
  open: boolean
}

export interface FloatingPanelPositionChangeDetails {
  position: FloatingPanelPosition
}

export interface FloatingPanelDimensionsChangeDetails {
  dimensions: FloatingPanelSize
}

export interface FloatingPanelWindowStateChangeDetails {
  windowState: FloatingPanelWindowState
}

/** 改尺把手自报家门：守的是哪条边。 */
export interface FloatingPanelResizeTriggerProps {
  edge: FloatingPanelResizeEdge
}

/** 形态按钮自报家门：按下它切到哪个形态。 */
export interface FloatingPanelWindowStateTriggerProps {
  windowState: FloatingPanelWindowState
}

/** 读屏用的文案，默认英文。 */
export interface FloatingPanelTranslations {
  /** 拖拽把手的 aria-label：把手通常只是一小片纹理，读屏念不出它是干什么的。 */
  dragTrigger: string
  /** 改尺把手的 aria-label：八个把手在读屏里长得一模一样，不报方位就分不出按的是哪一个。 */
  resizeTrigger: (edge: FloatingPanelResizeEdge) => string
  /** 改尺把手的 aria-valuetext：把当前尺寸念成人话，两根轴一并报出来。 */
  resizeValueText: (size: FloatingPanelSize) => string
  /** 形态按钮的 aria-label：三个按钮通常只有图标。 */
  windowStateTrigger: (windowState: FloatingPanelWindowState) => string
  close: string
}

// 适配器在挂载前填入元素 getter；纯逻辑测试下保持缺省（拖动时取不到文档，副作用空跑）。
export interface FloatingPanelRefs {
  getContentEl: () => HTMLElement | null
  /** 当前这场拖动/改尺的依据；不在拖动中时为 null。 */
  session: FloatingPanelDragSession | null
}

export interface FloatingPanelSchema extends MachineSchema {
  props: {
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 面板左上角坐标（px，相对视口）。给定即受控。 */
    position?: FloatingPanelPosition
    defaultPosition?: FloatingPanelPosition
    /** 面板尺寸（px）。给定即受控。 */
    dimensions?: FloatingPanelSize
    defaultDimensions?: FloatingPanelSize
    /** 尺寸下限，默认 160×120。 */
    minSize?: FloatingPanelSize
    /** 尺寸上限，不给即不封顶。与 minSize 冲突时以 minSize 为准。 */
    maxSize?: FloatingPanelSize
    /** 形态。给定即受控。 */
    windowState?: FloatingPanelWindowState
    defaultWindowState?: FloatingPanelWindowState
    /** 允不允许搬动面板，默认 true；铺满形态下恒不可搬。 */
    draggable?: boolean
    /** 允不允许改尺寸，默认 true；只有常规形态下才改得动。 */
    resizable?: boolean
    /** 禁用：搬不动、改不了尺寸、切不了形态；开合与关闭不受影响。 */
    disabled?: boolean
    translations?: Partial<FloatingPanelTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onOpenChange?: (details: FloatingPanelOpenChangeDetails) => void
    /** 位置变化意图回调；拖动过程中会连续发很多次。 */
    onPositionChange?: (details: FloatingPanelPositionChangeDetails) => void
    /** 尺寸变化意图回调；改尺过程中会连续发很多次。 */
    onDimensionsChange?: (details: FloatingPanelDimensionsChangeDetails) => void
    onWindowStateChange?: (details: FloatingPanelWindowStateChangeDetails) => void
  }
  context: {
    /** 面板左上角坐标。受控（position 给定）时 cell 直读 prop，写只发回调不改内部值。 */
    position: FloatingPanelPosition
    /** 面板尺寸，恒已夹进 minSize / maxSize。 */
    dimensions: FloatingPanelSize
    windowState: FloatingPanelWindowState
  }
  computed: Record<string, never>
  refs: FloatingPanelRefs
  state: 'closed' | 'open' | 'open.dragging' | 'open.idle' | 'open.resizing'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'close-trigger' | 'esc' }
    | { type: 'TOGGLE' }
    /** 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知。 */
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'POSITION.SET', position: FloatingPanelPosition }
    /** 键盘平移：dx/dy 是屏幕坐标里的位移，向右、向下为正。 */
    | { type: 'POSITION.NUDGE', dx: number, dy: number }
    | { type: 'DIMENSIONS.SET', dimensions: FloatingPanelSize }
    /** 键盘改尺：推的是 edge 那条边，位移同样是屏幕坐标。 */
    | { type: 'DIMENSIONS.NUDGE', edge: FloatingPanelResizeEdge, dx: number, dy: number }
    | { type: 'WINDOW_STATE.SET', windowState: FloatingPanelWindowState }
    | { type: 'DRAG.START', point: FloatingPanelPoint }
    | { type: 'RESIZE.START', edge: FloatingPanelResizeEdge, point: FloatingPanelPoint }
    | { type: 'DRAG.MOVE', point: FloatingPanelPoint }
    | { type: 'DRAG.END' }
  tag: never
  guard: 'canDrag' | 'canInteract' | 'canResize' | 'isOpenControlled'
  action:
    | 'invokeOnClose'
    | 'invokeOnOpen'
    | 'syncOpen'
    | 'setPosition'
    | 'nudgePosition'
    | 'setDimensions'
    | 'nudgeDimensions'
    | 'setWindowState'
    | 'startSession'
    | 'dragMove'
  effect: 'trackPointer'
}

export interface FloatingPanelApi<T extends PropTypes = PropTypes> {
  open: boolean
  windowState: FloatingPanelWindowState
  position: FloatingPanelPosition
  dimensions: FloatingPanelSize
  /** 正在被指针搬动。 */
  dragging: boolean
  /** 正在被指针改尺。 */
  resizing: boolean
  disabled: boolean
  /** 眼下搬不搬得动：作者允许、未禁用、且不是铺满形态。 */
  canDrag: boolean
  /** 眼下改不改得了尺寸：作者允许、未禁用、且是常规形态。 */
  canResize: boolean
  setOpen: (next: boolean) => void
  setPosition: (next: FloatingPanelPosition) => void
  /** 尺寸会被夹进 minSize / maxSize 之后才落地。 */
  setDimensions: (next: FloatingPanelSize) => void
  setWindowState: (next: FloatingPanelWindowState) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getHeaderProps: () => T['element']
  getTitleProps: () => T['element']
  getDragTriggerProps: () => T['button']
  /** 把手是 role=separator 的元素而不是按钮：方向键推边，激活键在这里没有语义。 */
  getResizeTriggerProps: (props: FloatingPanelResizeTriggerProps) => T['element']
  getWindowStateTriggerProps: (props: FloatingPanelWindowStateTriggerProps) => T['button']
  getCloseTriggerProps: () => T['button']
  getBodyProps: () => T['element']
}
