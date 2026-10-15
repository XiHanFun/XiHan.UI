// 视口数学：坐标互转可逆、锚点缩放时锚点不动、缩放夹在上下限内、适配与居中、按需显露、限制平移范围。
import type { Viewport } from '../src'
import { describe, expect, it } from 'vitest'
import {
  centerOn,
  clampZoom,
  constrainViewport,
  DEFAULT_VIEWPORT,
  DEFAULT_ZOOM_LIMITS,
  fitRect,
  panBy,
  revealRect,
  screenRectToWorld,
  screenToWorld,
  visibleWorldRect,
  wheelZoomFactor,
  worldRectToScreen,
  worldToScreen,
  zoomBy,
  zoomTo,
} from '../src'

const size = { width: 800, height: 600 }

describe('视口', () => {
  it('缺省视口与缩放范围', () => {
    expect(DEFAULT_VIEWPORT).toEqual({ x: 0, y: 0, zoom: 1 })
    expect(Object.isFrozen(DEFAULT_VIEWPORT)).toBe(true)
    expect(DEFAULT_ZOOM_LIMITS).toEqual({ min: 0.1, max: 4 })
  })

  it('屏幕坐标与世界坐标互转可逆', () => {
    const viewport: Viewport = { x: 120, y: -40, zoom: 1.5 }
    const world = { x: 10, y: 20 }
    const screen = worldToScreen(viewport, world)
    expect(screen).toEqual({ x: 135, y: -10 })
    expect(screenToWorld(viewport, screen)).toEqual(world)
    const rect = { x: 10, y: 20, width: 100, height: 40 }
    expect(screenRectToWorld(viewport, worldRectToScreen(viewport, rect))).toEqual(rect)
  })

  it('看得到的世界矩形', () => {
    expect(visibleWorldRect({ x: -100, y: -50, zoom: 2 }, size)).toEqual({ x: 50, y: 25, width: 400, height: 300 })
  })

  it('平移', () => {
    expect(panBy({ x: 1, y: 2, zoom: 3 }, 10, -5)).toEqual({ x: 11, y: -3, zoom: 3 })
  })

  it('锚点缩放时锚点对着的世界点不动', () => {
    const viewport: Viewport = { x: 30, y: 40, zoom: 1 }
    const anchor = { x: 200, y: 150 }
    const before = screenToWorld(viewport, anchor)
    const zoomed = zoomBy(viewport, 2, anchor)
    expect(zoomed.zoom).toBe(2)
    const after = screenToWorld(zoomed, anchor)
    expect(after.x).toBeCloseTo(before.x)
    expect(after.y).toBeCloseTo(before.y)
  })

  it('缩放夹在上下限内', () => {
    expect(zoomTo(DEFAULT_VIEWPORT, 100, { x: 0, y: 0 }).zoom).toBe(4)
    expect(zoomBy(DEFAULT_VIEWPORT, 0.001, { x: 0, y: 0 }, { min: 0.5, max: 2 }).zoom).toBe(0.5)
    expect(clampZoom(1.5, { min: 0.2, max: 2 })).toBe(1.5)
  })

  it('非法缩放参数报错', () => {
    expect(() => clampZoom(0)).toThrow(RangeError)
    expect(() => clampZoom(1, { min: 0, max: 1 })).toThrow(RangeError)
    expect(() => clampZoom(1, { min: 2, max: 1 })).toThrow(RangeError)
    expect(() => zoomBy(DEFAULT_VIEWPORT, -1, { x: 0, y: 0 })).toThrow(RangeError)
  })

  it('滚轮向上放大、向下缩小，按行与按页先折成像素', () => {
    expect(wheelZoomFactor(-100)).toBeGreaterThan(1)
    expect(wheelZoomFactor(100)).toBeLessThan(1)
    expect(wheelZoomFactor(100) * wheelZoomFactor(-100)).toBeCloseTo(1)
    expect(wheelZoomFactor(1, 1)).toBeCloseTo(wheelZoomFactor(16))
    expect(wheelZoomFactor(1, 2)).toBeCloseTo(wheelZoomFactor(800))
  })

  it('适配：大内容缩小到放得下并居中，小内容不放大', () => {
    const big = fitRect({ x: 0, y: 0, width: 1408, height: 400 }, size, { padding: 48 })
    expect(big.zoom).toBeCloseTo(0.5)
    const center = worldToScreen(big, { x: 704, y: 200 })
    expect(center.x).toBeCloseTo(400)
    expect(center.y).toBeCloseTo(300)
    expect(fitRect({ x: 10, y: 10, width: 100, height: 50 }, size).zoom).toBe(1)
    expect(fitRect({ x: 10, y: 10, width: 100, height: 50 }, size, { maxZoom: 3 }).zoom).toBeCloseTo(3)
    expect(fitRect({ x: 5, y: 5, width: 0, height: 0 }, size)).toEqual({ x: 395, y: 295, zoom: 1 })
  })

  it('居中到世界点', () => {
    const viewport = centerOn({ x: 0, y: 0, zoom: 2 }, { x: 100, y: 50 }, size)
    expect(worldToScreen(viewport, { x: 100, y: 50 })).toEqual({ x: 400, y: 300 })
  })

  it('已在视口内时不动，否则居中', () => {
    const viewport: Viewport = { x: 0, y: 0, zoom: 1 }
    const inside = { x: 100, y: 100, width: 50, height: 50 }
    expect(revealRect(viewport, inside, size)).toBe(viewport)
    expect(revealRect(viewport, { x: 0, y: 0, width: 50, height: 50 }, size, 10)).not.toBe(viewport)
    const moved = revealRect(viewport, { x: 1000, y: 1000, width: 100, height: 100 }, size)
    expect(worldToScreen(moved, { x: 1050, y: 1050 })).toEqual({ x: 400, y: 300 })
  })

  it('限制平移：内容至少留一截在视口内', () => {
    const content = { x: 0, y: 0, width: 400, height: 300 }
    const farRight = constrainViewport({ x: 2000, y: 0, zoom: 1 }, content, size, 48)
    expect(farRight.x).toBe(800 - 48)
    const farLeft = constrainViewport({ x: -2000, y: -2000, zoom: 1 }, content, size, 48)
    expect([farLeft.x, farLeft.y]).toEqual([48 - 400, 48 - 300])
    const fine = { x: 10, y: 10, zoom: 1 }
    expect(constrainViewport(fine, content, size, 48)).toEqual(fine)
    const tiny = constrainViewport({ x: 5000, y: 0, zoom: 1 }, { x: 0, y: 0, width: 20, height: 20 }, size, 48)
    expect(tiny.x).toBe(800 - 20)
  })
})
