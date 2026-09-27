// 桑基布局的性质：节点值与分列、各列不重叠且在范围里、流带宽度守恒、流带两端落在节点上、成环与非法输入的报错、对齐与次序。
import type { SankeyGraph } from '../src/layout/sankey'
import { describe, expect, it } from 'vitest'
import { isVizError } from '../src'
import { sankey, sankeyLinkPath } from '../src/layout/sankey'

const NODES = ['搜索', '广告', '首页', '详情', '下单', '流失'].map(id => ({ id }))
const LINKS = [
  { source: '搜索', target: '首页', value: 60 },
  { source: '广告', target: '首页', value: 30 },
  { source: '广告', target: '详情', value: 10 },
  { source: '首页', target: '详情', value: 50 },
  { source: '首页', target: '流失', value: 40 },
  { source: '详情', target: '下单', value: 35 },
  { source: '详情', target: '流失', value: 25 },
]

function layout(options: Partial<Parameters<typeof sankey>[2]> = {}): SankeyGraph {
  return sankey(NODES, LINKS, { size: [600, 400], ...options })
}

function node(graph: SankeyGraph, id: string) {
  return graph.nodes.find(n => n.id === id)!
}

function catchViz(fn: () => unknown): { code: string, message: string, detail: Record<string, unknown> } {
  try {
    fn()
  }
  catch (error) {
    if (isVizError(error))
      return { code: error.code, message: error.message, detail: { ...error.detail } }
    throw error
  }
  throw new Error('没有报错')
}

describe('节点与分列', () => {
  it('节点值取流入与流出里较大的；深度是最长路径', () => {
    const g = layout()
    expect(node(g, '首页').value).toBe(90)
    expect(node(g, '详情').value).toBe(60)
    expect(node(g, '流失').value).toBe(65)
    expect(['搜索', '广告', '首页', '详情', '下单'].map(id => node(g, id).depth)).toEqual([0, 0, 1, 2, 3])
  })

  it('justify：没有出边的节点贴到最后一列，其余按深度；列按宽度均分', () => {
    const g = layout()
    expect(['搜索', '首页', '详情', '下单', '流失'].map(id => node(g, id).layer)).toEqual([0, 1, 2, 3, 3])
    expect(node(g, '下单').x1).toBeCloseTo(600)
    expect(node(g, '搜索').x0).toBe(0)
    expect(node(g, '首页').x1 - node(g, '首页').x0).toBe(12)
  })

  it('start 按深度分列；end 按到汇点的距离；center 让只有出边的节点紧挨着下游', () => {
    // a → b → c，a → d（d 是浅处的汇点），x → c（x 是只有出边、下游很深的源点）
    const nodes = ['a', 'b', 'c', 'd', 'x'].map(id => ({ id }))
    const links = [
      { source: 'a', target: 'b', value: 5 },
      { source: 'b', target: 'c', value: 5 },
      { source: 'a', target: 'd', value: 2 },
      { source: 'x', target: 'c', value: 3 },
    ]
    const layerOf = (align: 'justify' | 'start' | 'end' | 'center'): Record<string, number> =>
      Object.fromEntries(sankey(nodes, links, { size: [300, 200], nodeAlign: align }).nodes.map(n => [n.id, n.layer]))
    expect(layerOf('justify')).toEqual({ a: 0, b: 1, c: 2, d: 2, x: 0 })
    expect(layerOf('start')).toEqual({ a: 0, b: 1, c: 2, d: 1, x: 0 })
    expect(layerOf('end')).toEqual({ a: 0, b: 1, c: 2, d: 2, x: 1 })
    expect(layerOf('center')).toEqual({ a: 0, b: 1, c: 2, d: 1, x: 1 })
  })
})

