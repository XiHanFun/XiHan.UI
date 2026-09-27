// 层级布局的性质：节点 API 的遍历与聚合、按父 id 组树的各种报错、矩形树图的面积与包含、分区的比例、圆堆积的包含与不相交。
import type { HierarchyNode } from '../src/layout/hierarchy'
import { describe, expect, it } from 'vitest'
import { isVizError } from '../src'
import { hierarchy, pack, packEnclose, packSiblings, partition, stratify, treemap } from '../src/layout/hierarchy'

interface Tree { name: string, value?: number, children?: Tree[] }

const TREE: Tree = {
  name: 'root',
  children: [
    { name: 'a', children: [{ name: 'a1', value: 6 }, { name: 'a2', value: 3 }, { name: 'a3', value: 1 }] },
    { name: 'b', children: [{ name: 'b1', value: 4 }, { name: 'b2', value: 2 }] },
    { name: 'c', value: 4 },
  ],
}

function build(): HierarchyNode<Tree> {
  return hierarchy(TREE).sum(d => d.value)
}

function catchViz(fn: () => unknown): { code: string, message: string } {
  try {
    fn()
  }
  catch (error) {
    if (isVizError(error))
      return { code: error.code, message: error.message }
    throw error
  }
  throw new Error('没有报错')
}

describe('层级节点', () => {
  it('深度、高度与聚合：父节点的值是子孙之和', () => {
    const root = build()
    expect(root.value).toBe(20)
    expect(root.height).toBe(2)
    expect(root.children!.map(c => [c.data.name, c.value, c.depth, c.height])).toEqual([['a', 10, 1, 1], ['b', 6, 1, 1], ['c', 4, 1, 0]])
  })

  it('三种遍历次序', () => {
    const root = build()
    const names = (visit: (cb: (n: HierarchyNode<Tree>) => void) => void): string[] => {
      const out: string[] = []
      visit(n => out.push(n.data.name))
      return out
    }
    expect(names(cb => root.each(cb))).toEqual(['root', 'a', 'b', 'c', 'a1', 'a2', 'a3', 'b1', 'b2'])
    expect(names(cb => root.eachBefore(cb))).toEqual(['root', 'a', 'a1', 'a2', 'a3', 'b', 'b1', 'b2', 'c'])
    expect(names(cb => root.eachAfter(cb))).toEqual(['a1', 'a2', 'a3', 'a', 'b1', 'b2', 'b', 'c', 'root'])
  })

  it('count、leaves、ancestors、path、links 与 sort', () => {
    const root = hierarchy(TREE).count()
    expect(root.value).toBe(6)
    expect(root.leaves().map(n => n.data.name)).toEqual(['a1', 'a2', 'a3', 'b1', 'b2', 'c'])
    const a3 = root.find(n => n.data.name === 'a3')!
    const b1 = root.find(n => n.data.name === 'b1')!
    expect(a3.ancestors().map(n => n.data.name)).toEqual(['a3', 'a', 'root'])
    expect(a3.path(b1).map(n => n.data.name)).toEqual(['a3', 'a', 'root', 'b', 'b1'])
    expect(root.links()).toHaveLength(8)
    const sorted = build().sort((x, y) => (x.value ?? 0) - (y.value ?? 0))
    expect(sorted.children!.map(n => n.data.name)).toEqual(['c', 'b', 'a'])
  })

  it('同一个对象在树上出现两次报 XH_VIZ_HIERARCHY', () => {
    const shared: Tree = { name: 'shared', value: 1 }
    const err = catchViz(() => hierarchy({ name: 'r', children: [{ name: 'x', children: [shared] }, { name: 'y', children: [shared] }] }))
    expect(err.code).toBe('XH_VIZ_HIERARCHY')
  })
})

describe('按父 id 组树', () => {
  const rows = [
    { id: 'root', parent: null },
    { id: 'a', parent: 'root' },
    { id: 'b', parent: 'root' },
    { id: 'a1', parent: 'a' },
  ]
  const opts = { id: (r: { id: string }) => r.id, parentId: (r: { parent: string | null }) => r.parent }

  it('组成一棵树，次序按行', () => {
    const root = stratify(rows, opts)
    expect(root.descendants().map(n => [n.data.id, n.depth])).toEqual([['root', 0], ['a', 1], ['b', 1], ['a1', 2]])
    expect(root.height).toBe(2)
  })

  it('多个根、父节点不存在、id 重复、成环都报错', () => {
    expect(catchViz(() => stratify([...rows, { id: 'x', parent: null }], opts)).message).toMatch(/2 个根/)
    expect(catchViz(() => stratify([...rows, { id: 'x', parent: 'nope' }], opts)).message).toMatch(/nope 不存在/)
    expect(catchViz(() => stratify([...rows, { id: 'a', parent: 'root' }], opts)).message).toMatch(/重复/)
    const cyclic = [{ id: 'root', parent: null }, { id: 'p', parent: 'q' }, { id: 'q', parent: 'p' }]
    expect(catchViz(() => stratify(cyclic, opts)).message).toMatch(/成了环/)
    expect(catchViz(() => stratify([{ id: 'p', parent: 'q' }, { id: 'q', parent: 'p' }], opts)).message).toMatch(/没有根/)
  })
})

