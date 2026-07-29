// PositionEnginePort：浮层定位端口的类型契约，实现在 @xihan-ui/position-floating-ui。

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

export interface PositionOptions {
  placement?: Placement
  offset?: number
  /** 是否 flip/shift 自动避让。 */
  flip?: boolean
  shift?: boolean
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
