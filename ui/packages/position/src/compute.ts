import type { Align, Placement, Side } from '@xihan-ui/core'

/**
 * 摆放浮层的纯计算层：给定锚点矩形、浮层尺寸与可用区域，算出浮层该落在哪儿。
 * 不碰 DOM，也不认识坐标系是谁的——调用方把三者换算到同一套坐标里再进来。
 */

/** 矩形，左上角加宽高。 */
export interface PositionBox {
  x: number
  y: number
  width: number
  height: number
}

/** 区域，四条边。 */
export interface PositionEdges {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ComputeInput {
  anchor: PositionBox
  floating: { width: number, height: number }
  /** 可用区域。flip 与 shift 都以它为界。 */
  clip: PositionEdges
  placement: Placement
  /** 浮层与锚点之间的主轴间距。 */
  offset: number
  flip: boolean
  shift: boolean
  /** shift 贴边时留出的余量。 */
  padding: number
}

export interface ComputeOutput {
  x: number
  y: number
  /** 落定后的 placement。翻面时与请求的不同。 */
  placement: Placement
}

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

/** 主轴是竖直方向（浮层落在锚点上方或下方）。 */
function isVertical(side: Side): boolean {
  return side === 'top' || side === 'bottom'
}

export function splitPlacement(placement: Placement): { side: Side, align: Align } {
  const [side, align] = placement.split('-') as [Side, Align | undefined]
  return { side, align: align ?? 'center' }
}

export function joinPlacement(side: Side, align: Align): Placement {
  return (align === 'center' ? side : `${side}-${align}`) as Placement
}

/** 交叉轴上按 align 取起点：start 与锚点起始缘齐平，end 与结束缘齐平，center 居中。 */
function alignOn(anchorStart: number, anchorSize: number, floatingSize: number, align: Align): number {
  if (align === 'start')
    return anchorStart
  if (align === 'end')
    return anchorStart + anchorSize - floatingSize
  return anchorStart + anchorSize / 2 - floatingSize / 2
}

/** 某一侧的落点，不含任何避让。 */
function coordsFor(input: ComputeInput, side: Side, align: Align): { x: number, y: number } {
  const { anchor, floating, offset } = input
  switch (side) {
    case 'top':
      return { x: alignOn(anchor.x, anchor.width, floating.width, align), y: anchor.y - floating.height - offset }
    case 'bottom':
      return { x: alignOn(anchor.x, anchor.width, floating.width, align), y: anchor.y + anchor.height + offset }
    case 'left':
      return { x: anchor.x - floating.width - offset, y: alignOn(anchor.y, anchor.height, floating.height, align) }
    case 'right':
      return { x: anchor.x + anchor.width + offset, y: alignOn(anchor.y, anchor.height, floating.height, align) }
  }
}

/** 落在这一侧时越出可用区域多少。小于等于 0 即没越出。 */
function overflowOn(
  coords: { x: number, y: number },
  floating: { width: number, height: number },
  clip: PositionEdges,
  side: Side,
): number {
  switch (side) {
    case 'top':
      return clip.top - coords.y
    case 'bottom':
      return coords.y + floating.height - clip.bottom
    case 'left':
      return clip.left - coords.x
    case 'right':
      return coords.x + floating.width - clip.right
  }
}

/** 夹在 [min, max] 内。区域比浮层还窄时以 min 为准，宁可从起始缘伸出去。 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

export function computePlacement(input: ComputeInput): ComputeOutput {
  const requested = splitPlacement(input.placement)
  let side = requested.side
  const align = requested.align
  let coords = coordsFor(input, side, align)

  // 主轴放不下就翻到对侧，对侧越出得更多则不翻——两边都放不下时守着请求的那一侧
  if (input.flip) {
    const overflow = overflowOn(coords, input.floating, input.clip, side)
    if (overflow > 0) {
      const opposite = OPPOSITE[side]
      const flipped = coordsFor(input, opposite, align)
      if (overflowOn(flipped, input.floating, input.clip, opposite) < overflow) {
        side = opposite
        coords = flipped
      }
    }
  }

  // 交叉轴顶到边就沿轴挪回来，不改落在哪一侧
  if (input.shift) {
    const pad = Math.max(0, input.padding)
    if (isVertical(side)) {
      coords = {
        ...coords,
        x: clamp(coords.x, input.clip.left + pad, input.clip.right - pad - input.floating.width),
      }
    }
    else {
      coords = {
        ...coords,
        y: clamp(coords.y, input.clip.top + pad, input.clip.bottom - pad - input.floating.height),
      }
    }
  }

  return { x: coords.x, y: coords.y, placement: joinPlacement(side, align) }
}

/** 两个区域的交集。不相交时给出的区域宽高为负，调用方按空处理。 */
export function intersectEdges(a: PositionEdges, b: PositionEdges): PositionEdges {
  return {
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
    left: Math.max(a.left, b.left),
  }
}

/** 锚点是否被可用区域整个挡住了。任意一侧完全出界即算。 */
export function isFullyClipped(anchor: PositionBox, clip: PositionEdges): boolean {
  return anchor.y + anchor.height <= clip.top
    || anchor.y >= clip.bottom
    || anchor.x + anchor.width <= clip.left
    || anchor.x >= clip.right
}
