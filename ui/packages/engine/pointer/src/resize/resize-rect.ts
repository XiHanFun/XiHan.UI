// 推动一条边之后的矩形。
import type { DndRect } from '../dnd/types'
import type { ResizeConstraints, ResizeEdge, ResizeRectInput } from './types'
import { applyAspectRatio, clampSize, snapSize } from './constraints'

/**
 * 推动某条边之后的矩形。
 *
 * 西边与北边动的是矩形的**起点**，所以位置要跟着走；尺寸先过约束，起点再按
 * 「实际收了多少」回算——顶到下限之后对边才不会继续漂。
 *
 * 约束的次序是 吸附 → 宽高比 → 上下限 → 容器。
 * **夹取优先于比例**：顶到容器或上下限时比例会破，因为边界是硬约束而比例是意图。
 * 反过来（保比例、越界）会把矩形推到看得见的容器外面，那更糟。
 */
export function resizeRect(input: ResizeRectInput): DndRect {
  const { rect, edge, delta, constraints } = input

  const east = edge.includes('e')
  const west = edge.includes('w')
  const north = edge.includes('n')
  const south = edge.includes('s')

  const dx = finite(delta.x)
  const dy = finite(delta.y)

  const rawWidth = east ? rect.width + dx : west ? rect.width - dx : rect.width
  const rawHeight = south ? rect.height + dy : north ? rect.height - dy : rect.height

  let size = snapSize({ width: rawWidth, height: rawHeight }, constraints?.step)
  size = applyAspectRatio(size, constraints?.aspectRatio, ratioAxis(edge))
  size = clampSize(size, constraints)

  let next: DndRect = {
    // 动起点的那两条边：起点按实际收了多少回退，不按指针走了多少
    x: west ? finite(rect.x) + (finite(rect.width) - size.width) : finite(rect.x),
    y: north ? finite(rect.y) + (finite(rect.height) - size.height) : finite(rect.y),
    width: size.width,
    height: size.height,
  }

  if (constraints?.bounds)
    next = fitInBounds(next, constraints.bounds, { east, west, north, south }, constraints)

  return next
}

/**
 * 主导轴：四条边各按自己那一轴算另一轴；四个角两轴同时在动，一律以宽为准。
 * 取其一才有确定结果，取「位移较大的那一轴」会让同一个拖动路径给出不同落点。
 */
function ratioAxis(edge: ResizeEdge): 'width' | 'height' {
  return edge === 'n' || edge === 's' ? 'height' : 'width'
}

/**
 * 收进容器。
 * 越界的那一侧把尺寸收回来，动起点的边同时把起点顶回容器边上；
 * 收完再过一遍下限，免得为了不越界把尺寸压到负数。
 */
function fitInBounds(
  rect: DndRect,
  bounds: DndRect,
  side: { east: boolean, west: boolean, north: boolean, south: boolean },
  constraints: ResizeConstraints,
): DndRect {
  let { x, y, width, height } = rect
  const left = finite(bounds.x)
  const top = finite(bounds.y)
  const right = left + finite(bounds.width)
  const bottom = top + finite(bounds.height)

  if (side.east && x + width > right)
    width = right - x
  if (side.west && x < left) {
    width -= left - x
    x = left
  }
  if (side.south && y + height > bottom)
    height = bottom - y
  if (side.north && y < top) {
    height -= top - y
    y = top
  }

  const size = clampSize({ width, height }, constraints)
  return {
    // 尺寸被下限顶回去时，动起点的那两条边要跟着退，否则对边会越过容器
    x: side.west ? Math.min(x, x + width - size.width) : x,
    y: side.north ? Math.min(y, y + height - size.height) : y,
    width: size.width,
    height: size.height,
  }
}

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0
}
