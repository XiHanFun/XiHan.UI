import type { Direction } from '../types'

// PositionEnginePort：浮层定位端口的类型契约，实现在 @xihan-ui/position。

export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
export type Placement = Side | `${Side}-${Align}`

export interface PositionRect {
  x: number
  y: number
  width: number
  height: number
}

export interface PositionResult {
  x: number
  y: number
  placement: Placement
  /** 是否因空间不足被隐藏（middleware hide）。 */
  hidden: boolean
}

/**
 * 浮层落位用哪套坐标系。
 * absolute 走包含块的布局坐标，会被任何 overflow 祖先裁掉；
 * fixed 走视口坐标，只被劫持了它包含块的那类祖先（transform / filter / contain 等）约束。
 */
export type PositionStrategy = 'absolute' | 'fixed'

export interface PositionOptions {
  placement?: Placement
  offset?: number
  /** 是否 flip/shift 自动避让。 */
  flip?: boolean
  shift?: boolean
  /** 默认 absolute。 */
  strategy?: PositionStrategy
  /**
   * 文字方向，缺省 ltr。只改写行内轴上 start 与 end 的落点：RTL 下 start 与锚点右缘齐平。
   * 块轴（left / right 两侧的纵向对齐）不受方向影响。
   */
  dir?: Direction
}

/** 虚拟锚点（右键菜单 / 文本选区）：只需能给出矩形。 */
export interface VirtualAnchor {
  getBoundingClientRect: () => PositionRect
}

export type Anchor = Element | VirtualAnchor

export interface PositionEnginePort {
  /** 计算并持续更新浮层位置，返回值调用后停止跟随。 */
  attach: (
    anchor: Anchor,
    floating: HTMLElement,
    options: PositionOptions,
    onResult: (result: PositionResult) => void,
  ) => () => void
}
