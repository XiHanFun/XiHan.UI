// 直角连线路由的性质：每段水平或竖直、首末段沿端点的方向离开与进入、绕开障碍物并保持间距、
// 拐弯尽量少、找不到通路时如实标记，以及非法输入立即报错。
import type { Point, Rect } from '../src'
import type { OrthogonalRoute, RouteSide } from '../src/layout/graph'
import { describe, expect, it } from 'vitest'
import { isVizError } from '../src'
import { routeOrthogonal } from '../src/layout/graph'
import { forAll, integer } from './helpers/property'

const rect = (x: number, y: number, width: number, height: number): Rect => ({ x, y, width, height })

function expectOrthogonal(points: readonly Point[]): void {
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1]!
    const [bx, by] = points[i]!
    expect(ax === bx || ay === by).toBe(true)
    expect(ax === bx && ay === by).toBe(false)
  }
}

/** 线段与矩形外扩 margin 后的内部是否相交。 */
function hits(a: Point, b: Point, box: Rect, margin: number): boolean {
  const x0 = Math.min(a[0], b[0])
  const x1 = Math.max(a[0], b[0])
  const y0 = Math.min(a[1], b[1])
  const y1 = Math.max(a[1], b[1])
  return x0 < box.x + box.width + margin - 1e-9 && x1 > box.x - margin + 1e-9
    && y0 < box.y + box.height + margin - 1e-9 && y1 > box.y - margin + 1e-9
}

function bends(route: OrthogonalRoute): number {
  return route.points.length - 2
}

function direction(a: Point, b: Point): RouteSide {
  if (b[0] > a[0])
    return 'right'
  if (b[0] < a[0])
    return 'left'
  return b[1] > a[1] ? 'bottom' : 'top'
}

const opposite: Record<RouteSide, RouteSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

