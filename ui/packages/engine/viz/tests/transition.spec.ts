import type { ArcMark, LineMark, Mark, RectMark, Scene } from '../src'
import { describe, expect, it } from 'vitest'
import { createScene, planTransition, sceneAt } from '../src'
import { between, forAll, integer } from './helpers/property'

const bounds = { x: 0, y: 0, width: 100, height: 100 }
const linear = (t: number): number => t
const scene = (data: Mark[], version = 1): Scene => createScene({ version, layers: { data }, bounds })
function bar(key: string, height: number, seriesId = key): RectMark {
  return {
    kind: 'rect',
    key,
    part: 'bar',
    x: 0,
    y: 100 - height,
    width: 10,
    height,
    datum: { seriesId, index: 0 },
  }
}
const find = <M extends Mark>(s: Scene, key: string): M | undefined => s.layers.data.find(m => m.key === key) as M | undefined

describe('过渡计划', () => {
  it('更新：按参数插值', () => {
    const plan = planTransition(scene([bar('a', 20)]), scene([bar('a', 60)], 2), { duration: 100, easing: linear })
    const mid = find<RectMark>(sceneAt(plan, 50), 'a')!
    expect(mid.height).toBe(40)
    expect(mid.y).toBe(60)
  })

  it('进入：柱从基线长出，不淡入', () => {
    const plan = planTransition(scene([]), scene([bar('a', 60)], 2), { duration: 100, easing: linear })
    const start = find<RectMark>(sceneAt(plan, 0), 'a')!
    expect([start.y, start.height, start.opacity]).toEqual([100, 0, 1])
    expect(find<RectMark>(sceneAt(plan, 50), 'a')!.height).toBe(30)
  })

  it('进入：扇区的结束角从起始角增长；center 从中心展开；fade 只淡入', () => {
    const slice: ArcMark = { kind: 'arc', key: 's', part: 'slice', cx: 0, cy: 0, innerRadius: 0, outerRadius: 10, startAngle: 1, endAngle: 2 }
    const grow = planTransition(scene([]), scene([slice]), { duration: 100, easing: linear })
    expect(find<ArcMark>(sceneAt(grow, 0), 's')!.endAngle).toBe(1)
    expect(find<ArcMark>(sceneAt(grow, 50), 's')!.endAngle).toBe(1.5)
    const center = planTransition(scene([]), scene([bar('a', 60)]), { duration: 100, easing: linear, enterFrom: 'center' })
    expect(find<RectMark>(sceneAt(center, 0), 'a')).toMatchObject({ x: 5, y: 70, width: 0, height: 0 })
    const fade = planTransition(scene([]), scene([bar('a', 60)]), { duration: 100, easing: linear, enterFrom: 'fade' })
    expect(find<RectMark>(sceneAt(fade, 25), 'a')).toMatchObject({ height: 60, opacity: 0.25 })
  })

  it('进入：折线与点总是淡入', () => {
    const line: LineMark = { kind: 'line', key: 'l', part: 'line', curve: 'linear', points: [{ key: 'a', x: 0, y: 0 }] }
    const plan = planTransition(scene([]), scene([line]), { duration: 100, easing: linear })
    expect(find<LineMark>(sceneAt(plan, 50), 'l')).toMatchObject({ opacity: 0.5, points: [{ key: 'a', x: 0, y: 0 }] })
  })

  it('退出：收回基线并淡出，期间不可命中，结束时移除', () => {
    const plan = planTransition(scene([bar('a', 60)]), scene([], 2), { duration: 100, easing: linear })
    const mid = find<RectMark>(sceneAt(plan, 50), 'a')!
    expect(mid).toMatchObject({ height: 30, opacity: 0.5, exiting: true })
    expect(find(sceneAt(plan, 99), 'a')).toBeDefined()
    expect(find(sceneAt(plan, 100), 'a')).toBeUndefined()
  })

  it('折线更新按点对齐，终点精确等于新点序', () => {
    const a: LineMark = { kind: 'line', key: 'l', part: 'line', curve: 'linear', points: [{ key: 'x', x: 0, y: 0 }, { key: 'y', x: 10, y: 10 }] }
    const b: LineMark = { ...a, points: [{ key: 'x', x: 0, y: 20 }, { key: 'z', x: 20, y: 0 }] }
    const plan = planTransition(scene([a]), scene([b], 2), { duration: 100, easing: linear })
    expect(find<LineMark>(sceneAt(plan, 50), 'l')!.points.map(p => p.key)).toEqual(['x', 'y', 'z'])
    expect(sceneAt(plan, 100)).toBe(plan.to)
  })

  it('中间帧带着进度与新场景的版本，终点返回新场景本身', () => {
    const next = scene([bar('a', 60)], 7)
    const plan = planTransition(scene([bar('a', 20)]), next, { duration: 200, easing: linear })
    const frame = sceneAt(plan, 50)
    expect(frame.version).toBe(7)
    expect(frame.frame).toBe(0.25)
    expect(Object.isFrozen(frame)).toBe(true)
    expect(sceneAt(plan, 500)).toBe(next)
  })

  it('按系列错开，至多 5 步；同一系列内不错开', () => {
    const series = Array.from({ length: 7 }, (_, i) => bar(`b${i}`, 50, `s${i}`))
    const plan = planTransition(scene([]), scene(series), { duration: 100, easing: linear, stagger: 10 })
    expect(plan.total).toBe(140)
    const at = sceneAt(plan, 30)
    expect(find<RectMark>(at, 'b0')!.height).toBe(15)
    expect(find<RectMark>(at, 'b2')!.height).toBe(5)
    expect(find<RectMark>(at, 'b4')!.height).toBe(0)
    expect(find<RectMark>(at, 'b6')!.height).toBe(0)
    expect(find<RectMark>(sceneAt(plan, 139), 'b6')!.height).toBeCloseTo(49.5, 9)
  })

  it('减弱动效：几何直接落到终态，只保留淡入淡出，不错开', () => {
    const plan = planTransition(scene([bar('a', 20), bar('gone', 10)]), scene([bar('a', 60), bar('new', 40)], 2), { duration: 100, easing: linear, stagger: 50, reducedMotion: true })
    expect(plan.total).toBe(100)
    const first = sceneAt(plan, 1)
    expect(find<RectMark>(first, 'a')!.height).toBe(60)
    expect(find<RectMark>(first, 'new')).toMatchObject({ height: 40, opacity: 0.01 })
    expect(find<RectMark>(first, 'gone')).toMatchObject({ height: 10, exiting: true })
  })

  it('缓动作用在每条轨迹的局部进度上', () => {
    const plan = planTransition(scene([bar('a', 0)]), scene([bar('a', 100)]), { duration: 100, easing: t => t * t })
    expect(find<RectMark>(sceneAt(plan, 50), 'a')!.height).toBe(25)
  })

  it('非法参数与别处来的计划报错', () => {
    expect(() => planTransition(scene([]), scene([]), { duration: 0, easing: linear })).toThrow(/时长/)
    expect(() => planTransition(scene([]), scene([]), { duration: 10, easing: linear, stagger: -1 })).toThrow(/错开/)
    expect(() => sceneAt({ from: scene([]), to: scene([]), total: 1 }, 0)).toThrow(/过渡计划/)
  })

  it('性质：单调缓动下每根柱的高度始终夹在新旧高度之间', () => {
    forAll(200, 151, random => ({
      from: Array.from({ length: integer(random, 1, 8) }, () => between(random, 0, 100)),
      to: Array.from({ length: integer(random, 1, 8) }, () => between(random, 0, 100)),
      t: between(random, 0, 120),
    }), ({ from, to, t }) => {
      const plan = planTransition(scene(from.map((h, i) => bar(`k${i}`, h))), scene(to.map((h, i) => bar(`k${i}`, h))), { duration: 100, easing: linear })
      for (const mark of sceneAt(plan, t).layers.data as RectMark[]) {
        const i = Number(mark.key.slice(1))
        const a = from[i] ?? 0
        const b = to[i] ?? 0
        expect(mark.height).toBeGreaterThanOrEqual(Math.min(a, b) - 1e-9)
        expect(mark.height).toBeLessThanOrEqual(Math.max(a, b) + 1e-9)
      }
    })
  })
})
