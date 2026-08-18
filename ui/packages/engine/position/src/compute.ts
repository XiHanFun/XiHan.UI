import type { Align, Direction, Placement, Side } from '@xihan-ui/kernel'

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
  /**
   * 文字方向，缺省 ltr。只改写行内轴（top / bottom 两侧）上 start 与 end 的落点：
   * RTL 下 start 与锚点的右缘齐平。块轴（left / right 两侧）不受方向影响。
   */
  dir?: Direction
  /** 要箭头落点就把箭头的量交进来；不给则不算。 */
  arrow?: { size: number, padding?: number }
  /** 要可用空间就把量交进来；不给则不算。padding 是浮层距可用区域边缘的最小距离。 */
  size?: { padding?: number }
}

export interface ComputeOutput {
  x: number
  y: number
  /** 落定后的 placement。翻面时与请求的不同。 */
  placement: Placement
  /** 箭头中心距浮层起始缘的距离，只给交叉轴那一根；没要箭头时缺席。 */
  arrow?: { x?: number, y?: number }
  /** 落定那一侧还剩多少空间；没要可用空间时缺席。 */
  availableWidth?: number
  availableHeight?: number
  /** 锚点矩形的宽度；没要可用空间时缺席。 */
  anchorWidth?: number
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

/**
 * 行内轴上把逻辑对齐解析成物理对齐：RTL 下 start 在右、end 在左。
 * 块轴（left / right 两侧的纵向对齐）不受文字方向影响，不走这里。
 */
function inlineAlign(align: Align, dir: Direction | undefined): Align {
  if (dir !== 'rtl' || align === 'center')
    return align
  return align === 'start' ? 'end' : 'start'
}

/** 某一侧的落点，不含任何避让。 */
function coordsFor(input: ComputeInput, side: Side, align: Align): { x: number, y: number } {
  const { anchor, floating, offset } = input
  const inline = inlineAlign(align, input.dir)
  switch (side) {
    case 'top':
      return { x: alignOn(anchor.x, anchor.width, floating.width, inline), y: anchor.y - floating.height - offset }
    case 'bottom':
      return { x: alignOn(anchor.x, anchor.width, floating.width, inline), y: anchor.y + anchor.height + offset }
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

/**
 * 箭头中心在浮层里的落点：对准锚点中心，两端各留出半个箭头与圆角的余量。
 * 取的是落定后的 coords，翻面与挪位的位移都已经算在里面，不必另外补偿。
 */
function arrowOn(
  input: ComputeInput,
  side: Side,
  coords: { x: number, y: number },
): { x?: number, y?: number } | undefined {
  const spec = input.arrow
  if (!spec)
    return undefined
  const margin = spec.size / 2 + Math.max(0, spec.padding ?? 0)
  if (isVertical(side)) {
    const width = input.floating.width
    const center = input.anchor.x + input.anchor.width / 2 - coords.x
    // 浮层比两端余量加起来还窄：钳不出区间，退回浮层中点
    const x = width < margin * 2 ? width / 2 : clamp(center, margin, width - margin)
    // 皮肤用 inset-inline-start 消费，RTL 下它量的是距右缘
    return { x: input.dir === 'rtl' ? width - x : x }
  }
  const height = input.floating.height
  const center = input.anchor.y + input.anchor.height / 2 - coords.y
  // 块轴与文字方向无关，不翻
  return { y: height < margin * 2 ? height / 2 : clamp(center, margin, height - margin) }
}

/** 主轴上这一侧还剩多少：从可用区域那条边量到锚点那条边，扣掉 offset 与 padding。 */
function mainAxisSpace(input: ComputeInput, side: Side, pad: number): number {
  const { anchor, clip, offset } = input
  switch (side) {
    case 'top':
      return anchor.y - clip.top - offset - pad
    case 'bottom':
      return clip.bottom - (anchor.y + anchor.height) - offset - pad
    case 'left':
      return anchor.x - clip.left - offset - pad
    case 'right':
      return clip.right - (anchor.x + anchor.width) - offset - pad
  }
}

/**
 * 落定这一侧后的可用空间：主轴量到锚点，交叉轴按可用区域整条边算（shift 最多也就挪这么宽）。
 * 负值归零，调用方拿它当 CSS 长度用，负长度会让整条声明失效。
 */
function spaceOn(
  input: ComputeInput,
  side: Side,
  spec: { padding?: number },
): { availableWidth: number, availableHeight: number } {
  const pad = Math.max(0, spec.padding ?? 0)
  const main = Math.max(0, mainAxisSpace(input, side, pad))
  const crossWidth = Math.max(0, input.clip.right - input.clip.left - pad * 2)
  const crossHeight = Math.max(0, input.clip.bottom - input.clip.top - pad * 2)
  return isVertical(side)
    ? { availableWidth: crossWidth, availableHeight: main }
    : { availableWidth: main, availableHeight: crossHeight }
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

  // 箭头算在最后：side 已翻定、coords 已挪定，锚点中心减落点就是箭头该站的地方
  const output: ComputeOutput = {
    x: coords.x,
    y: coords.y,
    placement: joinPlacement(side, align),
    arrow: arrowOn(input, side, coords),
  }

  // 可用空间同样算在最后：量的必须是 side 翻定之后那一侧，按请求的那一侧算会差出整整一个面板
  if (!input.size)
    return output
  return { ...output, ...spaceOn(input, side, input.size), anchorWidth: input.anchor.width }
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

/**
 * 一根轴上锚点是否完全落在可用区间之外。
 * 零长度的锚点（光标这类点锚点）按点判：压在边界上仍算在区间内。
 */
function clippedOnAxis(start: number, size: number, min: number, max: number): boolean {
  if (size <= 0)
    return start < min || start > max
  return start + size <= min || start >= max
}

/** 锚点是否被可用区域整个挡住了。任意一侧完全出界即算。 */
export function isFullyClipped(anchor: PositionBox, clip: PositionEdges): boolean {
  return clippedOnAxis(anchor.y, anchor.height, clip.top, clip.bottom)
    || clippedOnAxis(anchor.x, anchor.width, clip.left, clip.right)
}
