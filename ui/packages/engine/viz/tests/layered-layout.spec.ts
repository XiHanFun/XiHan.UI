// 分层有向图布局的性质：层次服从连线方向、同层不重叠、跨层连线的途经点不压节点、断环只反向回边、
// 交叉数与次序一致、四个方向互为镜像或转置、同样的输入得到同样的布局，以及非法输入立即报错。
import type { LayeredLayout, LayeredLink, LayeredSize } from '../src/layout/graph'
import { describe, expect, it } from 'vitest'
import { isVizError } from '../src'
import { layered } from '../src/layout/graph'
import { forAll, integer } from './helpers/property'

const box = (width = 100, height = 40): LayeredSize => ({ width, height })
const sizes = (count: number, width = 100, height = 40): LayeredSize[] => Array.from({ length: count }, () => box(width, height))
const link = (source: number, target: number): LayeredLink => ({ source, target })

/** 同层节点按次序排开后两两之间留出 gap。 */
function expectNoOverlap(layout: LayeredLayout, nodeSizes: readonly LayeredSize[], gap: number, axis: 'x' | 'y'): void {
  const byLayer = new Map<number, LayeredLayout['nodes'][number][]>()
  for (const node of layout.nodes)
    byLayer.set(node.layer, [...(byLayer.get(node.layer) ?? []), node])
  for (const nodes of byLayer.values()) {
    nodes.sort((a, b) => a.order - b.order)
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1]!
      const b = nodes[i]!
      const half = axis === 'x'
        ? (nodeSizes[a.index]!.width + nodeSizes[b.index]!.width) / 2
        : (nodeSizes[a.index]!.height + nodeSizes[b.index]!.height) / 2
      expect(b[axis] - a[axis]).toBeGreaterThanOrEqual(half + gap - 1e-6)
    }
  }
}