describe('纵向排布', () => {
  it('每一列的节点都在范围里、互不重叠且至少隔一道间隙', () => {
    const g = layout({ nodePadding: 10 })
    const columns = new Map<number, typeof g.nodes>()
    for (const n of g.nodes)
      columns.set(n.layer, [...(columns.get(n.layer) ?? []), n])
    for (const column of columns.values()) {
      const sorted = [...column].sort((a, b) => a.y0 - b.y0)
      for (const n of sorted) {
        expect(n.y0).toBeGreaterThanOrEqual(-1e-6)
        expect(n.y1).toBeLessThanOrEqual(400 + 1e-6)
      }
      for (let i = 1; i < sorted.length; i++)
        expect(sorted[i]!.y0 - sorted[i - 1]!.y1).toBeGreaterThanOrEqual(10 - 1e-6)
    }
  })

  it('节点高度与值成正比，流带宽度与流量成正比且在节点上守恒', () => {
    const g = layout()
    for (const n of g.nodes)
      expect(n.y1 - n.y0).toBeCloseTo(n.value * g.ky)
    for (const l of g.links)
      expect(l.width).toBeCloseTo(l.value * g.ky)
    const home = node(g, '首页')
    expect(home.sourceLinks.reduce((s, l) => s + l.width, 0)).toBeCloseTo(home.y1 - home.y0)
  })

  it('流带两端的中线落在节点上，同一节点上的流带首尾相接、按对端的位置自上而下', () => {
    const g = layout()
    for (const l of g.links) {
      expect(l.y0 - l.width / 2).toBeGreaterThanOrEqual(l.source.y0 - 1e-6)
      expect(l.y0 + l.width / 2).toBeLessThanOrEqual(l.source.y1 + 1e-6)
      expect(l.y1 - l.width / 2).toBeGreaterThanOrEqual(l.target.y0 - 1e-6)
      expect(l.y1 + l.width / 2).toBeLessThanOrEqual(l.target.y1 + 1e-6)
    }
    const home = node(g, '首页')
    const [first, second] = home.sourceLinks
    expect(second!.y0 - second!.width / 2).toBeCloseTo(first!.y0 + first!.width / 2)
    expect(first!.target.y0).toBeLessThanOrEqual(second!.target.y0)
  })

  it('nodeSort="input"：列内保持输入的次序', () => {
    const g = sankey([{ id: 'a' }, { id: 'b' }, { id: 'x' }, { id: 'y' }], [
      { source: 'a', target: 'y', value: 10 },
      { source: 'b', target: 'x', value: 10 },
    ], { size: [300, 200], nodeSort: 'input' })
    const [x, y] = [g.nodes.find(n => n.id === 'x')!, g.nodes.find(n => n.id === 'y')!]
    expect(x.y0).toBeLessThan(y.y0)
  })

  it('流带的路径两端水平进出；vertical 横纵对调', () => {
    const g = layout()
    const l = g.links[0]!
    expect(sankeyLinkPath(l)).toBe(`M${l.source.x1},${l.y0}C${(l.source.x1 + l.target.x0) / 2},${l.y0},${(l.source.x1 + l.target.x0) / 2},${l.y1},${l.target.x0},${l.y1}`)
    expect(sankeyLinkPath(l, 'vertical').startsWith(`M${l.y0},${l.source.x1}C`)).toBe(true)
  })
})

describe('校验', () => {
  it('成环报 XH_VIZ_SANKEY_CYCLE，detail 列出环路', () => {
    const err = catchViz(() => sankey([{ id: 'a' }, { id: 'b' }, { id: 'c' }], [
      { source: 'a', target: 'b', value: 1 },
      { source: 'b', target: 'c', value: 1 },
      { source: 'c', target: 'a', value: 1 },
    ], { size: [100, 100] }))
    expect(err.code).toBe('XH_VIZ_SANKEY_CYCLE')
    expect(err.detail.cycle).toEqual(['a', 'b', 'c', 'a'])
  })

  it('未知节点、自环、负值与重复节点都报错', () => {
    expect(catchViz(() => sankey([{ id: 'a' }], [{ source: 'a', target: 'z', value: 1 }], { size: [10, 10] })).message).toMatch(/不存在/)
    expect(catchViz(() => sankey([{ id: 'a' }], [{ source: 'a', target: 'a', value: 1 }], { size: [10, 10] })).message).toMatch(/自环/)
    expect(catchViz(() => sankey([{ id: 'a' }, { id: 'b' }], [{ source: 'a', target: 'b', value: -1 }], { size: [10, 10] })).message).toMatch(/非负/)
    expect(catchViz(() => sankey([{ id: 'a' }, { id: 'a' }], [], { size: [10, 10] })).code).toBe('XH_VIZ_DUPLICATE_KEY')
  })
})

describe('性能', () => {
  it('200 个节点、1 千条流带在 20 ms 量级', () => {
    const nodes = Array.from({ length: 200 }, (_, i) => ({ id: `n${i}` }))
    const links = Array.from({ length: 1000 }, (_, k) => {
      const s = k % 150
      const t = 150 + ((k * 7) % 50)
      return { source: `n${s}`, target: `n${t}`, value: ((k * 13) % 17) + 1 }
    })
    const t0 = performance.now()
    sankey(nodes, links, { size: [1200, 800] })
    // 基准机上的目标是 20 ms；测试机负载不定，这里只挡住数量级的退化
    expect(performance.now() - t0).toBeLessThan(200)
  })
})
