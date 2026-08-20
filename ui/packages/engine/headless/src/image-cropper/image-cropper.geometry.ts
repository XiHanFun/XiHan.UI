// 裁切矩形的纯几何：不碰 DOM、不认识状态机。单位一律是源图的自然像素。

import type { ImageCropperHandlePosition, ImageCropperRect, ImageCropperSize } from './image-cropper.types'

/** 八个把手的方位，顺序即皮肤与示例里铺开的顺序（先四角、后四边）。 */
export const CROP_HANDLES: readonly ImageCropperHandlePosition[] = ['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w']

/** 把手在横轴上动哪条边：-1 动起始边（左），1 动终止边（右），0 这条轴不动。 */
const HANDLE_X: Record<ImageCropperHandlePosition, -1 | 0 | 1> = {
  nw: -1,
  n: 0,
  ne: 1,
  e: 1,
  se: 1,
  s: 0,
  sw: -1,
  w: -1,
}

/** 把手在纵轴上动哪条边：-1 动上边，1 动下边，0 这条轴不动。 */
const HANDLE_Y: Record<ImageCropperHandlePosition, -1 | 0 | 1> = {
  nw: -1,
  n: -1,
  ne: -1,
  e: 0,
  se: 1,
  s: 1,
  sw: 1,
  w: 0,
}

/** 裁切框要同时满足的三件事：不出图、不小于下限、（可选）锁死宽高比。 */
export interface CropConstraints {
  /** 图片自然尺寸；两项为 0 表示图片还没加载，此时不做出界夹取。 */
  bounds: ImageCropperSize
  minWidth: number
  minHeight: number
  /** 宽 ÷ 高；null 即不锁比例。 */
  aspectRatio: number | null
}

/** 屏幕位移换算成图片位移时要知道的三件事。 */
export interface CropProjection {
  /** 视口宽度 ÷ 图片自然宽度，即未缩放时一个自然像素占多少屏幕像素。 */
  scale: number
  zoom: number
  /** 旋转角度，单位度。 */
  rotation: number
}

/** 比例只认有限的正数，其余（null / undefined / 0 / NaN）一律当作不锁比例。 */
export function resolveAspectRatio(input: number | null | undefined): number | null {
  return typeof input === 'number' && Number.isFinite(input) && input > 0 ? input : null
}

function toFinite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback
}

/**
 * 把裁切框收进合法范围：先吃最小尺寸与比例，再夹进图片，最后取整。
 * 取整放在最后一步：矩形描述的是像素格子，半个像素既存不进表单也裁不出图。
 */
export function normalizeCropRect(rect: ImageCropperRect, c: CropConstraints): ImageCropperRect {
  const ratio = resolveAspectRatio(c.aspectRatio)
  const boundW = toFinite(c.bounds.width)
  const boundH = toFinite(c.bounds.height)
  const minW = Math.max(0, toFinite(c.minWidth))
  const minH = Math.max(0, toFinite(c.minHeight))

  let width = Math.max(toFinite(rect.width), minW)
  let height = Math.max(toFinite(rect.height), minH)
  if (ratio) {
    // 两条下限都要满足，取撑得开的那一份
    width = Math.max(width, height * ratio)
    height = width / ratio
  }

  // 图片尺寸未知（还没加载）时不夹：夹到 0 会把作者给的初值当场抹平
  if (boundW > 0 && boundH > 0) {
    width = Math.min(width, boundW)
    height = Math.min(height, boundH)
    if (ratio) {
      // 收缩后重新配平，取两条边都装得下的那一份
      width = Math.min(width, height * ratio)
      height = width / ratio
    }
  }

  let x = toFinite(rect.x)
  let y = toFinite(rect.y)
  if (boundW > 0 && boundH > 0) {
    x = Math.min(Math.max(x, 0), Math.max(0, boundW - width))
    y = Math.min(Math.max(y, 0), Math.max(0, boundH - height))
  }

  return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }
}

/** 整体平移：尺寸一点不变，走到图片边界就停住。 */
export function moveCropRect(rect: ImageCropperRect, dx: number, dy: number, c: CropConstraints): ImageCropperRect {
  return normalizeCropRect({ ...rect, x: rect.x + toFinite(dx), y: rect.y + toFinite(dy) }, c)
}

/**
 * 拉某个把手改尺寸：被拉的那条边跟着走，对面那条边钉住不动。
 * 锁了比例时由位移更大的那条轴当驱动，另一条边照比例算出来。
 */