describe('分层有向图布局', () => {
  it('空图', () => {
    expect(layered([], [])).toEqual({ nodes: [], links: [], width: 0, height: 0, layerCount: 0, crossings: 0 })
  })

  it('一条链自上而下排成一列，宽高包住全部节点', () => {
    const layout = layered(sizes(3), [link(0, 1), link(1, 2)], { layerGap: 50 })
    expect(layout.nodes.map(n => [n.layer, n.order, n.x, n.y])).toEqual([[0, 0, 50, 20], [1, 0, 50, 110], [2, 0, 50, 200]])
    expect([layout.width, layout.height, layout.layerCount]).toEqual([100, 220, 3])
    expect(layout.links.every(route => route.bends.length === 0 && !route.reversed)).toBe(true)
  })

  it('每层厚度取层内最厚的节点', () => {
    const layout = layered([box(100, 40), box(60, 80), box(60, 20)], [link(0, 1), link(0, 2)], { layerGap: 10 })
    expect(layout.nodes[1]!.y).toBe(40 + 10 + 40)
    expect(layout.nodes[2]!.y).toBe(layout.nodes[1]!.y)
    expect(layout.height).toBe(40 + 10 + 80)
  })

  it('跨层连线插入途经点，途经点不压在同层节点上', () => {
    const layout = layered(sizes(3), [link(0, 1), link(1, 2), link(0, 2)], { nodeGap: 20, linkGap: 10 })
    const route = layout.links[2]!
    expect(route.bends).toHaveLength(1)
    const [bx, by] = route.bends[0]!
    expect(by).toBe(layout.nodes[1]!.y)
    expect(Math.abs(bx - layout.nodes[1]!.x)).toBeGreaterThanOrEqual(50 + 10 - 1e-6)
  })

  it('环路只反向回边，途经点仍按原方向排列', () => {
    const layout = layered(sizes(4), [link(0, 1), link(1, 2), link(2, 3), link(3, 1), link(3, 0)])
    expect(layout.links.map(route => route.reversed)).toEqual([false, false, false, true, true])
    expect(layout.nodes.map(n => n.layer)).toEqual([0, 1, 2, 3])
    const back = layout.links[4]!
    expect(back.bends.map(([, y]) => y)).toEqual([layout.nodes[2]!.y, layout.nodes[1]!.y])
  })

  it('自环不影响分层也没有途经点', () => {
    const layout = layered(sizes(2), [link(0, 0), link(0, 1)])
    expect(layout.nodes.map(n => n.layer)).toEqual([0, 1])
    expect(layout.links[0]).toEqual({ index: 0, source: 0, target: 0, reversed: false, bends: [] })
  })

  it('有出线的源点被拉到其后继的上一层', () => {
    const layout = layered(sizes(5), [link(0, 1), link(1, 2), link(2, 3), link(4, 3)])
    expect(layout.nodes[4]!.layer).toBe(2)
  })

  it('孤立节点排在第 0 层', () => {
    const layout = layered(sizes(3), [link(0, 1)])
    expect(layout.nodes[2]!.layer).toBe(0)
  })

  it('树没有交叉；完全二部图 K3,3 的交叉数是 9', () => {
    const tree = layered(sizes(7), [link(0, 1), link(0, 2), link(1, 3), link(1, 4), link(2, 5), link(2, 6)])
    expect(tree.crossings).toBe(0)
    const k33: LayeredLink[] = []
    for (const a of [0, 1, 2]) {
      for (const b of [3, 4, 5])
        k33.push(link(a, b))
    }
    expect(layered(sizes(6), k33).crossings).toBe(9)
  })

  it('减少交叉：初始次序交叉的连线重排成不交叉', () => {
    const layout = layered(sizes(5), [link(0, 4), link(1, 3), link(2, 4)])
    expect(layout.crossings).toBe(0)
    expect(layout.nodes.filter(n => n.layer === 0).sort((a, b) => a.order - b.order).map(n => n.index)).toEqual([0, 2, 1])
  })

  it('四个方向互为转置或镜像', () => {
    const nodeSizes = [box(100, 40), box(60, 30), box(80, 50), box(40, 40)]
    const links = [link(0, 1), link(0, 2), link(1, 3), link(2, 3)]
    const tb = layered(nodeSizes, links)
    const bt = layered(nodeSizes, links, { direction: 'BT' })
    const lr = layered(nodeSizes.map(s => box(s.height, s.width)), links, { direction: 'LR' })
    const rl = layered(nodeSizes.map(s => box(s.height, s.width)), links, { direction: 'RL' })
    tb.nodes.forEach((node, i) => {
      expect(bt.nodes[i]!.x).toBeCloseTo(node.x)
      expect(bt.nodes[i]!.y).toBeCloseTo(tb.height - node.y)
      expect(lr.nodes[i]!.x).toBeCloseTo(node.y)
      expect(lr.nodes[i]!.y).toBeCloseTo(node.x)
      expect(rl.nodes[i]!.x).toBeCloseTo(tb.height - node.y)
    })
    expect([lr.width, lr.height]).toEqual([tb.height, tb.width])
  })

  it('同样的输入得到同样的布局', () => {
    const links = [link(0, 2), link(1, 2), link(2, 3), link(3, 0), link(1, 4), link(4, 3)]
    expect(layered(sizes(5), links)).toEqual(layered(sizes(5), links))
  })

  it('随机图：层次服从处理后的连线方向、同层不重叠、坐标有限且落在宽高内', () => {
    forAll(60, 7, (random) => {
      const count = integer(random, 1, 14)
      const linkCount = integer(random, 0, count * 2)
      const nodeSizes = Array.from({ length: count }, () => box(integer(random, 10, 120), integer(random, 10, 60)))
      const links = Array.from({ length: linkCount }, () => link(integer(random, 0, count - 1), integer(random, 0, count - 1)))
      return { nodeSizes, links }
    }, ({ nodeSizes, links }) => {
      const layout = layered(nodeSizes, links, { nodeGap: 16, linkGap: 8 })
      for (const route of layout.links) {
        if (route.source === route.target)
          continue
        const [upper, lower] = route.reversed ? [route.target, route.source] : [route.source, route.target]
        expect(layout.nodes[upper]!.layer).toBeLessThan(layout.nodes[lower]!.layer)
        expect(route.bends).toHaveLength(layout.nodes[lower]!.layer - layout.nodes[upper]!.layer - 1)
      }
      expectNoOverlap(layout, nodeSizes, 16, 'x')
      for (const node of layout.nodes) {
        const size = nodeSizes[node.index]!
        expect(node.x - size.width / 2).toBeGreaterThanOrEqual(-1e-6)
        expect(node.y - size.height / 2).toBeGreaterThanOrEqual(-1e-6)
        expect(node.x + size.width / 2).toBeLessThanOrEqual(layout.width + 1e-6)
        expect(node.y + size.height / 2).toBeLessThanOrEqual(layout.height + 1e-6)
      }
    })
  })

  it('横向布局时同层节点沿纵轴不重叠', () => {
    const nodeSizes = [box(80, 40), box(80, 60), box(80, 30), box(80, 50)]
    const layout = layered(nodeSizes, [link(0, 1), link(0, 2), link(0, 3)], { direction: 'LR', nodeGap: 12 })
    expectNoOverlap(layout, nodeSizes, 12, 'y')
  })

  it('非法输入立即报错', () => {
    const cases: (() => unknown)[] = [
      () => layered([box(-1, 1)], []),
      () => layered([box(1, Number.NaN)], []),
      () => layered(sizes(2), [link(0, 2)]),
      () => layered(sizes(2), [link(0.5, 1)]),
      () => layered(sizes(2), [], { direction: 'XY' as 'TB' }),
      () => layered(sizes(2), [], { nodeGap: -1 }),
      () => layered(sizes(2), [], { sweeps: 1.5 }),
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
