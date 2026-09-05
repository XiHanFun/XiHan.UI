// 面板几何的纯函数：只算数，不碰 DOM，也不认识状态机。

import type { ResizeConstraints } from '@xihan-ui/pointer'
import type {
  FloatingPanelPosition,
  FloatingPanelResizeEdge,
  FloatingPanelSize,
  FloatingPanelWindowState,
} from './floating-panel.types'
import { clampSize, resizeRect } from '@xihan-ui/pointer'

/** 作者没给 minSize 时的尺寸下限：再小标题栏里的按钮就排不下了。 */
export const FLOATING_PANEL_MIN_SIZE: FloatingPanelSize = { width: 160, height: 120 }

/** 作者没给 defaultDimensions 时的初始尺寸。 */
export const FLOATING_PANEL_DEFAULT_SIZE: FloatingPanelSize = { width: 360, height: 240 }

/** 作者没给 defaultPosition 时的初始落点：离视口左上角留一段，别贴死在角上。 */
export const FLOATING_PANEL_DEFAULT_POSITION: FloatingPanelPosition = { x: 24, y: 24 }

/** 方向键每下走多少像素。 */
export const FLOATING_PANEL_STEP = 10

/** Shift + 方向键每下走多少像素。 */
export const FLOATING_PANEL_LARGE_STEP = 50

/**
 * 非有限值收成 0。
 * NaN 会顺着内联样式写进 left/top/width，面板从此整个不见，且没有任何一处会报错。
 */
function finite(value: number): number {
  return Number.isFinite(value) ? value : 0
}

export function sameFloatingPanelPosition(
  a: FloatingPanelPosition,
  b: FloatingPanelPosition | undefined,
): boolean {
  return b != null && a.x === b.x && a.y === b.y
}

export function sameFloatingPanelSize(
  a: FloatingPanelSize,
  b: FloatingPanelSize | undefined,
): boolean {
  return b != null && a.width === b.width && a.height === b.height
}

/**
 * 把尺寸夹进上下限。下限缺省用 FLOATING_PANEL_MIN_SIZE，上限不给即不封顶。
 * 上限比下限还小时以下限为准。
 *
 * 夹取本身由 pointer 的 resize 层做，这里只补面板自己的缺省下限。
 */
export function clampFloatingPanelSize(
  size: FloatingPanelSize,
  min?: FloatingPanelSize,
  max?: FloatingPanelSize,
): FloatingPanelSize {
  return clampSize(size, panelConstraints(min, max))
}

/** 面板的上下限翻成 resize 层的约束形状。下限缺省用面板自己那份。 */
function panelConstraints(min?: FloatingPanelSize, max?: FloatingPanelSize): ResizeConstraints {
  return {
    minWidth: min?.width ?? FLOATING_PANEL_MIN_SIZE.width,
    minHeight: min?.height ?? FLOATING_PANEL_MIN_SIZE.height,
    maxWidth: max?.width,
    maxHeight: max?.height,
  }
}

/** 搬动后的落点。dx / dy 是屏幕坐标里的位移，向右、向下为正。 */
export function moveFloatingPanel(
  position: FloatingPanelPosition,
  dx: number,
  dy: number,
): FloatingPanelPosition {
  return { x: finite(position.x) + finite(dx), y: finite(position.y) + finite(dy) }
}

/**
 * 推动某条边之后的矩形。
 *
 * 几何交给 pointer 的 resize 层：西边与北边动的是起点、顶到下限之后对边不再漂，
 * 这些规则那边统一实现，面板这里只负责把自己的上下限翻过去、把结果拆回位置与尺寸。
 */
export function resizeFloatingPanel(
  position: FloatingPanelPosition,
  size: FloatingPanelSize,
  edge: FloatingPanelResizeEdge,
  dx: number,
  dy: number,
  min?: FloatingPanelSize,
  max?: FloatingPanelSize,
): { position: FloatingPanelPosition, size: FloatingPanelSize } {
  const next = resizeRect({
    rect: { x: finite(position.x), y: finite(position.y), width: size.width, height: size.height },
    edge,
    delta: { x: dx, y: dy },
    constraints: panelConstraints(min, max),
  })
  return {
    position: { x: next.x, y: next.y },
    size: { width: next.width, height: next.height },
  }
}

/**
 * 面板的落位与尺寸，写成内联样式。
 *
 * 用物理的 left / top / width / height：位移来自指针与方向键，那是屏幕坐标，
 * 换成逻辑属性会在 RTL 与竖排书写模式下与手上的方向脱钩。
 * 四个键每帧都写齐，少写一个上一帧的值会留在节点上（改形态时尤其明显）。
 */
export function floatingPanelRectStyle(
  windowState: FloatingPanelWindowState,
  position: FloatingPanelPosition,
  size: FloatingPanelSize,
): Record<string, string> {
  if (windowState === 'maximized')
    return { position: 'fixed', left: '0px', top: '0px', width: '100%', height: '100%' }
  return {
    position: 'fixed',
    left: `${finite(position.x)}px`,
    top: `${finite(position.y)}px`,
    width: `${finite(size.width)}px`,
    // 收拢时高度交给标题栏自己撑：正文已经收起，写死高度会留下一大片空白
    height: windowState === 'minimized' ? 'auto' : `${finite(size.height)}px`,
  }
}
