/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 变换控制柄的几何：八向缩放与旋转柄的位置、按控制柄缩放（可旋转的）矩形、按指针算旋转角、方向键微移。
// 缩放在矩形自身的坐标系里进行，对边或对角保持不动；等比与最小尺寸约束在这里一并处理。

import type { Point, Rect } from './geometry'
import { rectCenter, rotatePoint } from './geometry'

/** 缩放控制柄：四边与四角。 */
export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

/** 全部控制柄：八向缩放加旋转。 */
export type TransformHandle = ResizeHandle | 'rotate'

export interface ResizeOptions {
  /** 保持原宽高比（通常在按住 Shift 时开启）。 */
  readonly keepAspect?: boolean
  /** 以中心为基准两侧同时缩放（通常在按住 Alt 时开启）。 */
  readonly fromCenter?: boolean
  /** 最小宽度，缺省 0。 */
  readonly minWidth?: number
  /** 最小高度，缺省 0。 */
  readonly minHeight?: number
}

export interface RotateOptions {
  /** 角度吸附的步长（度），如按住 Shift 时传 15；缺省不吸附。 */
  readonly step?: number
}

export interface NudgeOptions {
  /** 用大步长（通常在按住 Shift 时开启）。 */
  readonly large?: boolean
  /** 普通步长，缺省 1。 */
  readonly step?: number
  /** 大步长，缺省 10。 */
  readonly largeStep?: number
}

const HANDLE_SIGNS: Readonly<Record<ResizeHandle, readonly [number, number]>> = {
  n: [0, -1],
  s: [0, 1],
  e: [1, 0],
  w: [-1, 0],
  ne: [1, -1],
  nw: [-1, -1],
  se: [1, 1],
  sw: [-1, 1],
}

/** 各控制柄在世界坐标中的位置；旋转柄在上边中点再往外 rotateOffset 处（与矩形同一坐标系）。 */
export function handlePoints(rect: Rect, rotateOffset = 24): Record<TransformHandle, Point> {
  const center = rectCenter(rect)
  const degrees = rect.rotation ?? 0
  const at = (sx: number, sy: number): Point =>
    rotatePoint({ x: center.x + sx * rect.width / 2, y: center.y + sy * rect.height / 2 }, center, degrees)
  const out = {} as Record<TransformHandle, Point>
  for (const [handle, [sx, sy]] of Object.entries(HANDLE_SIGNS) as [ResizeHandle, readonly [number, number]][])
    out[handle] = at(sx, sy)
  out.rotate = rotatePoint({ x: center.x, y: rect.y - rotateOffset }, center, degrees)
  return out
}

/**
 * 拖动缩放控制柄到 pointer（世界坐标）后的矩形：旋转角不变，对边或对角（fromCenter 时为中心）保持不动，
 * 拖过对边时停在最小尺寸上，不翻转。
 */
export function resizeWithHandle<R extends Rect>(start: R, handle: ResizeHandle, pointer: Point, options: ResizeOptions = {}): R {
  const signs = HANDLE_SIGNS[handle]
  if (!signs)
    throw new RangeError(`[designer-kit] unknown resize handle "${String(handle)}"`)
  const [sx, sy] = signs
  const minWidth = options.minWidth ?? 0
  const minHeight = options.minHeight ?? 0
  if (!(minWidth >= 0) || !(minHeight >= 0))
    throw new RangeError('[designer-kit] minimum size must be non-negative')
  const degrees = start.rotation ?? 0
  const center = rectCenter(start)
  const local = rotatePoint(pointer, center, -degrees)
  const lx = local.x - center.x
  const ly = local.y - center.y
  const fromCenter = options.fromCenter === true

  const extent = (sign: number, offset: number, size: number): number => {
    if (sign === 0)
      return size
    return fromCenter ? 2 * sign * offset : sign * offset + size / 2
  }
  let width = Math.max(minWidth, extent(sx, lx, start.width))
  let height = Math.max(minHeight, extent(sy, ly, start.height))

  if (options.keepAspect && start.width > 0 && start.height > 0) {
    const scaleX = width / start.width
    const scaleY = height / start.height
    let scale = sx === 0 ? scaleY : sy === 0 ? scaleX : Math.max(scaleX, scaleY)
    scale = Math.max(scale, minWidth / start.width, minHeight / start.height)
    width = start.width * scale
    height = start.height * scale
  }

  const shift = (sign: number, size: number, original: number): number =>
    fromCenter || sign === 0 ? 0 : sign * (size - original) / 2
  const nextCenter = rotatePoint(
    { x: center.x + shift(sx, width, start.width), y: center.y + shift(sy, height, start.height) },
    center,
    degrees,
  )
  return { ...start, x: nextCenter.x - width / 2, y: nextCenter.y - height / 2, width, height }
}

/** 拖动旋转柄到 pointer（世界坐标）后的旋转角（度，0–360）；旋转柄朝上时为 0。 */
export function rotateWithHandle(start: Rect, pointer: Point, options: RotateOptions = {}): number {
  const center = rectCenter(start)
  let degrees = Math.atan2(pointer.y - center.y, pointer.x - center.x) * 180 / Math.PI + 90
  if (options.step !== undefined) {
    if (!(options.step > 0))
      throw new RangeError(`[designer-kit] rotation step must be positive, got ${options.step}`)
    degrees = Math.round(degrees / options.step) * options.step
  }
  return ((degrees % 360) + 360) % 360
}

/** 方向键对应的位移；不是方向键时返回 undefined。 */
export function nudgeDelta(key: string, options: NudgeOptions = {}): { dx: number, dy: number } | undefined {
  const distance = options.large ? (options.largeStep ?? 10) : (options.step ?? 1)
  switch (key) {
    case 'ArrowLeft':
      return { dx: -distance, dy: 0 }
    case 'ArrowRight':
      return { dx: distance, dy: 0 }
    case 'ArrowUp':
      return { dx: 0, dy: -distance }
    case 'ArrowDown':
      return { dx: 0, dy: distance }
    default:
      return undefined
  }
}
