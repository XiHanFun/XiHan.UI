// 尺寸调整的类型契约。这一层只算几何，不碰 DOM。
import type { DndRect } from '../dnd/types'

/**
 * 推动的是哪条边。
 * 单字母是四条边，两字母是四个角——角同时动两条边。
 */
export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export interface ResizeConstraints {
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  /**
   * 宽高比（宽 ÷ 高）。给了就锁死：四条边各按自己那一轴算出另一轴，
   * 四个角一律以宽为准——角上两轴同时在动，取其一才有确定结果。
   */
  aspectRatio?: number
  /** 吸附步进：宽高各自落到最近的整数倍。 */
  step?: number
  /** 容器矩形。结果不许越过它，越了就把尺寸收回来。 */
  bounds?: DndRect
}

export interface ResizeRectInput {
  /** 按下那一刻的矩形快照。 */
  rect: DndRect
  edge: ResizeEdge
  /** 指针相对按下点的位移。 */
  delta: { x: number, y: number }
  constraints?: ResizeConstraints
}