describe('矩形树图', () => {
  function rects(root: HierarchyNode<Tree>): HierarchyNode<Tree>[] {
    return root.descendants()
  }

  it.each(['squarify', 'binary', 'slice', 'dice', 'slice-dice'] as const)('%s：叶子的面积与值成正比，子块都落在父块里、兄弟互不重叠', (tile) => {
    const root = treemap(build(), { size: [400, 300], tile })
    const total = 400 * 300
    for (const leaf of root.leaves())
      expect((leaf.x1 - leaf.x0) * (leaf.y1 - leaf.y0)).toBeCloseTo((total * leaf.value!) / 20, 6)
    for (const node of rects(root)) {
      const p = node.parent
      if (p) {
        expect(node.x0).toBeGreaterThanOrEqual(p.x0 - 1e-9)
        expect(node.x1).toBeLessThanOrEqual(p.x1 + 1e-9)
        expect(node.y0).toBeGreaterThanOrEqual(p.y0 - 1e-9)
        expect(node.y1).toBeLessThanOrEqual(p.y1 + 1e-9)
      }
      const kids = node.children ?? []
      for (let i = 0; i < kids.length; i++) {
        for (let j = i + 1; j < kids.length; j++) {
          const a = kids[i]!
          const b = kids[j]!
          const overlap = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0))
          expect(overlap).toBeLessThan(1e-6)
        }
      }
    }
  })

  it('squarify 的块接近正方：等值的 16 块铺进正方形，最差的宽高比在 φ² 以内，远好于一刀一刀地切', () => {
    const make = (): HierarchyNode<Tree> => hierarchy({ name: 'r', children: Array.from({ length: 16 }, (_, i) => ({ name: String(i), value: 1 })) } as Tree).sum(d => d.value)
    const worst = (root: HierarchyNode<Tree>): number => Math.max(...root.leaves().map(l => Math.max((l.x1 - l.x0) / (l.y1 - l.y0), (l.y1 - l.y0) / (l.x1 - l.x0))))
    expect(worst(treemap(make(), { size: [400, 400] }))).toBeLessThanOrEqual(((1 + Math.sqrt(5)) / 2) ** 2)
    expect(worst(treemap(make(), { size: [400, 400], tile: 'slice' }))).toBeCloseTo(16)
  })

  it('边距：顶部给分组标题留出位置，兄弟之间留出间隙', () => {
    const root = treemap(build(), { size: [400, 300], paddingTop: 20, paddingInner: 4, paddingOuter: 2 })
    const a = root.children![0]!
    const first = a.children![0]!
    expect(first.y0 - a.y0).toBeGreaterThanOrEqual(20 - 1e-9)
    const [x, y] = [root.children![0]!, root.children![1]!]
    const gap = Math.max(y.x0 - x.x1, y.y0 - x.y1)
    expect(gap).toBeCloseTo(4, 6)
  })

  it('没有聚合值时报错', () => {
    expect(catchViz(() => treemap(hierarchy(TREE), { size: [10, 10] })).code).toBe('XH_VIZ_INVALID_ARGUMENT')
  })
})

describe('分区', () => {
  it('每层一条等高的带，宽度与值成正比，子节点落在父节点正下方', () => {
    const root = partition(build(), { size: [200, 90] })
    const [a, b, c] = root.children!
    expect(a!.y0).toBeCloseTo(30)
    expect(a!.y1).toBeCloseTo(60)
    expect(a!.x1 - a!.x0).toBeCloseTo(100)
    expect(b!.x1 - b!.x0).toBeCloseTo(60)
    expect(c!.x1 - c!.x0).toBeCloseTo(40)
    const a1 = a!.children![0]!
    expect(a1.x0).toBeCloseTo(a!.x0)
    expect(a1.x1 - a1.x0).toBeCloseTo(60)
    expect(a1.y0).toBeCloseTo(60)
  })
})

describe('圆堆积', () => {
  it('兄弟圆两两不相交，最小外接圆包住全部', () => {
    const circles = [5, 3, 8, 2, 6, 4, 7, 1].map(r => ({ x: 0, y: 0, r }))
    const R = packSiblings(circles)
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const a = circles[i]!
        const b = circles[j]!
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(a.r + b.r - 1e-6)
      }
      expect(Math.hypot(circles[i]!.x, circles[i]!.y) + circles[i]!.r).toBeLessThanOrEqual(R + 1e-6)
    }
    const e = packEnclose(circles)!
    expect(e.r).toBeCloseTo(R, 6)
  })

  it('子圆落在父圆里，根圆铺满较短的一边；结果只由数据决定', () => {
    const root = pack(build(), { size: [300, 200], padding: 2 })
    expect(root.r).toBeCloseTo(100)
    expect([root.x, root.y]).toEqual([150, 100])
    root.each((node) => {
      if (node.parent)
        expect(Math.hypot(node.x - node.parent.x, node.y - node.parent.y) + node.r).toBeLessThanOrEqual(node.parent.r + 1e-6)
    })
    const again = pack(build(), { size: [300, 200], padding: 2 })
    expect(again.leaves().map(n => [n.x, n.y, n.r])).toEqual(root.leaves().map(n => [n.x, n.y, n.r]))
  })
})

describe('性能', () => {
  it('5 千个节点的 squarify 在 10 ms 量级', () => {
    const big: Tree = { name: 'r', children: Array.from({ length: 50 }, (_, i) => ({ name: `g${i}`, children: Array.from({ length: 100 }, (_, j) => ({ name: `n${i}-${j}`, value: ((i * 37 + j * 11) % 97) + 1 })) })) }
    const root = hierarchy(big).sum(d => d.value)
    const t0 = performance.now()
    treemap(root, { size: [1200, 800] })
    // 基准机上的目标是 10 ms；测试机负载不定，这里只挡住数量级的退化
    expect(performance.now() - t0).toBeLessThan(100)
  })
})