export function resizeCropRect(
  rect: ImageCropperRect,
  position: ImageCropperHandlePosition,
  dx: number,
  dy: number,
  c: CropConstraints,
): ImageCropperRect {
  const hx = HANDLE_X[position]
  const hy = HANDLE_Y[position]
  const ratio = resolveAspectRatio(c.aspectRatio)
  const boundW = toFinite(c.bounds.width)
  const boundH = toFinite(c.bounds.height)

  // 动起始边时，指针往左走一格是把框拉大一格，所以要反号
  let width = rect.width + hx * toFinite(dx)
  let height = rect.height + hy * toFinite(dy)

  if (ratio) {
    if (hx === 0)
      width = height * ratio
    else if (hy === 0)
      height = width / ratio
    else if (Math.abs(width - rect.width) >= Math.abs(height - rect.height))
      height = width / ratio
    else
      width = height * ratio
  }

  // 钉住的那条边到图片边界之间还剩多少地方，框最多长这么大
  if (boundW > 0) {
    const room = hx === -1 ? rect.x + rect.width : boundW - rect.x
    width = Math.min(width, room)
  }
  if (boundH > 0) {
    const room = hy === -1 ? rect.y + rect.height : boundH - rect.y
    height = Math.min(height, room)
  }
  if (ratio) {
    width = Math.min(width, height * ratio)
    height = width / ratio
  }

  // 最小尺寸压在最后：宁可越过边界让 normalizeCropRect 把整框推回来，也不能塌成一条线
  width = Math.max(width, Math.max(0, toFinite(c.minWidth)))
  height = Math.max(height, Math.max(0, toFinite(c.minHeight)))
  if (ratio) {
    width = Math.max(width, height * ratio)
    height = width / ratio
  }

  const x = hx === -1 ? rect.x + rect.width - width : rect.x
  const y = hy === -1 ? rect.y + rect.height - height : rect.y
  return normalizeCropRect({ x, y, width, height }, c)
}

/** 图片刚加载完、还没有裁切框时铺的初值：尽可能大的一块，居中放。 */
export function initialCropRect(c: CropConstraints): ImageCropperRect {
  const boundW = toFinite(c.bounds.width)
  const boundH = toFinite(c.bounds.height)
  if (boundW <= 0 || boundH <= 0)
    return { x: 0, y: 0, width: 0, height: 0 }
  const ratio = resolveAspectRatio(c.aspectRatio)
  let width = boundW
  let height = boundH
  if (ratio) {
    if (boundW / boundH > ratio)
      width = boundH * ratio
    else
      height = boundW / ratio
  }
  return normalizeCropRect({ x: (boundW - width) / 2, y: (boundH - height) / 2, width, height }, c)
}

/**
 * 屏幕上的指针位移换算成图片像素的位移。
 * 图片被缩放并旋转过，所以先把位移按 −rotation 转回图片自己的坐标系，再除以总倍率。
 * 尺子还没就位（视口宽度为 0、图片没加载、倍率为 0）时返回零位移，调用方原地不动。
 */
export function unprojectDelta(dx: number, dy: number, p: CropProjection): { dx: number, dy: number } {
  const k = toFinite(p.scale) * toFinite(p.zoom, 1)
  if (!(k > 0))
    return { dx: 0, dy: 0 }
  const radians = (toFinite(p.rotation) * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return {
    dx: (toFinite(dx) * cos + toFinite(dy) * sin) / k,
    dy: (-toFinite(dx) * sin + toFinite(dy) * cos) / k,
  }
}

/** 表单出口的序列化形态：`x,y,width,height`。 */
export function serializeCropRect(rect: ImageCropperRect): string {
  return `${rect.x},${rect.y},${rect.width},${rect.height}`
}

/** 读回 serializeCropRect 写出的那串；读不出四个有限数就返回 null。 */
export function parseCropRect(text: string): ImageCropperRect | null {
  const parts = text.split(',').map(Number)
  if (parts.length !== 4 || parts.some(n => !Number.isFinite(n)))
    return null
  return { x: parts[0]!, y: parts[1]!, width: parts[2]!, height: parts[3]! }
}

/** 两个矩形四个数全等即相等。 */
export function sameCropRect(a: ImageCropperRect, b: ImageCropperRect | undefined): boolean {
  return b != null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

/** 两个尺寸两个数全等即相等。 */
export function sameCropSize(a: ImageCropperSize, b: ImageCropperSize | undefined): boolean {
  return b != null && a.width === b.width && a.height === b.height
}
