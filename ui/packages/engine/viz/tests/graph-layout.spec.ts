// 关系布局的性质：力导模拟的确定性、叶序初始化、α 的衰减与收敛、连线把相连的节点拉近、电荷把节点推开、
// 向心、碰撞不重叠、钉住的节点不动、Barnes–Hut 与逐对计算一致；环形布局的等角、分组与空当。
import type { ForceLink } from '../src/layout/graph'
import { describe, expect, it } from 'vitest'
import { isVizError } from '../src'
import { circular, forceSimulation } from '../src/layout/graph'
import { integer, seeded } from './helpers/property'

/** 两团各 6 个节点：团内全连，团间只有一条连线。 */
function twoClusters(): ForceLink[] {
  const links: ForceLink[] = []
  for (const base of [0, 6]) {
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++)
        links.push({ source: base + i, target: base + j })
    }
  }
  links.push({ source: 0, target: 6 })
  return links
}

function distance(a: { x: number, y: number }, b: { x: number, y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

describe('力导模拟', () => {
  it('同样的输入永远得到同样的布局', () => {
    const a = forceSimulation(12, twoClusters())
    const b = forceSimulation(12, twoClusters())
    a.run()
    b.run()
    expect(a.nodes.map(n => [n.x, n.y])).toEqual(b.nodes.map(n => [n.x, n.y]))
  })

  it('初始位置按叶序排开：互不重合，离圆心越来越远', () => {
    const sim = forceSimulation(50, [], { center: [100, 50] })
    const r = sim.nodes.map(n => Math.hypot(n.x - 100, n.y - 50))
    for (let i = 1; i < r.length; i++)
      expect(r[i]!).toBeGreaterThan(r[i - 1]!)
  })

  it('α 约 300 轮从 1 衰减到 alphaMin 以下，run 停在那里', () => {
    const sim = forceSimulation(5, [])
    sim.tick(299)
    expect(sim.alpha()).toBeGreaterThan(0.001)
    sim.tick(2)
    expect(sim.alpha()).toBeLessThan(0.001)
    const again = forceSimulation(5, [])
    again.run()
    expect(again.alpha()).toBeLessThan(0.001)
  })

  it('团内的节点比团间的节点近；质心回到向心点', () => {
    const sim = forceSimulation(12, twoClusters(), { center: [0, 0] })
    sim.run()
    const n = sim.nodes
    const within = distance(n[1]!, n[2]!)
    const across = distance(n[1]!, n[8]!)
    expect(within).toBeLessThan(across)
    const cx = n.reduce((s, p) => s + p.x, 0) / n.length
    const cy = n.reduce((s, p) => s + p.y, 0) / n.length
    // 向心在积分之前平移：最后一轮的积分会让质心带着平均速度挪出一点点
    expect(Math.abs(cx)).toBeLessThan(1e-3)
    expect(Math.abs(cy)).toBeLessThan(1e-3)
  })

  it('没有连线时电荷把节点推开，彼此都离得比初始更远', () => {
    const sim = forceSimulation(8, [])
    const before = distance(sim.nodes[0]!, sim.nodes[1]!)
    sim.run()
    expect(distance(sim.nodes[0]!, sim.nodes[1]!)).toBeGreaterThan(before)
  })

  it('碰撞：跑完之后两两之间不小于半径之和（留一点松弛的余量）', () => {
    const random = seeded(11)
    const n = 60
    const radii = Array.from({ length: n }, () => integer(random, 4, 12))
    const sim = forceSimulation(n, [], { charge: -5, collide: i => radii[i]! })
    sim.run()
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++)
        expect(distance(sim.nodes[i]!, sim.nodes[j]!)).toBeGreaterThan((radii[i]! + radii[j]!) * 0.9)
    }
  })

  it('钉住的节点停在原地，松开后跟着模拟走', () => {
    const sim = forceSimulation(6, [{ source: 0, target: 1 }], { center: null })
    sim.fix(0, 100, 100)
    sim.tick(50)
    expect([sim.nodes[0]!.x, sim.nodes[0]!.y]).toEqual([100, 100])
    sim.release(0)
    sim.reheat(0.5)
    sim.tick(5)
    expect(sim.nodes[0]!.x).not.toBe(100)
  })

  it('近似：Barnes–Hut 与逐对计算差得不多，θ 取 0 时就是逐对', () => {
    const exact = forceSimulation(40, [], { theta: 0 })
    const approx = forceSimulation(40, [])
    exact.tick(1)
    approx.tick(1)
    const err = exact.nodes.reduce((max, n, i) => Math.max(max, Math.hypot(n.vx - approx.nodes[i]!.vx, n.vy - approx.nodes[i]!.vy)), 0)
    const scale = exact.nodes.reduce((max, n) => Math.max(max, Math.hypot(n.vx, n.vy)), 0)
    expect(err / scale).toBeLessThan(0.15)
  })

  it('朝 x 定位：分组的节点聚到各自的横坐标附近', () => {
    const sim = forceSimulation(20, [], { x: { target: i => (i < 10 ? -200 : 200), strength: 0.3 } })
    sim.run()
    const left = sim.nodes.slice(0, 10).reduce((s, n) => s + n.x, 0) / 10
    const right = sim.nodes.slice(10).reduce((s, n) => s + n.x, 0) / 10
    expect(right - left).toBeGreaterThan(200)
  })

  it('连线端点越界报 XH_VIZ_INVALID_ARGUMENT', () => {
    try {
      forceSimulation(2, [{ source: 0, target: 5 }])
      expect.unreachable()
    }
    catch (error) {
      expect(isVizError(error) && error.code).toBe('XH_VIZ_INVALID_ARGUMENT')
    }
  })

  it('性能：1 千个节点、2 千条连线同步跑完 300 轮在数百毫秒量级', () => {
    const random = seeded(3)
    const links = Array.from({ length: 2000 }, () => ({ source: integer(random, 0, 999), target: integer(random, 0, 999) })).filter(l => l.source !== l.target)
    const sim = forceSimulation(1000, links)
    const t0 = performance.now()
    sim.run()
    // 基准机上的目标是 300 ms；测试机负载不定，这里只挡住数量级的退化
    expect(performance.now() - t0).toBeLessThan(3000)
  })
})

describe('环形布局', () => {
  it('等角排在圆上，自 12 点方向顺时针', () => {
    const points = circular(4, { center: [0, 0], radius: 10 })
    expect(points.map(p => [Math.round(p.x) + 0, Math.round(p.y) + 0])).toEqual([[0, -10], [10, 0], [0, 10], [-10, 0]])
  })

  it('分组：同组的节点排在一起，组按第一次出现的先后，组间多留一份空当', () => {
    const groups = ['a', 'b', 'a', 'b', 'a']
    const points = circular(5, { radius: 10, group: i => groups[i] })
    expect(points.map(p => p.index)).toEqual([0, 2, 4, 1, 3])
    const step = points[1]!.angle - points[0]!.angle
    expect(points[3]!.angle - points[2]!.angle).toBeCloseTo(step * 2)
    // 七份：五个节点加两份空当
    expect(step).toBeCloseTo((2 * Math.PI) / 7)
  })

  it('只有一组时不留空当', () => {
    const points = circular(3, { radius: 1, group: () => 'x' })
    expect(points[1]!.angle).toBeCloseTo((2 * Math.PI) / 3)
  })
})
