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

/** 内建默认矩形与视口四边之间留的余量，也是默认落点离左上角的距离。 */
const VIEWPORT_MARGIN = 24

/** 作者没给 defaultPosition 时的初始落点：离视口左上角留一段，别贴死在角上。 */
export const FLOATING_PANEL_DEFAULT_POSITION: FloatingPanelPosition = { x: VIEWPORT_MARGIN, y: VIEWPORT_MARGIN }

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

/** 视口的量度，由调用方从窗口取来；两条边都取不到时给 null。 */
export interface FloatingPanelViewport {
  width: number
  height: number
}

/** 窗口的可视尺寸；量不出有效值时给 null，夹取整个跳过。 */
export function floatingPanelViewportOf(
  win: { innerWidth?: number, innerHeight?: number } | null | undefined,
): FloatingPanelViewport | null {
  const width = win?.innerWidth
  const height = win?.innerHeight
  if (!Number.isFinite(width) || !Number.isFinite(height) || width! <= 0 || height! <= 0)
    return null
  return { width: width!, height: height! }
}

/**
 * 从 scope 取视口；没有 DOM 的一侧给 null。
 *
 * scope.getWin() 在服务端会抛（它的 getRootNode 兜底到裸 document），而 context 与 connect
 * 在直出时照样各跑一遍，所以取窗口这一步必须先问有没有 DOM。
 */
export function floatingPanelViewportFrom(
  scope: { getWin: () => { innerWidth?: number, innerHeight?: number } },
): FloatingPanelViewport | null {
  if (typeof document === 'undefined')
    return null
  return floatingPanelViewportOf(scope.getWin())
}

/**
 * 把一份矩形夹进视口：先按「四边各留一段余量」收尺寸，再把落点推回视口内。
 *
 * 尺寸不收到 FLOATING_PANEL_MIN_SIZE 以下——视口比下限还窄时落点归 0，
 * 面板宁可溢出也不塌成一条谁也点不着的窄缝。视口给 null 即原样返回。
 */
export function fitFloatingPanelToViewport(
  position: FloatingPanelPosition,
  size: FloatingPanelSize,
  viewport: FloatingPanelViewport | null | undefined,
): { position: FloatingPanelPosition, size: FloatingPanelSize } {
  if (!viewport)
    return { position, size }
  const width = Math.max(FLOATING_PANEL_MIN_SIZE.width, Math.min(size.width, viewport.width - VIEWPORT_MARGIN * 2))
  const height = Math.max(FLOATING_PANEL_MIN_SIZE.height, Math.min(size.height, viewport.height - VIEWPORT_MARGIN * 2))
  return {
    position: {
      x: Math.max(0, Math.min(finite(position.x), viewport.width - width - VIEWPORT_MARGIN)),
      y: Math.max(0, Math.min(finite(position.y), viewport.height - height - VIEWPORT_MARGIN)),
    },
    size: { width, height },
  }
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