describe('直角连线路由', () => {
  it('正对的两端连成一条直线', () => {
    const route = routeOrthogonal({ source: { point: [0, 0], side: 'right' }, target: { point: [100, 0], side: 'left' } })
    expect(route).toEqual({ points: [[0, 0], [100, 0]], clear: true })
  })

  it('错开的两端走两个拐弯', () => {
    const route = routeOrthogonal({ source: { point: [0, 0], side: 'right' }, target: { point: [200, 80], side: 'left' } })
    expectOrthogonal(route.points)
    expect(bends(route)).toBe(2)
    expect(route.points[0]).toEqual([0, 0])
    expect(route.points.at(-1)).toEqual([200, 80])
  })

  it('首段沿起点的方向离开，末段沿终点的方向进入', () => {
    for (const [sourceSide, targetSide] of [['bottom', 'top'], ['right', 'top'], ['top', 'left'], ['left', 'right']] as [RouteSide, RouteSide][]) {
      const route = routeOrthogonal({
        source: { point: [0, 0], side: sourceSide },
        target: { point: [150, 120], side: targetSide },
        margin: 10,
      })
      expectOrthogonal(route.points)
      expect(direction(route.points[0]!, route.points[1]!)).toBe(sourceSide)
      expect(direction(route.points.at(-2)!, route.points.at(-1)!)).toBe(opposite[targetSide])
    }
  })

  it('绕开挡在中间的节点并保持间距', () => {
    const blocker = rect(80, 0, 40, 100)
    const route = routeOrthogonal({
      source: { point: [0, 50], side: 'right' },
      target: { point: [200, 50], side: 'left' },
      obstacles: [rect(-60, 30, 60, 40), blocker, rect(200, 30, 60, 40)],
      margin: 12,
    })
    expect(route.clear).toBe(true)
    expectOrthogonal(route.points)
    for (let i = 1; i < route.points.length; i++)
      expect(hits(route.points[i - 1]!, route.points[i]!, blocker, 12)).toBe(false)
    expect(bends(route)).toBe(4)
  })

  it('终点在起点背后时绕回来，不穿过两端的节点', () => {
    const source = rect(0, 0, 100, 40)
    const target = rect(-300, 100, 100, 40)
    const route = routeOrthogonal({
      source: { point: [100, 20], side: 'right' },
      target: { point: [-300, 120], side: 'left' },
      obstacles: [source, target],
      margin: 10,
    })
    expect(route.clear).toBe(true)
    const inner = route.points.slice(1, -1)
    for (let i = 1; i < inner.length; i++) {
      expect(hits(inner[i - 1]!, inner[i]!, source, 0)).toBe(false)
      expect(hits(inner[i - 1]!, inner[i]!, target, 0)).toBe(false)
    }
  })

  it('引出点被障碍物包住时标记为未绕开', () => {
    const route = routeOrthogonal({
      source: { point: [0, 0], side: 'right' },
      target: { point: [300, 0], side: 'left' },
      obstacles: [rect(5, -50, 100, 100)],
      margin: 10,
    })
    expect(route.clear).toBe(false)
    expectOrthogonal(route.points)
    expect(route.points[0]).toEqual([0, 0])
    expect(route.points.at(-1)).toEqual([300, 0])
  })

  it('远处的障碍物挡住近路时扩大搜索范围', () => {
    const wall = rect(80, -400, 40, 800)
    const route = routeOrthogonal({
      source: { point: [0, 0], side: 'right' },
      target: { point: [200, 0], side: 'left' },
      obstacles: [wall],
      margin: 10,
    })
    expect(route.clear).toBe(true)
    for (let i = 1; i < route.points.length; i++)
      expect(hits(route.points[i - 1]!, route.points[i]!, wall, 10)).toBe(false)
  })

  it('随机障碍：要么绕开全部障碍物，要么如实标记', () => {
    forAll(40, 11, (random) => {
      const obstacles = Array.from({ length: integer(random, 0, 8) }, () =>
        rect(integer(random, 40, 360), integer(random, -150, 150), integer(random, 10, 60), integer(random, 10, 60)))
      return { obstacles, ty: integer(random, -100, 100) }
    }, ({ obstacles, ty }) => {
      const route = routeOrthogonal({
        source: { point: [0, 0], side: 'right' },
        target: { point: [420, ty], side: 'left' },
        obstacles,
        margin: 8,
      })
      expectOrthogonal(route.points)
      if (route.clear) {
        const inner = route.points.slice(1, -1)
        for (let i = 1; i < inner.length; i++) {
          for (const box of obstacles)
            expect(hits(inner[i - 1]!, inner[i]!, box, 8)).toBe(false)
        }
      }
    })
  })

  it('同样的输入得到同样的路径', () => {
    const options = {
      source: { point: [0, 0] as Point, side: 'bottom' as const },
      target: { point: [120, 200] as Point, side: 'top' as const },
      obstacles: [rect(40, 60, 60, 60)],
    }
    expect(routeOrthogonal(options)).toEqual(routeOrthogonal(options))
  })

  it('非法输入立即报错', () => {
    const cases: (() => unknown)[] = [
      () => routeOrthogonal({ source: { point: [0, 0], side: 'center' as RouteSide }, target: { point: [1, 1], side: 'left' } }),
      () => routeOrthogonal({ source: { point: [Number.NaN, 0], side: 'right' }, target: { point: [1, 1], side: 'left' } }),
      () => routeOrthogonal({ source: { point: [0, 0], side: 'right' }, target: { point: [1, 1], side: 'left' }, margin: -1 }),
      () => routeOrthogonal({ source: { point: [0, 0], side: 'right' }, target: { point: [1, 1], side: 'left' }, bendCost: Number.POSITIVE_INFINITY }),
      () => routeOrthogonal({ source: { point: [0, 0], side: 'right' }, target: { point: [1, 1], side: 'left' }, obstacles: [rect(0, 0, -1, 1)] }),
    ]
    for (const run of cases) {
      let caught: unknown
      try {
        run()
      }
      catch (error) {
        caught = error
      }
      expect(isVizError(caught)).toBe(true)
    }
  })
})
