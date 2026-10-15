/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 视口的平移缩放数学：屏幕坐标 = 世界坐标 × zoom + (x, y)。所有函数返回新视口，不修改输入。

import type { Point, Rect, Size } from './geometry'

/** 视口：平移量（屏幕像素）与缩放倍数。 */
export interface Viewport {
  readonly x: number
  readonly y: number
  readonly zoom: number
}

/** 缩放倍数的上下限。 */
export interface ZoomLimits {
  readonly min: number
  readonly max: number
}

/** 未平移、未缩放的视口。 */
export const DEFAULT_VIEWPORT: Viewport = /* @__PURE__ */ Object.freeze({ x: 0, y: 0, zoom: 1 })

/** 缺省缩放范围 0.1–4。 */
export const DEFAULT_ZOOM_LIMITS: ZoomLimits = /* @__PURE__ */ Object.freeze({ min: 0.1, max: 4 })

function checkLimits(limits: ZoomLimits): ZoomLimits {
  if (!(limits.min > 0) || !(limits.max >= limits.min) || !Number.isFinite(limits.max))
    throw new RangeError(`[designer-kit] zoom limits must satisfy 0 < min <= max < Infinity, got ${limits.min}–${limits.max}`)
  return limits
}

/** 把缩放倍数夹进上下限。 */
export function clampZoom(zoom: number, limits: ZoomLimits = DEFAULT_ZOOM_LIMITS): number {
  const { min, max } = checkLimits(limits)
  if (!(zoom > 0))
    throw new RangeError(`[designer-kit] zoom must be a positive number, got ${zoom}`)
  return Math.min(max, Math.max(min, zoom))
}

/** 屏幕坐标 → 世界坐标。 */
export function screenToWorld(viewport: Viewport, point: Point): Point {
  return { x: (point.x - viewport.x) / viewport.zoom, y: (point.y - viewport.y) / viewport.zoom }
}

/** 世界坐标 → 屏幕坐标。 */
export function worldToScreen(viewport: Viewport, point: Point): Point {
  return { x: point.x * viewport.zoom + viewport.x, y: point.y * viewport.zoom + viewport.y }
}

/** 屏幕矩形 → 世界矩形。 */
export function screenRectToWorld(viewport: Viewport, rect: Rect): Rect {
  const origin = screenToWorld(viewport, rect)
  return { x: origin.x, y: origin.y, width: rect.width / viewport.zoom, height: rect.height / viewport.zoom }
}

/** 世界矩形 → 屏幕矩形。 */
export function worldRectToScreen(viewport: Viewport, rect: Rect): Rect {
  const origin = worldToScreen(viewport, rect)
  return { x: origin.x, y: origin.y, width: rect.width * viewport.zoom, height: rect.height * viewport.zoom }
}

/** 视口里看得到的世界矩形。 */
export function visibleWorldRect(viewport: Viewport, size: Size): Rect {
  return screenRectToWorld(viewport, { x: 0, y: 0, width: size.width, height: size.height })
}

/** 平移若干屏幕像素。 */
export function panBy(viewport: Viewport, dx: number, dy: number): Viewport {
  return { x: viewport.x + dx, y: viewport.y + dy, zoom: viewport.zoom }
}

/** 缩放到 zoom（先夹进上下限），屏幕上 anchor 处对着的世界点保持不动。 */
export function zoomTo(viewport: Viewport, zoom: number, anchor: Point, limits: ZoomLimits = DEFAULT_ZOOM_LIMITS): Viewport {
  const next = clampZoom(zoom, limits)
  const world = screenToWorld(viewport, anchor)
  return { x: anchor.x - world.x * next, y: anchor.y - world.y * next, zoom: next }
}

/** 按倍数缩放，屏幕上 anchor 处对着的世界点保持不动。 */
export function zoomBy(viewport: Viewport, factor: number, anchor: Point, limits: ZoomLimits = DEFAULT_ZOOM_LIMITS): Viewport {
  if (!(factor > 0) || !Number.isFinite(factor))
    throw new RangeError(`[designer-kit] zoom factor must be a positive finite number, got ${factor}`)
  return zoomTo(viewport, viewport.zoom * factor, anchor, limits)
}

/** 滚轮滚动量换成缩放倍数：向上滚放大、向下滚缩小，按行或按页滚动先折成像素。 */
export function wheelZoomFactor(deltaY: number, deltaMode = 0, speed = 0.002): number {
  const pixels = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 800 : deltaY
  return Math.exp(-pixels * speed)
}

export interface FitOptions {
  /** 内容四周留出的屏幕像素，缺省 24。 */
  readonly padding?: number
  /** 适配时最大的缩放倍数，缺省 1：小内容不放大。 */
  readonly maxZoom?: number
  readonly limits?: ZoomLimits
}

/** 缩放并平移到让 bounds 整个落在视口中央。 */
export function fitRect(bounds: Rect, size: Size, options: FitOptions = {}): Viewport {
  const padding = options.padding ?? 24
  const limits = options.limits ?? DEFAULT_ZOOM_LIMITS
  const maxZoom = options.maxZoom ?? 1
  const availableWidth = Math.max(0, size.width - padding * 2)
  const availableHeight = Math.max(0, size.height - padding * 2)
  const scales = [maxZoom]
  if (bounds.width > 0)
    scales.push(availableWidth / bounds.width)
  if (bounds.height > 0)
    scales.push(availableHeight / bounds.height)
  const zoom = clampZoom(Math.max(Math.min(...scales), Number.MIN_VALUE), limits)
  return centerOn({ x: 0, y: 0, zoom }, { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }, size)
}

/** 缩放不变，把世界点移到视口中央。 */
export function centerOn(viewport: Viewport, point: Point, size: Size): Viewport {
  return { x: size.width / 2 - point.x * viewport.zoom, y: size.height / 2 - point.y * viewport.zoom, zoom: viewport.zoom }
}

/** 世界矩形已整个落在视口内（四周留 padding 屏幕像素）时原样返回视口，否则把它居中。 */
export function revealRect(viewport: Viewport, rect: Rect, size: Size, padding = 0): Viewport {
  const screen = worldRectToScreen(viewport, rect)
  const inside = screen.x >= padding && screen.y >= padding
    && screen.x + screen.width <= size.width - padding
    && screen.y + screen.height <= size.height - padding
  return inside ? viewport : centerOn(viewport, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, size)
}

/**
 * 限制平移：内容在每个方向上至少留 keep 屏幕像素在视口内（内容比 keep 窄时整个留在视口内），
 * 防止把内容整个拖出视野。
 */
export function constrainViewport(viewport: Viewport, content: Rect, size: Size, keep = 48): Viewport {
  const screen = worldRectToScreen(viewport, content)
  const clampAxis = (offset: number, start: number, length: number, extent: number): number => {
    const visible = Math.min(keep, length, extent)
    const low = visible - (start + length)
    const high = extent - visible - start
    return offset + Math.min(Math.max(0, low), high)
  }
  return {
    x: clampAxis(viewport.x, screen.x, screen.width, size.width),
    y: clampAxis(viewport.y, screen.y, screen.height, size.height),
    zoom: viewport.zoom,
  }
}
